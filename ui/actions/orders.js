import * as _ from "lodash";
import { BigNumber } from "@0xproject/utils";

import { call } from "../rpc";

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
  const remoteOrders = await call(nodeAddress, "getOrders");
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
  const now = new Date();

  const {
    nodeConnection: { address: nodeAddress },
    localAccount: { address: localAddress }
  } = getState();

  let order;

  try {
    order = await call(nodeAddress, "sendOrder", {
      id: localAddress + _.random(0, 123123),
      weth: wethAmount,
      zrx: zrxAmount,
      buysZrx: isBuy,
      maker: localAddress,
      creationDate: now,
      expirationDate: datefns.addDays(now, 1)
    });
  } catch (error) {
    console.error("Error making order", error);
    return dispatch(makeOrderFailure(error));
  }

  return dispatch(makeOrderSuccess(order));
};

export const TAKE_ORDER_SUCCESS = "TAKE_ORDER_SUCCESS";

export const takeOrderSuccess = order => ({
  type: TAKE_ORDER_SUCCESS,
  order
});

export const takeOrderRequest = order => async (dispatch, getState) => {
  const {
    nodeConnection: { address: nodeAddress },
    localAccount: { address: taker }
  } = getState();

  let takenOrder;
  try {
    takenOrder = await call(nodeAddress, "takeOrder", { ...order, taker });
  } catch (error) {
    console.error("Failed to take order", error);
    // TODO: Handle order taking errors.
    return;
  }

  return dispatch(takeOrderSuccess(takenOrder));
};
