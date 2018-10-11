import {
  updateLocalAccountAddressIfNecessary,
  checkConnectionState,
  remoteAccountBalanceUpdateRequest,
  localAccountEthBalanceUpdateRequest,
  ordersUpdateRequest,
  updateLocalNetworkIdIfNecessary,
  localAccountWethBalanceUpdateRequest,
  localAccountZrxBalanceUpdateRequest,
  localAccountWethAllowanceUpdateRequest,
  localAccountZrxAllowanceUpdateRequest
} from "./actions";
import { nodeAddress } from "./selectors";

function shouldPingConnection(state) {
  return state.nodeConnection.connected;
}

function shouldUpdateRemoteAccountBalance(state) {
  return state.nodeConnection.connected && state.remoteAccount.address;
}

function shouldUpdateOrders(state) {
  return state.nodeConnection.connected;
}

function callEveryNMilliseconds(millis, func, ...params) {
  func(...params);

  setTimeout(() => callEveryNMilliseconds(millis, func, ...params), millis);
}

function setupLocalAccountUpdateBackgroundJob(store) {
  callEveryNMilliseconds(300, () => {
    store.dispatch(updateLocalAccountAddressIfNecessary());

    if (store.getState().localAccount.address) {
      store.dispatch(localAccountEthBalanceUpdateRequest());
      store.dispatch(localAccountWethBalanceUpdateRequest());
      store.dispatch(localAccountZrxBalanceUpdateRequest());
      store.dispatch(localAccountWethAllowanceUpdateRequest());
      store.dispatch(localAccountZrxAllowanceUpdateRequest());
    }
  });
}

function setupLocalNetworkIdUpdateBackgroundJob(store) {
  callEveryNMilliseconds(300, () => {
    store.dispatch(updateLocalNetworkIdIfNecessary());
  });
}

function setupConnectionStateBackgroundJob(store) {
  callEveryNMilliseconds(1000, () => {
    const state = store.getState();
    if (shouldPingConnection(state)) {
      store.dispatch(checkConnectionState(nodeAddress(state)));
    }
  });
}

function setupRemoteAccountBalanceUpdatesBackgroundJob(store) {
  callEveryNMilliseconds(1000, () => {
    const state = store.getState();
    if (shouldUpdateRemoteAccountBalance(state)) {
      store.dispatch(remoteAccountBalanceUpdateRequest());
    }
  });
}

function setupOrdersUpdateBackgroundJob(store) {
  callEveryNMilliseconds(1000, () => {
    const state = store.getState();
    if (shouldUpdateOrders(state)) {
      store.dispatch(ordersUpdateRequest(nodeAddress(state)));
    }
  });
}

export function initBackgroundJobs(store) {
  setupConnectionStateBackgroundJob(store);
  setupLocalAccountUpdateBackgroundJob(store);
  setupRemoteAccountBalanceUpdatesBackgroundJob(store);
  setupOrdersUpdateBackgroundJob(store);
  setupLocalNetworkIdUpdateBackgroundJob(store);
}
