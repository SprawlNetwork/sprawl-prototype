import React, { PureComponent } from "react";
import { Amount } from "./Amount";

export default class AccountCard extends PureComponent {
  render() {
    const { title, balance, withAllowance, allowance } = this.props;
    return (
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">{title}</h5>
          <div className="card-text">
            <label>Balance:</label>{" "}
            {balance !== undefined ? <Amount units={balance} /> : "..."}
          </div>
          {withAllowance && (
            <div className="card-text">
              <label>Allowance:</label>{" "}
              {allowance !== undefined ? <Amount units={allowance} /> : "..."}
            </div>
          )}
        </div>
      </div>
    );
  }
}
