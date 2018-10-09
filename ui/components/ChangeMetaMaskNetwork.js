import React, { Component } from "react";

const ROPSTEN_NETWORK_ID = 3;

export default class ChangeMetaMaskNetwork extends Component {
  render() {
    return (
      <div className="overlay-message">
        <div>
          <h2>
            Please change the network in MetaMask to{" "}
            {this.getTargetNetworkName()}
          </h2>
        </div>
      </div>
    );
  }

  getTargetNetworkName() {
    if (this.props.remoteNetworkId === ROPSTEN_NETWORK_ID) {
      return "Ropsten";
    }

    return "network 50 on localhost:8545";
  }
}
