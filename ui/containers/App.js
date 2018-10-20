import React, { Component } from "react";

import GlobalError from "../components/GlobalError";
import MakeOrder from "./MakeOrder";
import NodeInfo from "./NodeInfo";
import Accounts from "./Accounts";
import Orders from "./Orders";
import {
  makeOrderRequest,
  nodeAddressChanged,
  connectionToNodeRequested,
  takeOrderRequest,
  wethAllowanceSettingErrorDismiss,
  zrxAllowanceSettingErrorDismiss
} from "../actions";
import Notifications from "./Notifications";
import UnlockMetaMaskMessage from "../components/UnlockMetaMaskMessage";
import {
  connectedToNode,
  couldNotConnectToNode,
  hasWethAllowanceError,
  hasZrxAllowanceError,
  isMetaMaskLoading,
  lostConnectionToNode,
  metaMaskInWrongNetwork,
  metaMaskUnlocked,
  nodeAddress,
  remoteNetworkId
} from "../selectors";
import ChangeMetaMaskNetwork from "../components/ChangeMetaMaskNetwork";
import AllowanceError from "../components/AllowanceError";
import LoadingMessage from "../components/LoadingMessage";
import { connectSelectors } from "../redux";

class App extends Component {
  onConnect = nodeAddress => {
    if (this.props.nodeAddress !== nodeAddress || !this.props.connectedToNode) {
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
      remoteNetworkId,
      hasWethAllowanceError,
      hasZrxAllowanceError,
      isMetaMaskLoading
    } = this.props;

    if (isMetaMaskLoading) {
      return <LoadingMessage />;
    }

    if (metaMaskInWrongNetwork) {
      return <ChangeMetaMaskNetwork remoteNetworkId={remoteNetworkId} />;
    }

    if (!metaMaskUnlocked) {
      return <UnlockMetaMaskMessage />;
    }

    return (
      <>
        <div>
          <div className="container">
            <h1>Sprawl</h1>
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

        <AllowanceError
          isOpen={hasWethAllowanceError}
          dismiss={() =>
            this.props.dispatch(wethAllowanceSettingErrorDismiss())
          }
        />

        <AllowanceError
          isOpen={hasZrxAllowanceError}
          dismiss={() => this.props.dispatch(zrxAllowanceSettingErrorDismiss())}
        />
      </>
    );
  }
}

export default connectSelectors({
  nodeAddress,
  metaMaskUnlocked,
  metaMaskInWrongNetwork,
  connectedToNode,
  couldNotConnectToNode,
  lostConnectionToNode,
  remoteNetworkId,
  hasWethAllowanceError,
  hasZrxAllowanceError,
  isMetaMaskLoading
})(App);
