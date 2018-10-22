import { all } from "redux-saga/effects";
import { faucetSaga } from "./faucet";
import { nodeConnectionSaga } from "./node";
import { localAccountSaga } from "./localAccount";
import { notificationsSaga } from "./notifications";

export function* rootSaga(ethHelper, dispatch) {
  try {
    yield all([
      localAccountSaga(ethHelper),
      nodeConnectionSaga(ethHelper, dispatch),
      notificationsSaga(),
      faucetSaga(ethHelper)
    ]);
  } catch (error) {
    console.error("Fatal error in root saga", error);
  }
}
