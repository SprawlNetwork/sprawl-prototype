import { call } from "../rpc";
import { notificationReceived } from "./notifications";

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

  return dispatch(
    notificationReceived(undefined, "Received funds from faucet")
  );
};
