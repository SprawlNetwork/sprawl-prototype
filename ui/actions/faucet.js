import { call } from "../rpc";
import { notificationReceived } from "./notifications";
import {
  localAccountEthBalanceUpdateRequest,
  localAccountWethBalanceUpdateRequest
} from "./localAccount";

export const callFaucet = () => async (dispatch, getState) => {
  const {
    localAccount: { address },
    nodeConnection: { address: nodeAddress }
  } = getState();

  try {
    await call(nodeAddress, "faucet", address);
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
