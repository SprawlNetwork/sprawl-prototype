import _ from "lodash";
import { newPeer, orderUpdated, peerRemoved } from "../common/messages";
import { EthHelper } from "../common/eth";
import * as ethers from "ethers";
import { getEthereumRPCURL } from "./eth";

export default class Dex {
  constructor(wallet, networkId, peerManager, broadcastToClients) {
    this._networkId = networkId;
    this._peerManager = peerManager;

    this._ethHelper = new EthHelper(
      new ethers.providers.JsonRpcProvider(getEthereumRPCURL()),
      wallet
    );

    this._broadcastToClients = broadcastToClients;
    this._orders = new Map();
    this._wallet = wallet;
    this._peerManager.on("newPeer", peer => this._onNewPeer(peer));
    this._peerManager.on("peerRemoved", peer => this._onPeerRemoved(peer));
    this._orderToSignedMessageTransaction = new WeakMap();
    this._onlineNodeAddresses = new Set([this._wallet.address.toLowerCase()]);
  }

  _start() {
    this._updateOrdersInterval = setInterval(
      () => this._updateOwnOrdersFilling(),
      2000
    );
  }

  _stop() {
    clearInterval(this._updateOrdersInterval);
    this._updateOrdersInterval = undefined;
  }

  async getOrders() {
    return _.sortBy([...this._orders.values()], o => o.receptionDate);
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

  async sendOrder(order) {
    return await this.receiveOrder(order);
  }

  async takeOrder(orderId, signedTakeOrderTransaction) {
    if (!this._orders.has(orderId)) {
      throw new Error("Trying to take non-existent order");
    }

    const localOrder = this._orders.get(orderId);

    if (localOrder.signedTakeOrderTransaction !== undefined) {
      throw new Error("Order already taken");
    }

    this._broadcastToPeers(
      "orderTaken",
      localOrder,
      signedTakeOrderTransaction
    );

    if (this._isOwnOrder(localOrder)) {
      this._takeOwnOrder(localOrder, signedTakeOrderTransaction);
    }

    return localOrder;
  }

  async orderTaken(order, signedTakeOrderTransaction) {
    if (this._alreadyGotTakeMessage(order.id, signedTakeOrderTransaction)) {
      return;
    }

    const orderAlreadyReceived = this._orders.has(order.id);

    if (!orderAlreadyReceived) {
      this._addOrder(order);
    }

    this._setTakeMessageAsReceived(order.id, signedTakeOrderTransaction);

    const localOrder = this._orders.get(order.id);
    this._broadcastToPeers(
      "orderTaken",
      localOrder,
      signedTakeOrderTransaction
    );

    if (this._isOwnOrder(localOrder)) {
      this._takeOwnOrder(localOrder, signedTakeOrderTransaction);
    }

    return order;
  }

  async orderTakeStatusUpdate(order) {
    if (!this._orders.has(order.id)) {
      this._addOrder(order);
    }

    const localOrder = this._orders.get(order.id);

    console.log(`Received update for oder ${order.id}
filling: ${order.filling}
filled: ${order.filled}
fillingError: ${order.fillingError}
fillingTx: ${order.fillingTx}
`);

    localOrder.signedTakeOrderTransaction = order.signedTakeOrderTransaction;
    localOrder.filling = order.filling;
    localOrder.filled = order.filled;
    localOrder.fillingError = order.fillingError;
    localOrder.fillingTx = order.fillingTx;

    this._broadcastToClients(orderUpdated(localOrder));
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
    return peer
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
    this._onlineNodeAddresses.add(peer.address);

    this._addPeerOrders(peer)
      .catch(error => console.error("Error adding new peer", error))
      .then(() => {
        this._broadcastToClients(newPeer(`${peer.ip}:${peer.port}`));
      });
  }

  _onPeerRemoved(peer) {
    // This condition if for debugging, sometimes I accidentally open two nodes
    // with the same address, and without this killing one would imply having to
    // kill both of them.
    if (peer.address !== this._wallet.address.toLowerCase()) {
      this._onlineNodeAddresses.delete(peer.address);

      const orderIdsToRemove = [...this._orders.values()]
        .filter(
          o =>
            o.signedOrder.senderAddress === peer.address &&
            o.signedTakeOrderTransaction === undefined
        )
        .map(o => o.id);

      orderIdsToRemove.forEach(id => this._orders.delete(id));

      try {
        this._broadcastToClients(peerRemoved(`${peer.ip}:${peer.port}`));
      } catch (error) {
        console.error("Error removing peer", error);
      }
    }
  }

  _updateOwnOrdersFilling() {
    const orders = [...this._orders.values()].filter(
      o => this._isOwnOrder(o) && o.signedTakeOrderTransaction !== undefined
    );
    for (const order of orders) {
      this._handleOrderFilling(order);
    }
  }

  async _handleOrderFilling(order) {
    if (this._ordersBeingHandled === undefined) {
      this._ordersBeingHandled = new Set();
    }

    if (
      order.filled ||
      order.fillingError !== undefined ||
      this._ordersBeingHandled.has(order.id)
    ) {
      return;
    }

    this._ordersBeingHandled.add(order.id);

    console.log("Handling order ", order.id);

    if (!order.filling) {
      try {
        const tx = await this._ethHelper.takeOrder(
          this._wallet.address,
          order.signedTakeOrderTransaction
        );

        order.filling = true;
        order.fillingTx = tx;
      } catch (error) {
        console.error("Error sending take transaction", order.id, error);
        order.fillingError = error.toString();
        order.filling = false;
      }
    } else {
      try {
        const receipt = await this._ethHelper.waitForTxMinned(order.fillingTx);

        if (receipt.status === 0) {
          console.error("Take transaction failed", order.id);
          order.fillingError = "Take transaction failed";
          order.filling = false;
        } else {
          console.log("Order taken :)", order.id);
          console.log(
            "Is order fully filled?",
            await this._ethHelper.isOrderFilled(order.signedOrder)
          );
          order.filled = true;
          order.filling = false;
        }
      } catch (error) {
        console.error("Error waiting for take transaction", order.id, error);
        order.fillingError = error.toString();
        order.filling = false;
      }
    }

    this._ordersBeingHandled.delete(order.id);

    console.log(`Sending update for oder ${order.id}
filling: ${order.filling}
filled: ${order.filled}
fillingError: ${order.fillingError}
fillingTx: ${order.fillingTx}
`);

    this._broadcastToClients(orderUpdated(order));
    this._broadcastToPeers("orderTakeStatusUpdate", order);
  }

  _alreadyGotTakeMessage(orderId, signedTakeOrderTransaction) {
    if (!this._orders.has(orderId)) {
      return false;
    }

    const localOrder = this._orders.get(orderId);

    if (!this._orderToSignedMessageTransaction.has(localOrder)) {
      this._orderToSignedMessageTransaction.set(localOrder, []);
    }

    return this._orderToSignedMessageTransaction
      .get(localOrder)
      .some(msg =>
        _.isEqualWith(
          msg,
          signedTakeOrderTransaction,
          (a, b) => a.toString() === b.toString()
        )
      );
  }

  _addOrder(order) {
    order.receptionDate = new Date();
    this._orders.set(order.id, order);
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

  _takeOwnOrder(localOrder, signedTakeOrderTransaction) {
    if (localOrder.signedTakeOrderTransaction === undefined) {
      localOrder.signedTakeOrderTransaction = signedTakeOrderTransaction;
      this._updateOwnOrdersFilling();
    }
  }

  _isOwnOrder(localOrder) {
    return (
      localOrder.signedOrder.senderAddress ===
      this._wallet.address.toLowerCase()
    );
  }

  _setTakeMessageAsReceived(orderId, signedTakeOrderTransaction) {
    if (!this._orders.has(orderId)) {
      console.error(
        "Trying to setTakeMessageAsReceived on unreceived order",
        orderId
      );
    }

    const localOrder = this._orders.get(orderId);

    if (!this._orderToSignedMessageTransaction.has(localOrder)) {
      this._orderToSignedMessageTransaction.set(localOrder, []);
    }

    return this._orderToSignedMessageTransaction
      .get(localOrder)
      .push(signedTakeOrderTransaction);
  }
}
