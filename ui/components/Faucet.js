import React from "react";
import { connect } from "react-redux";
import { faucetCallRequested } from "../actions/faucet";
import { isLocalNetwork } from "../selectors";

function FaucetComponent({ isLocalNetwork, dispatch }) {
  if (!isLocalNetwork) {
    return null;
  }

  return (
    <div>
      <button
        className="btn-primary btn-sm"
        onClick={() => dispatch(faucetCallRequested())}
      >
        Load address from faucet
      </button>
    </div>
  );
}

const mapStateToProps = state => ({ isLocalNetwork: isLocalNetwork(state) });

export const Faucet = connect(mapStateToProps)(FaucetComponent);
