import React from "react";

export function Accounts() {
  return (
    <div className="container mt-4">
      <h2>Accounts</h2>

      <div className="mt-4">
        <div>
          <label>Local address</label>:
          0xa6db372ad0e30fe6c4b2764596b3ddd8e3e367b6
        </div>
        <div>
          <label>Node's address</label>:
          0xa6db372ad0e30fe6c4b2764596b3ddd8e3e367b6
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
