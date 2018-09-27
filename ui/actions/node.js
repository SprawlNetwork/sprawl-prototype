import { call } from "../rpc";

export const NODE_ADDRESS_CHANGED = "NODE_ADDRESS_CHANGED";

export const nodeAddressChanged = address => {
  return {
    type: NODE_ADDRESS_CHANGED,
    address
  };
};

export const CONNECTION_ERROR_CHANGED = "CONNECTION_ERROR_CHANGED";

function connectionErrorChanged(connectionError) {
  return {
    type: CONNECTION_ERROR_CHANGED,
    connectionError
  };
}

export const checkConnectionState = address => (dispatch, getState) => {
  call(address, "ping")
    .then(() => false)
    .catch(() => true)
    .then(connectionError => {
      if (getState().connectionError !== connectionError) {
        dispatch(connectionErrorChanged(connectionError));
      }
    });
};
