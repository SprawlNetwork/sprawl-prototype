import React from "react";

export function NodeInfo({ endpoint, onEndpointChanged }) {
  return (
    <div className="container mt-4">
      <div className="input-group">
        <div className="input-group-prepend">
          <span className="input-group-text">Node address</span>
        </div>
        <input
          type="text"
          className="form-control"
          value={endpoint}
          onChange={e => onEndpointChanged(e.target.value)}
        />
      </div>
    </div>
  );
}
