import React, { Component } from "react";

import GlobalError from "../components/GlobalError";
import MakeOrder from "./MakeOrder";
import NodeInfo from "./NodeInfo";
import Accounts from "./Accounts";
import Orders from "./Orders";
import { connect } from "react-redux";
import {
  makeOrderRequest,
  nodeAddressChanged,
  remoteAccountLoadRequest,
  takeOrderRequest
} from "../actions";

class App extends Component {
  onConnect = nodeAddress => {
    if (
      this.props.nodeAddress !== nodeAddress ||
      this.props.remoteAccountUpdateFailed
    ) {
      this.props.dispatch(nodeAddressChanged(nodeAddress));
      this.props.dispatch(remoteAccountLoadRequest(nodeAddress));
    }
  };

  onOrderMade = ({ wethAmount, zrxAmount, isBuy }) => {
    this.props.dispatch(makeOrderRequest(wethAmount, zrxAmount, isBuy));
  };

  onTakeOrder = order => {
    this.props.dispatch(takeOrderRequest(order));
  };

  render() {
    const {
      connectionError,
      nodeAddress,
      remoteAccountUpdateFailed
    } = this.props;

    return (
      <div>
        <div className="container">
          <h1>GLP Prototype</h1>
        </div>

        <NodeInfo
          endpoint={this.props.nodeAddress}
          onConnect={this.onConnect}
        />

        <Accounts />

        <Orders onTakeOrder={this.onTakeOrder} />

        <MakeOrder onSubmit={this.onOrderMade} />

        {remoteAccountUpdateFailed && (
          <GlobalError msg={"Couldn't connect to remote node, try again"} />
        )}

        {connectionError && (
          <GlobalError msg={"Error connecting with node " + nodeAddress} />
        )}
      </div>
    );
  }
}

const mapStateToProps = ({ nodeAddress, connectionError, remoteAccount }) => ({
  nodeAddress,
  connectionError,
  remoteAccountUpdateFailed: remoteAccount.loadFailed
});

export default connect(mapStateToProps)(App);
