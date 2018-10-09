import {
  updateLocalAccountIfNecessary,
  checkConnectionState,
  remoteAccountBalanceUpdateRequest,
  localAccountBalanceUpdateRequest,
  ordersUpdateRequest
} from "./actions";

function shouldPingConnection(state) {
  // If we couldn't load the remote account there's no need to check the
  // connection state, something isn't working.
  return !state.remoteAccount.loading && !state.remoteAccount.loadFailed;
}

function shouldUpdateRemoteAccountBalance(state) {
  return (
    !state.connectionError &&
    !state.remoteAccount.loading &&
    !state.remoteAccount.loadFailed
  );
}

function shouldUpdateOrders(state) {
  return (
    !state.connectionError &&
    !state.remoteAccount.loading &&
    !state.remoteAccount.loadFailed
  );
}

function callEveryNMilliseconds(millis, func, ...params) {
  func(...params);

  setTimeout(() => callEveryNMilliseconds(millis, func, ...params), millis);
}

function setupLocalAccountUpdateBackgroundJob(store) {
  callEveryNMilliseconds(300, () => {
    store.dispatch(updateLocalAccountIfNecessary());

    if (store.getState().localAccount.address) {
      store.dispatch(localAccountBalanceUpdateRequest());
    }
  });
}

function setupConnectionStateBackgroundJob(store) {
  callEveryNMilliseconds(1000, () => {
    const state = store.getState();
    if (shouldPingConnection(state)) {
      store.dispatch(checkConnectionState(state.nodeAddress));
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
    if (shouldUpdateRemoteAccountBalance(state)) {
      store.dispatch(ordersUpdateRequest(state.nodeAddress));
    }
  });
}

export function initBackgroundJobs(store) {
  setupConnectionStateBackgroundJob(store);
  setupLocalAccountUpdateBackgroundJob(store);
  setupRemoteAccountBalanceUpdatesBackgroundJob(store);
  setupOrdersUpdateBackgroundJob(store);
}
