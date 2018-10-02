import { combineReducers } from "redux";
import * as _ from "lodash";

import {
  CONNECTION_ERROR_CHANGED,
  LOCAL_ACCOUNT_CHANGED,
  NODE_ADDRESS_CHANGED,
  REMOTE_ACCOUNT_LOAD_FAILED,
  REMOTE_ACCOUNT_LOAD_STARTED,
  REMOTE_ACCOUNT_LOAD_SUCCESS,
  REMOTE_ACCOUNT_BALANCE_UPDATED,
  LOCAL_ACCOUNT_BALANCE_UPDATED,
  ORDERS_UPDATED,
  MAKE_ORDER_FAILURE,
  MAKE_ORDER_SUCCESS,
  MAKE_ORDER_FAILURE_DISMISS,
  TAKE_ORDER_SUCCESS
} from "./actions";
import {
  NOTIFICATION_ADDED,
  NOTIFICATION_DISMISSED,
  NOTIFICATION_EXPIRED
} from "./actions/notifications";

function localAccount(state = { address: undefined }, action) {
  switch (action.type) {
    case LOCAL_ACCOUNT_CHANGED:
      return { address: action.address };

    case LOCAL_ACCOUNT_BALANCE_UPDATED:
      return { ...state, ethBalance: action.ethBalance };

    default:
      return state;
  }
}

function remoteAccount(state = { loading: true, loadFailed: false }, action) {
  switch (action.type) {
    case REMOTE_ACCOUNT_LOAD_STARTED:
      return { loading: true, loadFailed: false };

    case REMOTE_ACCOUNT_LOAD_SUCCESS:
      return {
        loading: false,
        loadFailed: false,
        address: action.address,
        ethBalance: action.ethBalance
      };

    case REMOTE_ACCOUNT_LOAD_FAILED:
      return {
        loading: false,
        loadFailed: true
      };

    case REMOTE_ACCOUNT_BALANCE_UPDATED:
      return { ...state, ethBalance: action.ethBalance };

    default:
      return state;
  }
}

function nodeAddress(state = null, action) {
  switch (action.type) {
    case NODE_ADDRESS_CHANGED:
      return action.address;

    default:
      return state;
  }
}

function connectionError(state = false, action) {
  switch (action.type) {
    case CONNECTION_ERROR_CHANGED:
      return action.connectionError;

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
  switch (action.type) {
    case NOTIFICATION_ADDED:
      return [...state, { id: action.id, msg: action.msg }];

    case NOTIFICATION_DISMISSED:
    case NOTIFICATION_EXPIRED:
      var i = state.findIndex(n => n.id === action.id);
      return [...state.slice(0, i), ...state.slice(i + 1)];

    default:
      return state;
  }
}

const rootReducer = combineReducers({
  localAccount,
  nodeAddress,
  connectionError,
  remoteAccount,
  orders,
  makeOrderError,
  notifications
});

export default rootReducer;
