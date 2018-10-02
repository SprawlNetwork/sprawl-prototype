const { unserialize, serialize } = require("./serialization");

module.exports.encode = msg => JSON.stringify(msg, serialize, 2);

module.exports.decode = msgStr => JSON.parse(msgStr, unserialize);

module.exports.NEW_PEER = "NEW_PEER";
module.exports.newPeer = peerId => ({
  type: module.exports.NEW_PEER,
  peer: peerId
});

module.exports.PEER_REMOVED = "PEER_REMOVED";
module.exports.peerRemoved = peerId => ({
  type: module.exports.PEER_REMOVED,
  peer: peerId
});
