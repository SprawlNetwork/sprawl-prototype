import React, { PureComponent } from "react";
import { allowanceIsBigEnough } from "../selectors";
import { Amount } from "./Amount";

export class AccountCard extends PureComponent {
  render() {
    const {
      symbol,
      balance,
      withAllowance,
      allowance,
      waitingAllowance,
      hasFaucet,
      waitingForFaucet
    } = this.props;
    const title = this.props.title || symbol;

    return (
      <div className="card account-card">
        <div className="card-body">
          <h5 className="card-title">{title}</h5>
          <div className="card-text">
            <label>Balance:</label>{" "}
            {balance !== undefined ? (
              <Amount units={balance} symbol={symbol} />
            ) : (
              "..."
            )}
          </div>
          {withAllowance && (
            <>
              <div className="card-text">
                <label>Allowance:</label> {this._renderAllowance()}
              </div>
              {((allowance && !allowanceIsBigEnough(allowance)) ||
                waitingAllowance) && (
                <div>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={this.onAllowanceClicked}
                    disabled={waitingAllowance}
                  >
                    Give allowance
                  </button>
                </div>
              )}
            </>
          )}
          {hasFaucet && (
            <div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={this.onFaucetClicked}
                disabled={waitingForFaucet}
              >
                {waitingForFaucet
                  ? "Getting free " + symbol + "..."
                  : "Get free " + symbol}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  _renderAllowance() {
    const { allowance, waitingAllowance } = this.props;
    if (allowance === undefined) {
      return "...";
    }

    if (waitingAllowance) {
      return "Setting...";
    }

    if (!allowanceIsBigEnough(allowance)) {
      return "❌";
    }

    return "✅";
  }

  onAllowanceClicked = e => {
    e.preventDefault();
    this.props.giveAllowance();
  };

  onFaucetClicked = e => {
    e.preventDefault();
    this.props.callFaucet();
  };
}
