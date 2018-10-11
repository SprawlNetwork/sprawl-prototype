import { callFaucet } from "../actions/faucet";
import React from "react";
import { connect } from "react-redux";
import { isLocalNetwork } from "../selectors";

function Faucet({ isLocalNetwork, dispatch }) {
  if (!isLocalNetwork) {
    return null;
  }

  return (
    <span>
      {" "}
      <button
        className="btn-primary btn-sm"
        onClick={() => dispatch(callFaucet())}
      >
        Load address from faucet
      </button>
    </span>
  );
}

const mapStateToProps = state => ({ isLocalNetwork: isLocalNetwork(state) });

export default connect(mapStateToProps)(Faucet);
