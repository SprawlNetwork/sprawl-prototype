"use strict";

const EventEmitter = require("events");
const { RPCClient } = require("./rpc");
const net = require("net");
const Bonjour = require("bonjour");
const _ = require("lodash");
const network = require("./network");

const KEEP_ALIVE_INTERVAL = 2000;
const MAX_PING_ERRORS = 5;

class Peer {
  constructor(localPeerName, ip, port) {
    this.ip = ip;
    this.port = port;
    this._rpcClient = new RPCClient(localPeerName, ip, port);
  }

  async call(funcName, ...params) {
    return this._rpcClient.call(funcName, ...params);
  }

  inspect() {
    return `${this.ip}:${this.port}`;
  }
}

class PeerManager extends EventEmitter {
  constructor() {
    super();
    this._peers = [];
    this._peersErrorCount = new WeakMap();
  }

  async start(localPort) {
    if (this._bonjour) {
      await this.stop();
    }

    this._localPort = localPort;
    this._bonjour = Bonjour();
    this._publishPeer();
    this._listenForPeers();
    this._startKeepAlive();
  }

  stop() {
    if (this._bonjour === undefined) {
      return;
    }

    this._stopKeepAlive();

    return new Promise((resolve, reject) => {
      this._bonjour.unpublishAll(() => {
        this._peers = [];
        this._peersErrorCount = new WeakMap();
        this._bonjour = undefined;
        resolve();
      });
    });
  }

  getPeers() {
    return this._peers;
  }

  isSelfPeer(peer) {
    return network.isLocalIp(peer.ip) && peer.port === this._localPort;
  }

  _getPeerName() {
    return "GLP:" + network.getFirstLocalIp() + ":" + this._localPort;
  }

  _getPeerBonjourType() {
    return "GLP";
  }

  _publishPeer() {
    this._service = this._bonjour.publish({
      name: this._getPeerName(),
      type: this._getPeerBonjourType(),
      port: this._localPort
    });
  }

  _listenForPeers() {
    this._browser = this._bonjour.find({ type: this._getPeerBonjourType() });

    this._browser.on("up", service => {
      const peer = this._bonjourServiceToPeer(service);

      if (!this.isSelfPeer(peer)) {
        console.log("Found GLP node:", peer);
        this._addPeer(peer);
      }
    });

    this._browser.on("down", service => {
      const peer = this._bonjourServiceToPeer(service);

      if (!this.isSelfPeer(peer)) {
        console.log("GLP node down:", peer);
        this._removePeer(peer);
      }
    });
  }

  _addPeer(peer) {
    this.emit("newPeer", peer);
    this._peers.push(peer);
  }

  _removePeer(peer) {
    _.remove(this._peers, p => _.isEqual(p, peer));
  }

  _bonjourServiceToPeer(service) {
    const ip = service.addresses.filter(addr => net.isIPv4(addr))[0];
    const port = service.port;

    return new Peer(this._getPeerName(), ip, port);
  }

  _startKeepAlive() {
    this._keepAliveInterval = setInterval(() => {
      this.getPeers().forEach(p => this._pingPeer(p));
    }, KEEP_ALIVE_INTERVAL);
  }

  _stopKeepAlive() {
    if (this._keepAliveInterval) {
      clearInterval(this._keepAliveInterval);
      this._keepAliveInterval = undefined;
    }
  }

  async _pingPeer(peer) {
    try {
      await this._sendPing(peer);
      this._peersErrorCount.set(peer, 0);
      return;
    } catch (err) {
      const current = this._peersErrorCount.get(peer) || 0;
      this._peersErrorCount.set(peer, current + 1);
    }

    if (this._peersErrorCount.get(peer) > MAX_PING_ERRORS) {
      this._dropPeer(peer);
    }
  }

  async _sendPing(peer) {
    await peer.call("ping", network.getFirstLocalIp(), this._localPort);
  }

  _dropPeer(peer) {
    console.log("Dropping peer", peer);
    this._removePeer(peer);
  }
}

module.exports = { Peer, PeerManager };
