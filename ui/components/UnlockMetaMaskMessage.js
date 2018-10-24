import React, { Component } from "react";

export class UnlockMetaMaskMessage extends Component {
  componentDidMount() {
    window.ethereum.enable();
  }

  render() {
    return (
      <div className="overlay-message">
        <div>
          <h2>Please unlock MetaMask to continue</h2>
        </div>
      </div>
    );
  }
}
