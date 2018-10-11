import { combineReducers } from "redux";
import * as _ from "lodash";

import {
  CONNECTION_ERROR_CHANGED,
  LOCAL_ACCOUNT_ADDRESS_CHANGED,
  NODE_ADDRESS_CHANGED,
  REMOTE_ACCOUNT_BALANCE_UPDATED,
  LOCAL_ACCOUNT_ETH_BALANCE_UPDATED,
  ORDERS_UPDATED,
  MAKE_ORDER_FAILURE,
  MAKE_ORDER_SUCCESS,
  MAKE_ORDER_FAILURE_DISMISS,
  TAKE_ORDER_SUCCESS,
  LOCAL_NETWORK_ID_CHANGED,
  REMOTE_NETWORK_ID_CHANGED,
  REMOTE_ACCOUNT_ADDRESS_CHANGED,
  CONNECTION_TO_NODE_STARTED,
  CONNECTION_TO_NODE_SUCCESS,
  NOTIFICATION_DISMISSED,
  NOTIFICATION_EXPIRED,
  NOTIFICATION_ADDED,
  LOCAL_ACCOUNT_WETH_BALANCE_UPDATED,
  LOCAL_ACCOUNT_ZRX_BALANCE_UPDATED,
  LOCAL_ACCOUNT_WETH_ALLOWANCE_UPDATED,
  LOCAL_ACCOUNT_ZRX_ALLOWANCE_UPDATED
} from "./actions";

function localAccount(
  state = {
    address: undefined,
    ethBalance: undefined,
    wethBalance: undefined,
    zrxBalance: undefined
  },
  action
) {
  switch (action.type) {
    case LOCAL_ACCOUNT_ADDRESS_CHANGED:
      return { address: action.address };

    case LOCAL_ACCOUNT_ETH_BALANCE_UPDATED:
      return { ...state, ethBalance: action.ethBalance };

    case LOCAL_ACCOUNT_WETH_BALANCE_UPDATED:
      return { ...state, wethBalance: action.wethBalance };

    case LOCAL_ACCOUNT_ZRX_BALANCE_UPDATED:
      return { ...state, zrxBalance: action.zrxBalance };

    case LOCAL_ACCOUNT_WETH_ALLOWANCE_UPDATED:
      return { ...state, wethAllowance: action.wethAllowance };

    case LOCAL_ACCOUNT_ZRX_ALLOWANCE_UPDATED:
      return { ...state, zrxAllowance: action.zrxAllowance };

    default:
      return state;
  }
}

function remoteAccount(
  state = { address: undefined, ethBalance: undefined },
  action
) {
  switch (action.type) {
    case CONNECTION_TO_NODE_STARTED:
      return { address: undefined, ethBalance: undefined };

    case REMOTE_ACCOUNT_ADDRESS_CHANGED:
      return { ...state, address: action.address };

    case REMOTE_ACCOUNT_BALANCE_UPDATED:
      return { ...state, ethBalance: action.ethBalance };

    default:
      return state;
  }
}

function orders(state = {}, action) {
  switch (action.type) {
    case ORDERS_UPDATED:
      return {
        ..._.omit(state, action.deletedOrderIds),
        ..._.merge(...action.updatedOrders.map(o => ({ [o.id]: o })))
      };

    case MAKE_ORDER_SUCCESS:
    case TAKE_ORDER_SUCCESS:
      return { ...state, [action.order.id]: action.order };

    default:
      return state;
  }
}

function makeOrderError(state = false, action) {
  switch (action.type) {
    case MAKE_ORDER_FAILURE:
      return true;

    case MAKE_ORDER_SUCCESS:
    case MAKE_ORDER_FAILURE_DISMISS:
      return false;

    default:
      return state;
  }
}

function notifications(state = [], action) {
  let i;

  switch (action.type) {
    case NOTIFICATION_ADDED:
      return [...state, { id: action.id, msg: action.msg }];

    case NOTIFICATION_DISMISSED:
    case NOTIFICATION_EXPIRED:
      i = state.findIndex(n => n.id === action.id);
      return [...state.slice(0, i), ...state.slice(i + 1)];

    default:
      return state;
  }
}

function networks(
  state = { local: { networkId: undefined }, remote: { networkId: undefined } },
  action
) {
  switch (action.type) {
    case LOCAL_NETWORK_ID_CHANGED:
      return { ...state, local: { ...state.local, networkId: action.id } };

    case REMOTE_NETWORK_ID_CHANGED:
      return { ...state, remote: { ...state.remote, networkId: action.id } };

    default:
      return state;
  }
}

function nodeConnection(
  state = {
    address: undefined,
    error: false,
    connected: false
  },
  action
) {
  switch (action.type) {
    case CONNECTION_TO_NODE_STARTED:
      return { ...state, connected: false };

    case CONNECTION_TO_NODE_SUCCESS:
      return { ...state, connected: true, error: false };

    case NODE_ADDRESS_CHANGED:
      return { ...state, address: action.address };

    case CONNECTION_ERROR_CHANGED:
      return { ...state, error: action.connectionError };

    default:
      return state;
  }
}

const rootReducer = combineReducers({
  nodeConnection,
  networks,
  localAccount,
  remoteAccount,
  orders,
  makeOrderError,
  notifications
});

export default rootReducer;
