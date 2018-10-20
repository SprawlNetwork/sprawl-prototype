import { call, put, select, takeEvery } from "redux-saga/effects";
import { FAUCET_CALL_REQUESTED } from "../actions/faucet";
import { localAccountAddress, nodeAddress } from "../selectors";
import { callNode } from "../rpc";
import { notificationReceived } from "../actions";

function* callFaucet() {
  try {
    const node = yield select(nodeAddress);
    const address = yield select(localAccountAddress);

    yield call(callNode, node, "faucet", address);
    yield put(notificationReceived("Sending funds from faucet..."));
  } catch (error) {
    console.error("Error calling faucet", error);
    yield put(notificationReceived("Error calling faucet"));
  }
}

export function* faucetSaga() {
  yield takeEvery(FAUCET_CALL_REQUESTED, callFaucet);
}
