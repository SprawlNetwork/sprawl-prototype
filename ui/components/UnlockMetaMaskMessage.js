import React from "react";

export default function UnlockMetaMaskMessage() {
  return (
    <div className="overlay-message">
      <div>
        <h2>Please unlock MetaMask to continue</h2>
        <div>
          <br />
          <br />
          <br />
          {window.ethereum && (
            <button
              className="btn btn-primary"
              onClick={() => window.ethereum.enable()}
            >
              Unlock
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
