import React, { PureComponent } from "react";

export default class AccountCard extends PureComponent {
  render() {
    const { isReady, title, balance, withAllowance, hasAllowance } = this.props;
    return (
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">{title}</h5>
          <div className="card-text">
            <label>Balance:</label> {isReady ? balance.toString(10) : "..."}
          </div>
          {withAllowance && (
            <div className="card-text">
              <label>Allowance:</label>{" "}
              {hasAllowance ? "✔" : <a href="#">Give allowance</a>}
            </div>
          )}
        </div>
      </div>
    );
  }
}
