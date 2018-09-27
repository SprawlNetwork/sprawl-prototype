import React, { PureComponent } from "react";
import { connect } from "react-redux";

import GlobalError from "../components/GlobalError";
import AccountCard from "../components/AccountCard";

class Accounts extends PureComponent {
  render() {
    let { localAccount, remoteAccount } = this.props;

    const isRemoteAccountReady =
      !remoteAccount.loading && !remoteAccount.loadFailed;

    const isLocalAccountReady = !!localAccount.ethBalance;

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
              {!isRemoteAccountReady ? "..." : remoteAccount.address}
            </div>
          </div>

          <div className="card-deck mt-4">
            <AccountCard
              title={"ETH"}
              isReady={isLocalAccountReady}
              balance={localAccount.ethBalance}
              withAllowance={false}
            />

            <AccountCard
              title={"WETH"}
              isReady={isLocalAccountReady}
              balance={0}
              withAllowance={true}
              hasAllowance={true}
            />

            <AccountCard
              title={"ZRX"}
              isReady={isLocalAccountReady}
              balance={1}
              withAllowance={true}
              hasAllowance={false}
            />

            <AccountCard
              title={"Node's ETH"}
              isReady={isRemoteAccountReady}
              balance={remoteAccount.ethBalance}
              withAllowance={false}
            />
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
