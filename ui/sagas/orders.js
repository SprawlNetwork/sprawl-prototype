import { call, put, select } from "redux-saga/effects";
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
import * as _ from "lodash";
import { updateWhileConnected } from "./node";
import { BigNumber } from "bignumber.js";
import { getSprawlOrderFrom0xSignedOrder } from "../../common/orders";

const SIGNATURE_CANCELLED_BY_USER = -32603;

export function* updateOrdersSaga() {
  try {
    const node = yield select(nodeAddress);

    const remoteOrders = yield call(callNode, node, "getOrders");

    const currentOrders = yield select(state => state.orders);

    const remoteOrderIds = remoteOrders.map(o => o.id);

    const deletedOrderIds = Object.values(currentOrders)
      .filter(o => !remoteOrderIds.includes(o.id))
      .map(o => o.id);

    const updatedOrders = remoteOrders.filter(
      o => !_.isEqual(o, currentOrders[o.id])
    );

    if (deletedOrderIds.length !== 0 || updatedOrders.length !== 0) {
      yield put(ordersUpdated(updatedOrders, deletedOrderIds));
    }
  } catch (error) {
    console.error("Error updating orders", error);
  }
}

export function* makeOrderSaga(
  ethHelper,
  localAddress,
  { wethAmount, zrxAmount, isBuy }
) {
  const ONE = new BigNumber(1e18);

  try {
    const senderAddress = yield select(state => state.localAccount.address);

    const signedOrder = yield call(() =>
      ethHelper.createAndSignOrder(
        localAddress,
        senderAddress,
        ONE.mul(wethAmount),
        ONE.mul(zrxAmount),
        isBuy
      )
    );

    const sprawlOrder = yield call(
      getSprawlOrderFrom0xSignedOrder,
      signedOrder,
      ethHelper
    );

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
    const signedTakeOrderTransaction = yield call(() =>
      ethHelper.signTakeOrderTransaction(localAddress, order.signedOrder)
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

    console.log(takenOrder);

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
  try {
    yield call(updateWhileConnected, updateOrdersSaga, 5000);
  } catch (error) {
    console.error("Error updating orders periodically", error);
  }
}
