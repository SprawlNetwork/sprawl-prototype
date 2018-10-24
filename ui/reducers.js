import { combineReducers } from "redux";
import * as _ from "lodash";

import { BigNumber } from "@0xproject/utils";

const UNLIMITED_ALLOWANCE_IN_BASE_UNITS = new BigNumber(2).pow(256).minus(1);

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
  METAMASK_LOADED,
  TOKEN_ADDED,
  TOKEN_BALANCE_UPDATED,
  TOKEN_ALLOWANCE_UPDATED,
  TOKEN_SET_ALLOWANCE_STARTED,
  TOKEN_SET_ALLOWANCE_FAILED,
  TOKEN_SET_ALLOWANCE_SUCCESS,
  TOKEN_SET_ALLOWANCE_ERROR_DISMISS,
  MAKE_ORDER_REQUEST,
  TOKEN_FAUCET_STARTED,
  TOKEN_FAUCET_SUCCESS,
  TOKEN_FAUCET_FAILED,
  TOKEN_FAUCET_ERROR_DISMISS,
  TOKEN_FAUCET_CANCELLED,
  TOKEN_SET_ALLOWANCE_CANCELLED
} from "./actions";
import { fromEntries } from "../common/utils";
import { ROOT_SAGA_ERROR } from "./actions/sagas";

function tokens(state = {}, action) {
  switch (action.type) {
    case TOKEN_ADDED:
      return {
        ...state,
        [action.token.address]: {
          ...action.token,
          balance: undefined,
          allowance: undefined
        }
      };

    case LOCAL_ACCOUNT_ADDRESS_CHANGED:
      return fromEntries(
        Object.values(state).map(t => [
          t.address,
          {
            ...t,
            balance: undefined,
            allowance: undefined,
            waitingForAllowance: undefined,
            allowanceError: undefined
          }
        ])
      );

    case TOKEN_BALANCE_UPDATED:
      return {
        ...state,
        [action.address]: { ...state[action.address], balance: action.balance }
      };

    case TOKEN_ALLOWANCE_UPDATED:
      return {
        ...state,
        [action.address]: {
          ...state[action.address],
          allowance: action.allowance
        }
      };

    case TOKEN_SET_ALLOWANCE_STARTED:
      return {
        ...state,
        [action.address]: {
          ...state[action.address],
          waitingForAllowance: true
        }
      };

    case TOKEN_SET_ALLOWANCE_SUCCESS:
      return {
        ...state,
        [action.address]: {
          ...state[action.address],
          waitingForAllowance: false,
          allowance: UNLIMITED_ALLOWANCE_IN_BASE_UNITS
        }
      };

    case TOKEN_SET_ALLOWANCE_FAILED:
      return {
        ...state,
        [action.address]: {
          ...state[action.address],
          waitingForAllowance: false,
          allowanceError: action.error
        }
      };

    case TOKEN_SET_ALLOWANCE_CANCELLED:
      return {
        ...state,
        [action.address]: {
          ...state[action.address],
          waitingForAllowance: false
        }
      };

    case TOKEN_SET_ALLOWANCE_ERROR_DISMISS:
      return {
        ...state,
        [action.address]: {
          ...state[action.address],
          allowanceError: undefined
        }
      };

    case TOKEN_FAUCET_STARTED:
      return {
        ...state,
        [action.address]: {
          ...state[action.address],
          waitingForFaucet: true
        }
      };

    case TOKEN_FAUCET_CANCELLED:
    case TOKEN_FAUCET_SUCCESS:
      return {
        ...state,
        [action.address]: {
          ...state[action.address],
          waitingForFaucet: false
        }
      };

    case TOKEN_FAUCET_FAILED:
      return {
        ...state,
        [action.address]: {
          ...state[action.address],
          waitingForFaucet: false,
          faucetError: action.error
        }
      };

    case TOKEN_FAUCET_ERROR_DISMISS:
      return {
        ...state,
        [action.address]: {
          ...state[action.address],
          faucetError: undefined
        }
      };

    default:
      return state;
  }
}

function localAccount(
  state = {
    address: undefined,
    ethBalance: undefined
  },
  action
) {
  switch (action.type) {
    case LOCAL_ACCOUNT_ADDRESS_CHANGED:
      return { address: action.address, tokens: tokens(state.tokens, action) };

    case LOCAL_ACCOUNT_ETH_BALANCE_UPDATED:
      return { ...state, ethBalance: action.ethBalance };

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
        ...fromEntries(action.updatedOrders.map(o => [o.id, o]))
      };

    case MAKE_ORDER_SUCCESS:
    case TAKE_ORDER_SUCCESS:
      return { ...state, [action.order.id]: action.order };

    default:
      return state;
  }
}

function makeOrderError(state = null, action) {
  switch (action.type) {
    case MAKE_ORDER_FAILURE:
      return action.error;

    case MAKE_ORDER_REQUEST:
    case MAKE_ORDER_SUCCESS:
    case MAKE_ORDER_FAILURE_DISMISS:
      return null;

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
      return state.filter(n => n.id !== action.id);

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

function errors(
  state = { allowanceError: undefined, makeOrderError: undefined },
  action
) {
  switch (action.type) {
    case MAKE_ORDER_FAILURE:
      return { ...state, makeOrderError: action.error };

    case MAKE_ORDER_SUCCESS:
    case MAKE_ORDER_FAILURE_DISMISS:
      return { ...state, makeOrderError: undefined };

    default:
      return state;
  }
}

function metamask(state = { loading: true }, action) {
  switch (action.type) {
    case METAMASK_LOADED:
      return { ...state, loading: false };

    default:
      return state;
  }
}

function rootSagaError(state = null, action) {
  switch (action.type) {
    case ROOT_SAGA_ERROR:
      return action.error;

    default:
      return state;
  }
}

export const rootReducer = combineReducers({
  nodeConnection,
  networks,
  localAccount,
  remoteAccount,
  orders,
  makeOrderError,
  notifications,
  errors,
  metamask,
  tokens,
  rootSagaError
});
