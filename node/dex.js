"use strict";

const _ = require("lodash");

const sampleOrder = {
  maker: "123",
  taker: "123",
  weth: 123,
  zrx: 123,
  receptionDate: new Date(),
  expirationDate: new Date()
};

class Dex {
  constructor(peerManager) {
    this._peerManager = peerManager;
    this._orders = [];
    this._address = _.random(0, 10000000, false);
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
