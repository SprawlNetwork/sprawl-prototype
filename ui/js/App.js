import React, { Component } from "react";
import * as datefns from "date-fns";
import * as _ from "lodash";

import { GlobalError } from "./GlobalError";
import { MakeOrder } from "./MakeOrder";
import { NodeInfo } from "./NodeInfo";
import { Accounts } from "./Accounts";
import { Orders } from "./Orders";
import { RPCClient } from "./rpc";

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      endpoint:
        (window.location.search && window.location.search.substr(1)) ||
        "127.0.0.1:1337",
      nodeAddress: undefined,
      localAddress: undefined,
      orders: [],
      connectionError: false,
      noWeb3: false,
      makeOrderError: undefined
    };
  }

  componentDidMount() {
    this.getNodeAddress(this.state.endpoint);
    this.loadLocalAccount();
    this.setupConnectionStateInterval();
    this.setupOrdersUpdateInterval();
  }

  componentWillUnmount() {
    this.removeConnectionStateInterval();
    this.removeOrdersUpdateInterval();
  }

  onEndpointChanged = endpoint => {
    this.setState({ endpoint: endpoint }, () => this.getNodeAddress(endpoint));
  };

  onOrderMade = ({ wethAmount, zrxAmount, isBuy }) => {
    const now = new Date();

    return this.callNode("sendOrder", {
      id: this.state.localAddress + _.random(0, 123123),
      weth: wethAmount,
      zrx: zrxAmount,
      buysZrx: isBuy,
      maker: this.state.localAddress,
      creationDate: now,
      expirationDate: datefns.addDays(now, 1)
    })
      .then(order => {
        this.setState({ orders: [...this.state.orders, order] });
        this.setState({ makeOrderError: undefined });
      })
      .catch(error => {
        this.setState({ makeOrderError: error });
        return Promise.reject(error);
      });
  };

  onTakeOrder = order => {
    const takenOrder = { ...order, taker: this.state.localAddress };
    this.callNode("takeOrder", takenOrder).then(order =>
      this.setState({
        orders: [...this.state.orders.filter(o => o.id !== order.id), order]
      })
    );
  };

  render() {
    const { orders, endpoint, connectionError } = this.state;

    return (
      <div>
        <div className="container">
          <h1>GLP Prototype</h1>
        </div>

        <NodeInfo
          endpoint={endpoint}
          onEndpointChanged={this.onEndpointChanged}
        />

        <Accounts
          nodeAddress={this.state.nodeAddress}
          localAddress={this.state.localAddress}
        />

        <Orders
          orders={orders}
          localAddress={this.state.localAddress}
          onTakeOrder={this.onTakeOrder}
        />

        <MakeOrder
          onOrderMade={this.onOrderMade}
          error={this.state.makeOrderError}
        />

        {connectionError && (
          <GlobalError msg={"Error connecting with node " + endpoint} />
        )}

        {this.state.noWeb3 && (
          <GlobalError
            msg={"Make sure you have MetaMask installed and unlocked"}
          />
        )}
      </div>
    );
  }

  getNodeAddress() {
    // If this fails it may not update
    this.callNode("getAddress").then(addr =>
      this.setState({ nodeAddress: addr })
    );
  }

  loadLocalAccount() {
    if (window.web3 === undefined || window.web3.eth.accounts.length === 0) {
      this.setState({ noWeb3: true, localAddress: undefined });
      window.setTimeout(() => this.loadLocalAccount(), 1000);
      return;
    }

    this.setState({ noWeb3: false, localAddress: window.web3.eth.accounts[0] });
  }

  callNode(funcName, ...params) {
    const client = new RPCClient(this.state.endpoint);

    return client.call(funcName, ...params);
  }

  setupConnectionStateInterval() {
    const TIME_BETWEEN_PINGS = 5000;
    const updateConnectionState = () => {
      this.callNode("ping")
        .then(
          () =>
            this.state.connectionError &&
            this.setState({ connectionError: false })
        )
        .catch(
          () =>
            this.state.connectionError ||
            this.setState({ connectionError: true })
        )
        .then(() => setTimeout(updateConnectionState, TIME_BETWEEN_PINGS));
    };

    this._connectionStateInterval = setTimeout(updateConnectionState, 0);
  }

  removeConnectionStateInterval() {
    if (this._connectionStateInterval !== undefined) {
      clearTimeout(this._connectionStateInterval);
      this._connectionStateInterval = undefined;
    }
  }

  setupOrdersUpdateInterval() {
    const TIME_BETWEEN_UPDATES = 1000;
    const updateOrders = () => {
      this.callNode("getOrders")
        .then(orders => {
          if (this.hasNewOrdersOrUpdatedOrders(orders)) {
            this.setState({ orders });
          }
        })
        .catch(() => {})
        .then(() => setTimeout(updateOrders, TIME_BETWEEN_UPDATES));
    };

    this._updateOrdersInterval = setTimeout(updateOrders, 0);
  }

  removeOrdersUpdateInterval() {
    if (this._updateOrdersInterval !== undefined) {
      clearTimeout(this._updateOrdersInterval);
      this._updateOrdersInterval = undefined;
    }
  }

  hasNewOrdersOrUpdatedOrders(orders) {
    if (orders.length !== this.state.orders.length) {
      return true;
    }

    return !_.isEqual(orders.sort(), this.state.orders.sort());
  }
}
