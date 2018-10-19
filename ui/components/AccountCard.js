import React, { PureComponent } from "react";
import { Amount } from "./Amount";
import { allowanceIsBigEnough } from "../selectors";

export default class AccountCard extends PureComponent {
  render() {
    const { symbol, balance, withAllowance } = this.props;
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
            <div className="card-text">
              <label>Allowance:</label> {this._renderAllowance()}
            </div>
          )}
        </div>
      </div>
    );
  }

  _renderAllowance() {
    const { allowance } = this.props;
    if (this.props.allowance === undefined) {
      return "...";
    }

    if (this.props.waitingAllowance) {
      return "Waiting for confirmation";
    }

    if (!allowanceIsBigEnough(allowance)) {
      return (
        <button
          className="btn btn-secondary btn-sm"
          onClick={this.onAllowanceClicked}
        >
          Give allowance
        </button>
      );
    }

    return "✅";
  }

  onAllowanceClicked = e => {
    e.preventDefault();
    this.props.giveAllowance();
  };
}
