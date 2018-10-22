export const ORDERS_UPDATED = "ORDERS_UPDATED";

export const ordersUpdated = (updatedOrders, deletedOrderIds) => ({
  type: ORDERS_UPDATED,
  updatedOrders,
  deletedOrderIds
});

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

export const MAKE_ORDER_REQUEST = "MAKE_ORDER_REQUEST";

export const makeOrderRequest = (
  makerAssetAddress,
  makerAssetAmount,
  takerAssetAddress,
  takerAssetAmount
) => ({
  type: MAKE_ORDER_REQUEST,
  makerAssetAddress,
  makerAssetAmount,
  takerAssetAddress,
  takerAssetAmount
});

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

export const TAKE_ORDER_REQUEST = "TAKE_ORDER_REQUEST";

export const takeOrderRequest = order => ({
  type: TAKE_ORDER_REQUEST,
  order
});
