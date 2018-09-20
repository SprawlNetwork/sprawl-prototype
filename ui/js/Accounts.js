import React from "react";

export function Accounts({ nodeAddress, localAddress }) {
  return (
    <div className="container mt-4">
      <h2>Accounts</h2>

      <div className="mt-4">
        <div>
          <label>Local address</label>: {localAddress}
        </div>
        <div>
          <label>Node's address</label>: {nodeAddress}
        </div>
      </div>

      <div className="card-deck mt-4">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">ETH</h5>
            <div className="card-text">
              <label>Balance:</label> 0.19823123
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h5 className="card-title">WETH</h5>
            <div className="card-text">
              <label>Balance:</label> 0.19823123
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
              <label>Balance:</label> 0.19823123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
