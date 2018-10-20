import React, { PureComponent } from "react";
import { Amount } from "./Amount";
import { allowanceIsBigEnough } from "../selectors";

export default class AccountCard extends PureComponent {
  render() {
    const {
      symbol,
      balance,
      withAllowance,
      allowance,
      waitingAllowance
    } = this.props;
    const title = this.props.title || symbol;

    return (
      <div className="card">
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
}
