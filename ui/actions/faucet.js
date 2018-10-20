import { callNode } from "../rpc";
import { notificationReceived } from "./notifications";
import {
  localAccountEthBalanceUpdateRequest,
  localAccountWethBalanceUpdateRequest
} from "./localAccount";

export const FAUCET_CALL_REQUESTED = "FAUCET_CALL_REQUESTED";

export const faucetCallRequested = () => ({
  type: FAUCET_CALL_REQUESTED
});

export const callFaucet = () => async (dispatch, getState) => {
  const {
    localAccount: { address },
    nodeConnection: { address: nodeAddress }
  } = getState();

  try {
    await callNode(nodeAddress, "faucet", address);
  } catch (e) {
    console.error("Error calling faucet", e);
    return dispatch(notificationReceived(undefined, "Error calling faucet"));
  }

  dispatch(localAccountEthBalanceUpdateRequest());
  dispatch(localAccountWethBalanceUpdateRequest());

  return dispatch(
    notificationReceived(undefined, "Sending funds from faucet...")
  );
};
