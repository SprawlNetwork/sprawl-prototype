"use strict";

class Dex {
  constructor(peerManager) {
    this._peerManager = peerManager;
    this._orders = [];
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
    return this._orders;
  }

  async receiveOrder(order) {
    if (!this._isValidOrder(order)) {
      throw new Error("Invalid order ", order);
    }

    this._orders.push(order);
    this._broadcast("receiveOrder", order);
  }

  async sendOrder(order) {
    // TODO: This is called by the user, it's not quiet the same than receive
    return await this.receiveOrder(order);
  }

  async takeOrder(order) {
    // TODO: flag it as taken?
  }
}

module.exports = { Dex };
