"use strict";
const network = require("./network");
const chalk = require("chalk");
const { encode } = require("../common/messages");
const { Dex } = require("./dex");
const { PeerManager } = require("./peers");
const { RPCServer } = require("./rpc");

const DEFUALT_NODE_PORT = 1337;

class Node {
  constructor() {
    this._peerManager = new PeerManager();
    this._rpcServer = new RPCServer();
  }

  async _getRPCPort() {
    if (this._port === undefined) {
      this._port = await network.getAvailablePort(DEFUALT_NODE_PORT);
    }

    return this._port;
  }

  async _initPeerDiscovery() {
    const port = await this._getRPCPort();
    await this._peerManager.start(port);
  }

  async _stopPeerDiscovery() {
    await this._peerManager.stop();
  }

  async _startRPC() {
    const port = await this._getRPCPort();
    const dex = new Dex(this._peerManager, msg =>
      this._rpcServer.bloadcastToClients(encode(msg))
    );
    await this._rpcServer.start(port, dex);
  }

  async _stopRPC() {
    await this._rpcServer.stop();
  }

  async start() {
    try {
      await this._startRPC();
      await this._initPeerDiscovery();

      console.log(
        chalk.green.bold(
          `Open http://localhost:8080/?127.0.0.1:${await this._getRPCPort()} to connect to this node`
        )
      );
    } catch (error) {
      console.error("Error starting node", error);
      await this.stop();
    }
  }

  async stop() {
    await this._stopPeerDiscovery();
    await this._stopRPC();
  }
}

module.exports = { Node };
