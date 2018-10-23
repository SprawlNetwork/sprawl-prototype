import {
  NOTIFICATION_RECEIVED,
  notificationAdded,
  notificationExpired
} from "../actions";
import { call, put, takeEvery } from "redux-saga/effects";
import { delay } from "redux-saga";

function* notificationReceived({ msg }) {
  try {
    const id = new Date().getTime();
    yield put(notificationAdded(id, msg));

    yield call(delay, 10000);
    yield put(notificationExpired(id));
  } catch (error) {
    console.error("Error managing notification", error);
  }
}

export function* notificationsSaga() {
  yield takeEvery(NOTIFICATION_RECEIVED, notificationReceived);
}
