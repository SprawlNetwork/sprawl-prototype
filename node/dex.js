"use strict";

const _ = require("lodash");

class Dex {
  constructor(peerManager) {
    this._peerManager = peerManager;
    this._orders = new Map();
    this._address = "0x413728293b82f3bf40357e1f63bb563058db03a1";
    this._peerManager.on("newPeer", peer => this._addPeerOrders(peer));
  }

  _broadcast(funcName, ...params) {
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
      throw new Error("Invalid order ", order);
    }

    if (!this._orders.has(order.id)) {
      this._addOrder(order);
      this._broadcast("receiveOrder", order);
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

    this._broadcast("tookOrder", receivedOrder);

    return localOrder;
  }

  async tookOrder(order) {
    if (this._orders.get(order.id).taker === undefined) {
      this._orders.get(order.id).taker = order.taker;
      this._broadcast("tookOrder", order);
    }
  }

  async getAddress() {
    return this._address;
  }

  _isValidOrder(order) {
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
}

module.exports = { Dex };
