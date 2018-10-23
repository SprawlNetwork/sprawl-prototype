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
  remoteNetworkIdChanged,
  tokenAdded
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

    // eslint-disable-next-line redux-saga/no-unhandled-errors
    yield call(delay, 10000);
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

    // eslint-disable-next-line redux-saga/no-unhandled-errors
    yield call(delay, interval);
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

    // eslint-disable-next-line redux-saga/no-unhandled-errors
    yield call(delay, 5000);
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

    const { networkId, address } = yield call(callNode, node, "getNodeInfo");
    yield put(remoteNetworkIdChanged(networkId));
    yield put(remoteAccountAddressChanged(address));

    websocketUpdater = new WebsocketUpdater(dispatch);
    websocketUpdater.start(node);

    const tokens = [];

    if (networkId === 50) {
      tokens.push({
        name: "Wrapped ETH",
        symbol: "WETH",
        address: "0x0b1ba0af832d7c05fd64161e0db78e85978e8082",
        decimals: 18,
        hasFaucet: false
      });

      tokens.push({
        name: "0x Token",
        symbol: "ZRX",
        address: "0x871dd7c2b4b25e1aa18728e9d5f2af4c4e431f5c",
        decimals: 18,
        hasFaucet: false
      });
    } else if (networkId === 3) {
      // ROPSTEN

      tokens.push({
        name: "Wrapped ABC",
        symbol: "ABC",
        address: "0xd34273a6f91bb6ed91a456e1aa1445faf2d670b5",
        decimals: 18,
        hasFaucet: true
      });

      tokens.push({
        name: "Wrapped XYZ",
        symbol: "XYZ",
        address: "0x97755f163d306309f25643a0f1dc13227b1a9e1b",
        decimals: 18,
        hasFaucet: true
      });
    } else {
      console.error("Sprawl is not working on network yet", networkId);
    }

    for (const token of tokens) {
      yield put(tokenAdded(token));
    }

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
