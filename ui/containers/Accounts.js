import React, { PureComponent } from "react";
import { connect } from "react-redux";

import AccountCard from "../components/AccountCard";
import Faucet from "../components/Faucet";

class Accounts extends PureComponent {
  render() {
    let { localAccount, remoteAccount } = this.props;

    return (
      <>
        <div className="container mt-4">
          <h2>Accounts</h2>

          <div className="mt-4">
            <div>
              <label>Local address</label>: {localAccount.address} <Faucet />
            </div>
            <div>
              <label>Node&apos;s address</label>:{" "}
              {remoteAccount.address === undefined
                ? "..."
                : remoteAccount.address}
            </div>
          </div>

          <div className="card-deck mt-4">
            <AccountCard
              title={"ETH"}
              balance={localAccount.ethBalance}
              withAllowance={false}
            />

            <AccountCard
              title={"WETH"}
              balance={localAccount.wethBalance}
              withAllowance={true}
              allowance={localAccount.wethAllowance}
            />

            <AccountCard
              title={"ZRX"}
              balance={localAccount.zrxBalance}
              withAllowance={true}
              allowance={localAccount.zrxAllowance}
            />

            <AccountCard
              title={"Node's ETH"}
              balance={remoteAccount.ethBalance}
              withAllowance={false}
            />
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = ({ localAccount, remoteAccount }) => ({
  localAccount,
  remoteAccount
});

export default connect(mapStateToProps)(Accounts);
