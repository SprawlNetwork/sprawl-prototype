import { all, call, put, select, takeEvery } from "redux-saga/effects";
import { callNode } from "../rpc";
import { notificationReceived } from "../actions";
import { localAccountAddress, nodeAddress } from "../selectors";
import { FAUCET_CALL_REQUESTED } from "../actions/faucet";

export function* callFaucet() {
  try {
    const node = yield select(nodeAddress);
    const address = yield select(localAccountAddress);

    yield call(callNode, node, "faucet", address);
    yield put(notificationReceived(undefined, "Sending funds from faucet..."));
  } catch (error) {
    console.error("Error calling faucet", error);
    yield put(notificationReceived(undefined, "Error calling faucet"));
  }
}

export function* faucetSaga() {
  yield takeEvery(FAUCET_CALL_REQUESTED, callFaucet);
}

export function* rootSaga(ethHelper) {
  try {
    yield all([faucetSaga(ethHelper)]);
  } catch (error) {
    console.error("Fatal error in root saga", error);
  }
}
