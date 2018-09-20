import React, { Component } from "react";
import * as datefns from "date-fns";
import jaysonBrowserClient from "jayson/lib/client/browser";

import { GlobalError } from "./GlobalError";
import { MakeOrder } from "./MakeOrder";
import { NodeInfo } from "./NodeInfo";
import { Accounts } from "./Accounts";
import { Orders } from "./Orders";

class RPCClient {
  constructor(address) {
    if (!address.startsWith("http://")) {
      address = "http://" + address;
    }

    this._client = jaysonBrowserClient((request, callback) => {
      const options = {
        method: "POST",
        body: request,
        headers: {
          "Content-Type": "application/json"
        }
      };

      fetch(address, options)
        .then(function(res) {
          return res.text();
        })
        .then(function(text) {
          callback(null, text);
        })
        .catch(function(err) {
          callback(err);
        });
    });
  }

  async call(funcName, ...params) {
    return await new Promise((resolve, reject) => {
      this._client.request(funcName, params, (err, error, result) => {
        if (err) {
          reject(err);
          return;
        }

        if (error) {
          reject(new Error(`RPCError[${error.code}]: ${error.message}`));
          return;
        }

        console.log(err, error, result);
        console.log(result);
        resolve(result);
      });
    });
  }
}

export default class App extends Component {
  constructor() {
    super();

    this.state = {
      nodeAddress: "127.0.0.1:1337",
      orders: [
        {
          id: 1,
          maker: "A",
          taker: "B",
          weth: 123,
          zrx: 123,
          receptionDate: new Date(),
          expirationDate: datefns.addDays(new Date(), 1)
        },
        {
          id: 2,
          maker: "A",
          taker: undefined,
          weth: 123,
          zrx: 123,
          receptionDate: new Date(),
          expirationDate: datefns.addDays(new Date(), 1)
        },
        {
          id: 3,
          maker: "A",
          taker: "B",
          weth: 123,
          zrx: 123,
          receptionDate: new Date(),
          expirationDate: datefns.subDays(new Date(), 1)
        },
        {
          id: 4,
          maker: "A",
          taker: undefined,
          weth: 123,
          zrx: 123,
          receptionDate: new Date(),
          expirationDate: datefns.subDays(new Date(), 1)
        }
      ],
      connectionError: false
    };
  }

  onAddressChanged = addr => {
    console.log(addr);
    this.setState({ nodeAddress: addr });
    this.getNodeAddress(addr);
    console.log(addr);
  };

  render() {
    const { orders, nodeAddress, connectionError } = this.state;

    return (
      <div>
        <div className="container">
          <h1>GLP Prototype</h1>
        </div>

        <NodeInfo
          nodeAddress={nodeAddress}
          onAddressChanged={this.onAddressChanged}
        />

        <Accounts />

        <Orders orders={orders} />

        <MakeOrder />

        {connectionError && (
          <GlobalError msg={"Error connecting with node " + nodeAddress} />
        )}
      </div>
    );
  }

  getNodeAddress(addr) {
    const client = new RPCClient(addr);
    client
      .call("getAddress")
      .then(address => {
        this.setState({ nodeAddress: address, connectionError: false });
        console.log("A", address);
      })
      .catch(err => {
        console.warn("Error contacting node", err);
        this.setState({ connectionError: true });
      });
  }
}
