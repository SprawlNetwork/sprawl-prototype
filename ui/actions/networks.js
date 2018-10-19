import { updateLocalAccountAddressIfNecessary } from "./localAccount";

export const updateLocalNetworkIdIfNecessary = () => async (
  dispatch,
  getState
) => {
  const {
    networks: {
      local: { networkId: current }
    }
  } = getState();

  const updated =
    window.web3 && window.web3.version.network && +window.web3.version.network;

  if (updated === current) {
    return null;
  }

  dispatch(updateLocalAccountAddressIfNecessary());
  return dispatch(localNetworkIdChanged(updated));
};

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
