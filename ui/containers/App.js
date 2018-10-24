import React, { Component } from "react";

import { GlobalError } from "../components/GlobalError";
import {
  makeOrderRequest,
  nodeAddressChanged,
  connectionToNodeRequested,
  takeOrderRequest,
  tokenSetAllowanceErrorDismiss,
  tokenFaucetErrorDismiss
} from "../actions";
import { UnlockMetaMaskMessage } from "../components/UnlockMetaMaskMessage";
import {
  connectedToNode,
  couldNotConnectToNode,
  isMetaMaskLoading,
  lostConnectionToNode,
  metaMaskInWrongNetwork,
  metaMaskUnlocked,
  nodeAddress,
  remoteNetworkId
} from "../selectors";
import { ChangeMetaMaskNetwork } from "../components/ChangeMetaMaskNetwork";
import { AllowanceError } from "../components/AllowanceError";
import { LoadingMessage } from "../components/LoadingMessage";
import { connectSelectors } from "../utils";
import { FaucetError } from "../components/FaucetError";
import { Notifications } from "./Notifications";
import { Orders } from "./Orders";
import { Accounts } from "./Accounts";
import { NodeInfo } from "./NodeInfo";
import { MakeOrder } from "./MakeOrder";

class AppComponent extends Component {
  onConnect = nodeAddress => {
    if (this.props.nodeAddress !== nodeAddress || !this.props.connectedToNode) {
      this.props.dispatch(nodeAddressChanged(nodeAddress));
      this.props.dispatch(connectionToNodeRequested(nodeAddress));
    }
  };

  onOrderMade = ({
    makerAssetAddress,
    makerAssetAmount,
    takerAssetAddress,
    takerAssetAmount
  }) => {
    this.props.dispatch(
      makeOrderRequest(
        makerAssetAddress,
        makerAssetAmount,
        takerAssetAddress,
        takerAssetAmount
      )
    );
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

        {Object.values(this.props.tokens).map(t => (
          <AllowanceError
            key={t.address}
            isOpen={t.allowanceError !== undefined}
            dismiss={() =>
              this.props.dispatch(tokenSetAllowanceErrorDismiss(t.address))
            }
          />
        ))}

        {Object.values(this.props.tokens)
          .filter(t => t.hasFaucet)
          .map(t => (
            <FaucetError
              key={t.address}
              isOpen={t.faucetError !== undefined}
              dismiss={() =>
                this.props.dispatch(tokenFaucetErrorDismiss(t.address))
              }
            />
          ))}
      </>
    );
  }
}

export const App = connectSelectors({
  nodeAddress,
  metaMaskUnlocked,
  metaMaskInWrongNetwork,
  connectedToNode,
  couldNotConnectToNode,
  lostConnectionToNode,
  remoteNetworkId,
  isMetaMaskLoading,
  tokens: state => state.tokens
})(AppComponent);
