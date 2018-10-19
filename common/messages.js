import { serialize, unserialize } from "./serialization";

export const encode = msg => JSON.stringify(msg, serialize, 2);

export const decode = msgStr => JSON.parse(msgStr, unserialize);

export const NEW_PEER = "NEW_PEER";
export const newPeer = peerId => ({
  type: NEW_PEER,
  peer: peerId
});

export const PEER_REMOVED = "PEER_REMOVED";
export const peerRemoved = peerId => ({
  type: PEER_REMOVED,
  peer: peerId
});

export const ORDER_UPDATED = "ORDER_UPDATED";

export const orderUpdated = order => ({
  type: ORDER_UPDATED,
  order
});
