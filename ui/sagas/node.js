import {
  all,
  apply,
  call,
  cancelled,
  put,
  select,
  takeLatest,
  takeEvery
} from "redux-saga/effects";
import {
  nodeAddress,
  remoteAccountAddress,
  remoteAccountBalance
} from "../selectors";
import { callNode } from "../rpc";
import {
  CONNECTION_TO_NODE_REQUESTED,
  connectionErrorChanged,
  connectionToNodeStarted,
  connectionToNodeSuccess,
  NEW_PEER,
  notificationReceived,
  PEER_REMOVED,
  remoteAccountAddressChanged,
  remoteAccountBalanceUpdated,
  remoteNetworkIdChanged
} from "../actions";
import { delay } from "redux-saga";
import { periodicallyUpdateOrdersSaga, updateOrdersSaga } from "./orders";
import WebsocketUpdater from "../WebsocketUpdater";

function* checkConnectionStatusSaga() {
  while (true) {
    let previous;
    let hasError;

    try {
      const node = yield select(nodeAddress);

      previous = yield select(state => state.nodeConnection.error);

      yield call(callNode, node, "ping");
      hasError = false;
    } catch (error) {
      hasError = true;
    }

    try {
      if (previous !== hasError) {
        yield put(connectionErrorChanged(hasError));
      }
    } catch (error) {
      console.error("Error checking connection state", error);
    }

    yield delay(10000);
  }
}

export function* updateWhileConnected(updater, interval = 1000, ...args) {
  while (true) {
    try {
      const connectionError = yield select(state => state.nodeConnection.error);

      if (!connectionError) {
        yield call(updater, ...args);
      }
    } catch (error) {
      console.error("Error running update", error);
    }

    yield delay(interval);
  }
}

function* updateRemoteAccountBalanceSaga(ethHelper) {
  while (true) {
    try {
      const address = yield select(remoteAccountAddress);

      const newBalance = yield apply(ethHelper, ethHelper.getEthBalance, [
        address
      ]);

      const oldBalance = yield select(remoteAccountBalance);

      if (oldBalance === undefined || !newBalance.eq(oldBalance)) {
        yield put(remoteAccountBalanceUpdated(newBalance));
      }
    } catch (error) {
      console.error("Error updating remote account balance", error);
    }

    yield delay(5000);
  }
}

function* newPeerSaga({ peer }) {
  try {
    yield put(notificationReceived("Connected to node " + peer));
    yield call(updateOrdersSaga);
  } catch (error) {
    console.error("Error on new peer", error);
  }
}

function* peerRemovedSaga({ peer }) {
  try {
    yield put(notificationReceived("Disconnected from " + peer));
    yield call(updateOrdersSaga);
  } catch (error) {
    console.error("Error on peer removed", error);
  }
}

function* checkForPeersSaga() {
  yield takeEvery(NEW_PEER, newPeerSaga);
  yield takeEvery(PEER_REMOVED, peerRemovedSaga);
}

function* connectToNode(ethHelper, dispatch, { nodeAddress: node }) {
  let websocketUpdater;

  try {
    yield put(connectionToNodeStarted());

    const response = yield call(callNode, node, "getNodeInfo");
    yield put(remoteNetworkIdChanged(response.networkId));
    yield put(remoteAccountAddressChanged(response.address));

    websocketUpdater = new WebsocketUpdater(dispatch);
    websocketUpdater.start(node);

    yield put(connectionToNodeSuccess());

    yield all([
      checkConnectionStatusSaga(),
      updateRemoteAccountBalanceSaga(ethHelper),
      periodicallyUpdateOrdersSaga(),
      checkForPeersSaga()
    ]);
  } catch (error) {
    console.log("Error connecting to node", error);
    yield put(connectionErrorChanged(true));
  } finally {
    if (yield cancelled() && websocketUpdater !== undefined) {
      websocketUpdater.stop();
    }
  }
}

export function* nodeConnectionSaga(ethHelper, dispatch) {
  yield takeLatest(
    CONNECTION_TO_NODE_REQUESTED,
    connectToNode,
    ethHelper,
    dispatch
  );
}
