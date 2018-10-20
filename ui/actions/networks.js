export const LOCAL_NETWORK_ID_CHANGED = "LOCAL_NETWORK_ID_CHANGED";

export const localNetworkIdChanged = id => ({
  type: LOCAL_NETWORK_ID_CHANGED,
  id
});

export const REMOTE_NETWORK_ID_CHANGED = "REMOTE_NETWORK_ID_CHANGED";

export const remoteNetworkIdChanged = id => ({
  type: REMOTE_NETWORK_ID_CHANGED,
  id
});
