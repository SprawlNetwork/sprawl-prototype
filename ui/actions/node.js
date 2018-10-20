export const NODE_ADDRESS_CHANGED = "NODE_ADDRESS_CHANGED";

export const nodeAddressChanged = address => {
  return {
    type: NODE_ADDRESS_CHANGED,
    address
  };
};

export const CONNECTION_ERROR_CHANGED = "CONNECTION_ERROR_CHANGED";

export function connectionErrorChanged(connectionError) {
  return {
    type: CONNECTION_ERROR_CHANGED,
    connectionError
  };
}

export const CONNECTION_TO_NODE_STARTED = "CONNECTION_TO_NODE_STARTED";

export const connectionToNodeStarted = () => ({
  type: CONNECTION_TO_NODE_STARTED
});

export const CONNECTION_TO_NODE_SUCCESS = "CONNECTION_TO_NODE_SUCCESS";

export const connectionToNodeSuccess = () => ({
  type: CONNECTION_TO_NODE_SUCCESS
});

export const CONNECTION_TO_NODE_REQUESTED = "CONNECTION_TO_NODE_REQUESTED";

export const connectionToNodeRequested = nodeAddress => ({
  type: CONNECTION_TO_NODE_REQUESTED,
  nodeAddress
});

export const NEW_PEER = "NEW_PEER";

export const newPeer = peer => ({
  type: NEW_PEER,
  peer
});

export const PEER_REMOVED = "PEER_REMOVED";

export const peerRemoved = peer => ({
  type: PEER_REMOVED,
  peer
});
