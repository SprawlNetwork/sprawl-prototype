import { faucetCallRequested } from "../actions/faucet";
import React from "react";
import { connect } from "react-redux";
import { isLocalNetwork } from "../selectors";

function Faucet({ isLocalNetwork, dispatch }) {
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

export default connect(mapStateToProps)(Faucet);
