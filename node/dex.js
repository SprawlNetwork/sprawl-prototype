import _ from "lodash";
import { newPeer, peerRemoved } from "../common/messages";

export default class Dex {
  constructor(wallet, networkId, peerManager, broadcastToClients) {
    this._networkId = networkId;
    this._peerManager = peerManager;
    this._broadcastToClients = broadcastToClients;
    this._orders = new Map();
    this._wallet = wallet;
    this._peerManager.on("newPeer", peer => this._onNewPeer(peer));
    this._peerManager.on("peerRemoved", peer => this._onPeerRemoved(peer));
  }

  _broadcastToPeers(funcName, ...params) {
    this._peerManager
      .getPeers()
      .forEach(p =>
        p
          .call(funcName, ...params)
          .catch(err =>
            console.warn(`Error calling ${funcName} with peer ${p}:`, err)
          )
      );
  }

  async getOrders() {
    return _.sortBy(Array.from(this._orders.values()), o => o.receptionDate);
  }

  async receiveOrder(order) {
    if (!this._isValidOrder(order)) {
      throw new Error("Invalid order " + order);
    }

    if (!this._orders.has(order.id)) {
      this._addOrder(order);
      this._broadcastToPeers("receiveOrder", order);
    }

    return order;
  }

  _addOrder(order) {
    order.receptionDate = new Date();
    this._orders.set(order.id, order);
  }

  async sendOrder(order) {
    return await this.receiveOrder(order);
  }

  async takeOrder(receivedOrder) {
    if (!this._orders.has(receivedOrder.id)) {
      throw new Error("Trying to take non-existent order");
    }

    const localOrder = this._orders.get(receivedOrder.id);

    if (localOrder.taker && localOrder.taker !== receivedOrder.taker) {
      throw new Error("Order already taken");
    }

    localOrder.taker = receivedOrder.taker;

    this._broadcastToPeers("tookOrder", receivedOrder);

    return localOrder;
  }

  async tookOrder(order) {
    if (this._orders.get(order.id).taker === undefined) {
      this._orders.get(order.id).taker = order.taker;
      this._broadcastToPeers("tookOrder", order);
    }
  }

  async faucet(address) {
    const {
      shouldSetupFixtureData,
      sendEtherFromPredefinedAccounts,
      sendWethFromPredefinedAccounts
    } = require("./fixture");

    if (!shouldSetupFixtureData()) {
      throw new Error("No faucet in this network");
    }

    await sendEtherFromPredefinedAccounts(address, 1e18);
    await sendWethFromPredefinedAccounts(address, 1e18);
  }

  async getNodeInfo() {
    return { networkId: this._networkId, address: this._wallet.address };
  }

  _isValidOrder(_order) {
    return true;
  }

  _addPeerOrders(peer) {
    peer
      .call("getOrders")
      .then(orders => {
        for (const order of orders) {
          if (this._orders.has(order.id)) {
            continue;
          }

          this._addOrder(order);
        }
      })
      .catch(error => console.warn("Error getting orders from ", peer, error));
  }

  _onNewPeer(peer) {
    this._addPeerOrders(peer);
    this._broadcastToClients(newPeer(`${peer.ip}:${peer.port}`));
  }

  _onPeerRemoved(peer) {
    this._broadcastToClients(peerRemoved(`${peer.ip}:${peer.port}`));
  }
}
