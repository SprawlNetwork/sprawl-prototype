import * as _ from "lodash";
import { nodeAddress } from "../selectors";
import { callNode } from "../rpc";
import {
  makeOrderFailure,
  makeOrderSuccess,
  ordersUpdated,
  takeOrderError,
  takeOrderStarted,
  takeOrderSuccess
} from "../actions";
import { getSprawlOrderFrom0xSignedOrder } from "../../common/orders";
import { SIGNATURE_CANCELLED_BY_USER } from "../../common/eth";
import { callMethod } from "../utils";
import { updateWhileConnected } from "./node";
import { call, put, select } from "redux-saga/effects";

export function* updateOrdersSaga() {
  // eslint-disable-next-line redux-saga/no-unhandled-errors
  const node = yield select(nodeAddress);

  // eslint-disable-next-line redux-saga/no-unhandled-errors
  const remoteOrders = yield call(callNode, node, "getOrders");

  // eslint-disable-next-line redux-saga/no-unhandled-errors
  const currentOrders = yield select(state => state.orders);

  const remoteOrderIds = remoteOrders.map(o => o.id);

  const deletedOrderIds = Object.values(currentOrders)
    .filter(o => !remoteOrderIds.includes(o.id))
    .map(o => o.id);

  const updatedOrders = remoteOrders.filter(
    o => !_.isEqual(o, currentOrders[o.id])
  );

  if (deletedOrderIds.length !== 0 || updatedOrders.length !== 0) {
    // eslint-disable-next-line redux-saga/no-unhandled-errors
    yield put(ordersUpdated(updatedOrders, deletedOrderIds));
  }
}

export function* makeOrderSaga(
  ethHelper,
  localAddress,
  { makerAssetAddress, makerAssetAmount, takerAssetAddress, takerAssetAmount }
) {
  try {
    const senderAddress = yield select(state => state.remoteAccount.address);

    const signedOrder = yield callMethod(
      ethHelper,
      ethHelper.createAndSignOrder,
      localAddress,
      senderAddress,
      makerAssetAddress,
      makerAssetAmount,
      takerAssetAddress,
      takerAssetAmount
    );

    const sprawlOrder = getSprawlOrderFrom0xSignedOrder(signedOrder);

    const node = yield select(nodeAddress);
    const order = yield call(callNode, node, "sendOrder", sprawlOrder);

    yield put(makeOrderSuccess(order));
  } catch (error) {
    if (error.code === SIGNATURE_CANCELLED_BY_USER) {
      return;
    }

    console.error("Error making order", error);
    yield put(makeOrderFailure(error));
  }
}

export function* takeOrderSaga(ethHelper, localAddress, { order }) {
  try {
    const signedTakeOrderTransaction = yield callMethod(
      ethHelper,
      ethHelper.signTakeOrderTransaction,
      localAddress,
      order.signedOrder
    );

    yield put(takeOrderStarted(order));

    const node = yield select(nodeAddress);
    const takenOrder = yield call(
      callNode,
      node,
      "takeOrder",
      order.id,
      signedTakeOrderTransaction
    );

    yield put(takeOrderSuccess(takenOrder));
  } catch (error) {
    if (error.code === SIGNATURE_CANCELLED_BY_USER) {
      return;
    }

    console.error("Error taking order", error);
    yield put(takeOrderError(error));
  }
}

export function* periodicallyUpdateOrdersSaga() {
  // eslint-disable-next-line redux-saga/no-unhandled-errors
  yield call(updateWhileConnected, updateOrdersSaga, 5000);
}
