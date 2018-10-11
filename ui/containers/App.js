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
  connectionToNodeRequested,
  takeOrderRequest
} from "../actions";
import Notifications from "./Notifications";
import UnlockMetaMaskMessage from "../components/UnlockMetaMaskMessage";
import {
  couldNotConnectToNode,
  lostConnectionToNode,
  metaMaskInWrongNetwork,
  metaMaskUnlocked
} from "../selectors";
import ChangeMetaMaskNetwork from "../components/ChangeMetaMaskNetwork";

class App extends Component {
  onConnect = nodeAddress => {
    if (this.props.nodeAddress !== nodeAddress || this.props.remoteAccount) {
      this.props.dispatch(nodeAddressChanged(nodeAddress));
      this.props.dispatch(connectionToNodeRequested(nodeAddress));
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
      nodeAddress,
      metaMaskUnlocked,
      couldNotConnectToNode,
      lostConnectionToNode,
      metaMaskInWrongNetwork,
      remoteNetworkId
    } = this.props;

    return (
      <>
        {!metaMaskUnlocked && <UnlockMetaMaskMessage />}

        {metaMaskUnlocked &&
          metaMaskInWrongNetwork && (
            <ChangeMetaMaskNetwork remoteNetworkId={remoteNetworkId} />
          )}

        <div>
          <div className="container">
            <h1>GLP Prototype</h1>
          </div>

          <NodeInfo endpoint={nodeAddress} onConnect={this.onConnect} />

          <Accounts />

          <Orders onTakeOrder={this.onTakeOrder} />

          <MakeOrder onSubmit={this.onOrderMade} />

          {couldNotConnectToNode && (
            <GlobalError msg={"Couldn't connect to remote node, try again"} />
          )}

          {lostConnectionToNode && (
            <GlobalError msg={"Error connecting with node " + nodeAddress} />
          )}
        </div>
        <Notifications />
      </>
    );
  }
}

const mapStateToProps = state => ({
  nodeAddress: state.nodeConnection.address,
  remoteAccount: state.remote,
  metaMaskUnlocked: metaMaskUnlocked(state),
  metaMaskInWrongNetwork: metaMaskInWrongNetwork(state),
  couldNotConnectToNode: couldNotConnectToNode(state),
  lostConnectionToNode: lostConnectionToNode(state),
  remoteNetworkId: state.networks.remote.networkId
});

export default connect(mapStateToProps)(App);
