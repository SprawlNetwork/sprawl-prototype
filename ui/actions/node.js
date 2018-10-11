import { call } from "../rpc";
import { remoteNetworkIdChanged } from "./networks";
import {
  remoteAccountAddressChanged,
  remoteAccountBalanceUpdateRequest
} from "./remoteAccount";

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
      if (getState().nodeConnection.error !== connectionError) {
        dispatch(connectionErrorChanged(connectionError));
      }
    });
};

export const CONNECTION_TO_NODE_STARTED = "CONNECTION_TO_NODE_STARTED";

export const connectionToNodeStarted = () => ({
  type: CONNECTION_TO_NODE_STARTED
});

export const CONNECTION_TO_NODE_SUCCESS = "CONNECTION_TO_NODE_SUCCESS";

export const connectionToNodeSuccess = () => ({
  type: CONNECTION_TO_NODE_SUCCESS
});

export const connectionToNodeRequested = nodeAddress => async dispatch => {
  let response;

  dispatch(connectionToNodeStarted());

  try {
    response = await call(nodeAddress, "getNodeInfo");
  } catch (e) {
    console.error(`Error connecting to node ${nodeAddress}`, e);
    return dispatch(connectionErrorChanged(true));
  }

  dispatch(remoteNetworkIdChanged(response.networkId));
  dispatch(remoteAccountAddressChanged(response.address));
  dispatch(connectionToNodeSuccess());

  return dispatch(remoteAccountBalanceUpdateRequest());
};
