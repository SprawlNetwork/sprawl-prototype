import React, { PureComponent } from "react";
import { connect } from "react-redux";

import AccountCard from "../components/AccountCard";
import Faucet from "../components/Faucet";
import { tokenSetAllowanceRequest } from "../actions";

class Accounts extends PureComponent {
  render() {
    let { localAccount, remoteAccount, tokens } = this.props;

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
              title={"Node's ETH"}
              symbol={"ETH"}
              balance={remoteAccount.ethBalance}
              withAllowance={false}
            />

            {Object.values(tokens).map(t => (
              <AccountCard
                key={t.address}
                symbol={t.symbol}
                balance={t.balance}
                withAllowance={true}
                allowance={t.allowance}
                waitingAllowance={t.waitingForAllowance}
                giveAllowance={() => {
                  this.props.dispatch(tokenSetAllowanceRequest(t.address));
                }}
              />
            ))}
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = ({ localAccount, remoteAccount, errors, tokens }) => ({
  localAccount,
  remoteAccount,
  allowanceError: errors.allowanceError,
  tokens
});

export default connect(mapStateToProps)(Accounts);
