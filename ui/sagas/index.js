import { all } from "redux-saga/effects";
import { faucetSaga } from "./faucet";
import { nodeConnectionSaga } from "./node";
import { localAccountSaga } from "./localAccount";
import { notificationsSaga } from "./notifications";

export function* rootSaga(ethHelper, dispatch) {
  // eslint-disable-next-line redux-saga/no-unhandled-errors
  yield all([
    localAccountSaga(ethHelper),
    nodeConnectionSaga(ethHelper, dispatch),
    notificationsSaga(),
    faucetSaga(ethHelper)
  ]);
}
