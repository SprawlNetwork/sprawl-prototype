import React, { PureComponent } from "react";
import { connect } from "react-redux";

import AccountCard from "../components/AccountCard";
import Faucet from "../components/Faucet";
import {
  localAccountWethAllowanceRequest,
  localAccountZrxAllowanceRequest
} from "../actions";

class Accounts extends PureComponent {
  render() {
    let { localAccount, remoteAccount } = this.props;

    return (
      <>
        <div className="container mt-4">
          <h2>Accounts</h2>

          <div className="mt-4">
            <div>
              <label>Local address</label>: {localAccount.address}
            </div>
            <div>
              <label>Node&apos;s address</label>:{" "}
              {remoteAccount.address === undefined
                ? "..."
                : remoteAccount.address}
            </div>
          </div>

          <Faucet />

          <div className="card-deck mt-4">
            <AccountCard
              symbol={"ETH"}
              balance={localAccount.ethBalance}
              withAllowance={false}
            />

            <AccountCard
              symbol={"WETH"}
              balance={localAccount.wethBalance}
              withAllowance={true}
              allowance={localAccount.wethAllowance}
              waitingAllowance={localAccount.wethAllowanceWaiting}
              giveAllowance={() =>
                this.props.dispatch(localAccountWethAllowanceRequest())
              }
            />

            <AccountCard
              symbol={"ZRX"}
              balance={localAccount.zrxBalance}
              withAllowance={true}
              allowance={localAccount.zrxAllowance}
              waitingAllowance={localAccount.zrxAllowanceWaiting}
              giveAllowance={() =>
                this.props.dispatch(localAccountZrxAllowanceRequest())
              }
            />

            <AccountCard
              title={"Node's ETH"}
              symbol={"ETH"}
              balance={remoteAccount.ethBalance}
              withAllowance={false}
            />
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = ({ localAccount, remoteAccount, errors }) => ({
  localAccount,
  remoteAccount,
  allowanceError: errors.allowanceError
});

export default connect(mapStateToProps)(Accounts);
