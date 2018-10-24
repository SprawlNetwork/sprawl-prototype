import ReconnectingWebsocket from "reconnecting-websocket";

import {
  decode,
  NEW_PEER,
  ORDER_UPDATED,
  PEER_REMOVED,
  NODE_LOG
} from "../common/messages";
import { newPeer, ordersUpdated, peerRemoved } from "./actions";

export class WebsocketUpdater {
  constructor(actionsDispatcher) {
    this._actionsDispatcher = actionsDispatcher;
  }

  start(nodeAddress) {
    this._wsUrl = "ws://" + nodeAddress + "/";

    this._ws = new ReconnectingWebsocket(this._wsUrl);

    this._ws.onopen = () =>
      console.log(
        `%c[${new Date().toLocaleString()}] Connected to node ` + nodeAddress,
        "font-weight: bold"
      );

    this._ws.onerror = errorEvent => {
      console.warn("WebSocket error", errorEvent);
    };

    this._ws.onmessage = messageEvent => {
      this._onMessage(decode(messageEvent.data));
    };
  }

  stop() {
    if (this._ws) {
      this._ws.close();
    }
  }

  _dispatch(action) {
    this._actionsDispatcher(action);
  }

  _onMessage(msg) {
    switch (msg.type) {
      case NEW_PEER:
        return this._dispatch(newPeer(msg.peer));

      case PEER_REMOVED:
        return this._dispatch(peerRemoved(msg.peer));

      case ORDER_UPDATED:
        return this._dispatch(ordersUpdated([msg.order], []));

      case NODE_LOG:
        console.log(
          `%c[${new Date().toLocaleString()}] Message from node: %c` + msg.log,
          "font-weight: bold",
          "font-weight: normal"
        );
        break;

      default:
        console.warn("Unrecognized message", msg);
    }
  }
}
