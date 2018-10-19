import React, { Component } from "react";

export default class UnlockMetaMaskMessage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showUnlockButton: false
    };

    if (window.ethereum) {
      if (window.ethereum.isMetaMask) {
        if (window.ethereum.isApproved) {
          window.ethereum
            .isApproved()
            .then(v => this.setState({ showUnlockButton: !v }));
        } else {
          this.state.showUnlockButton = false;
        }
      } else {
        this.state.showUnlockButton = true;
      }
    }
  }

  render() {
    return (
      <div className="overlay-message">
        <div>
          <h2>Please unlock MetaMask to continue</h2>
          <div>
            <br />
            <br />
            <br />
            {this.state.showUnlockButton && (
              <button
                className="btn btn-primary"
                onClick={() => window.ethereum.enable()}
              >
                Unlock
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}
