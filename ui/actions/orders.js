import * as _ from "lodash";
import { BigNumber } from "@0xproject/utils";

import { callNode } from "../rpc";
import { ethHelper } from "../eth";
import { getSprawlOrderFrom0xSignedOrder } from "../../common/orders";

const SIGNATURE_CANCELLED_BY_USER = -32603;

export const ORDERS_UPDATED = "ORDERS_UPDATED";

export const ordersUpdated = (updatedOrders, deletedOrderIds) => ({
  type: ORDERS_UPDATED,
  updatedOrders,
  deletedOrderIds
});

export const ordersUpdateRequest = nodeAddress => async (
  dispatch,
  getState
) => {
  const remoteOrders = await callNode(nodeAddress, "getOrders");
  const currentOrders = getState().orders;

  const remoteOrderIds = remoteOrders.map(o => o.id);

  const deletedOrderIds = Object.values(currentOrders)
    .filter(o => !remoteOrderIds.includes(o.id))
    .map(o => o.id);

  const updatedOrders = remoteOrders.filter(
    o => !_.isEqual(o, currentOrders[o.id])
  );

  if (deletedOrderIds.length === 0 && updatedOrders.length === 0) {
    return null;
  }

  dispatch(ordersUpdated(updatedOrders, deletedOrderIds));
};

export const MAKE_ORDER_FAILURE = "MAKE_ORDER_FAILURE";

export const makeOrderFailure = error => ({
  type: MAKE_ORDER_FAILURE,
  error
});

export const MAKE_ORDER_FAILURE_DISMISS = "MAKE_ORDER_FAILURE_DISMISS";

export const makeOrderFailureDismiss = () => ({
  type: MAKE_ORDER_FAILURE_DISMISS
});

export const MAKE_ORDER_SUCCESS = "MAKE_ORDER_SUCCESS";

export const makeOrderSuccess = order => ({
  type: MAKE_ORDER_SUCCESS,
  order
});

export const makeOrderRequest = (wethAmount, zrxAmount, isBuy) => async (
  dispatch,
  getState
) => {
  const {
    localAccount: { address: localAddress },
    remoteAccount: { address: senderAddress }
  } = getState();

  const ONE = new BigNumber(1e18);

  let signedOrder;
  let sprawlOrder;
  try {
    signedOrder = await ethHelper.createAndSignOrder(
      localAddress,
      senderAddress,
      ONE.mul(wethAmount),
      ONE.mul(zrxAmount),
      isBuy
    );

    sprawlOrder = await getSprawlOrderFrom0xSignedOrder(signedOrder, ethHelper);
  } catch (error) {
    if (error.code === SIGNATURE_CANCELLED_BY_USER) {
      return;
    }

    console.error("Error making order", error);
    return dispatch(makeOrderFailure(error));
  }

  const {
    nodeConnection: { address: nodeAddress }
  } = getState();

  let order;

  try {
    order = await callNode(nodeAddress, "sendOrder", sprawlOrder);
  } catch (error) {
    return dispatch(makeOrderFailure(error));
  }

  return dispatch(makeOrderSuccess(order));
};

export const TAKE_ORDER_STARTED = "TAKE_ORDER_STARTED";

export const takeOrderStarted = order => ({
  type: TAKE_ORDER_STARTED,
  order
});

export const TAKE_ORDER_SUCCESS = "TAKE_ORDER_SUCCESS";

export const takeOrderSuccess = order => ({
  type: TAKE_ORDER_SUCCESS,
  order
});

export const TAKE_ORDER_ERROR = "TAKE_ORDER_ERROR";

export const takeOrderError = error => ({
  type: TAKE_ORDER_ERROR,
  error
});

export const takeOrderRequest = order => async (dispatch, getState) => {
  const {
    localAccount: { address: taker }
  } = getState();

  let signedTakeOrderTransaction;
  try {
    signedTakeOrderTransaction = await ethHelper.signTakeOrderTransaction(
      taker,
      order.signedOrder
    );
  } catch (error) {
    if (error.code === SIGNATURE_CANCELLED_BY_USER) {
      console.log("Take order cancelled");
    } else {
      console.log("Error signing take order tx", error);
    }

    return;
  }

  const {
    nodeConnection: { address: nodeAddress }
  } = getState();

  dispatch(takeOrderStarted(order));

  let takenOrder;
  try {
    takenOrder = await callNode(
      nodeAddress,
      "takeOrder",
      order.id,
      signedTakeOrderTransaction
    );
  } catch (error) {
    console.error("Failed to take order", error);
    return dispatch(takeOrderError(error));
  }

  return dispatch(takeOrderSuccess(takenOrder));
};
