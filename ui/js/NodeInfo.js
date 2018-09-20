import React from "react";

export function NodeInfo({ nodeAddress, onAddressChanged }) {
  return (
    <div className="container mt-4">
      <div className="input-group">
        <div className="input-group-prepend">
          <span className="input-group-text">Node address</span>
        </div>
        <input
          type="text"
          className="form-control"
          value={nodeAddress}
          onChange={e => onAddressChanged(e.target.value)}
        />
      </div>
    </div>
  );
}
