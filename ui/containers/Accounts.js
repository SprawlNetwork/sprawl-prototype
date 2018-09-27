import React, { PureComponent } from "react";
import { connect } from "react-redux";

import GlobalError from "../components/GlobalError";

class Accounts extends PureComponent {
  render() {
    let { localAccount, remoteAccount } = this.props;

    const canShowRemoteInfo =
      !remoteAccount.loading && !remoteAccount.loadFailed;

    return (
      <>
        <div className="container mt-4">
          <h2>Accounts</h2>

          <div className="mt-4">
            <div>
              <label>Local address</label>: {localAccount.address}
            </div>
            <div>
              <label>Node's address</label>:{" "}
              {!canShowRemoteInfo ? "..." : remoteAccount.address}
            </div>
          </div>

          <div className="card-deck mt-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">ETH</h5>
                <div className="card-text">
                  <label>Balance:</label>{" "}
                  {localAccount.ethBalance === undefined
                    ? "..."
                    : localAccount.ethBalance.toString(10)}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h5 className="card-title">WETH</h5>
                <div className="card-text">
                  <label>Balance:</label> 0.1982312
                </div>
                <div className="card-text">
                  <label>Allowance:</label> ✔
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h5 className="card-title">ZRX</h5>
                <div className="card-text">
                  <label>Balance:</label> 0.19823123
                </div>
                <div className="card-text">
                  <label>Allowance:</label> <a href="#">Give allowance</a>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Node's ETH</h5>
                <div className="card-text">
                  <label>Balance:</label>{" "}
                  {!canShowRemoteInfo
                    ? "..."
                    : remoteAccount.ethBalance.toString(10)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {localAccount.address === undefined && (
          <GlobalError
            msg={"Make sure you have MetaMask installed and unlocked"}
          />
        )}
      </>
    );
  }
}

const mapStateToProps = ({ localAccount, remoteAccount }) => ({
  localAccount,
  remoteAccount
});

export default connect(mapStateToProps)(Accounts);
