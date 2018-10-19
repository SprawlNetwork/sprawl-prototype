import ReconnectingWebsocket from "reconnecting-websocket";

import {
  decode,
  NEW_PEER,
  ORDER_UPDATED,
  PEER_REMOVED
} from "../common/messages";
import { notificationReceived } from "./actions/notifications";
import { nodeAddress } from "./selectors";
import { ordersUpdated, ordersUpdateRequest } from "./actions";

export default class WebsocketUpdater {
  constructor(store) {
    this.store = store;
    this.setupNewNode();
  }

  setupNewNode() {
    this.currentNodeAddress = nodeAddress(this.store.getState());
    this.connectWebsockets();
  }

  start() {
    this.store.subscribe(this.onStateChanged.bind(this));
  }

  onStateChanged() {
    if (nodeAddress(this.store.getState()) !== this.currentNodeAddress) {
      this.setupNewNode();
    }
  }

  connectWebsockets() {
    if (this.ws !== undefined) {
      this.ws.close();
      this.ws = undefined;
    }

    this.ws = new ReconnectingWebsocket(this.getWsUrl());

    this.ws.onmessage = messageEvent => {
      if (messageEvent.currentTarget.url === this.getWsUrl()) {
        const msg = decode(messageEvent.data);

        console.log("Websocket message received", msg);

        const id = new Date().getTime();
        switch (msg.type) {
          case NEW_PEER:
            this.store.dispatch(ordersUpdateRequest(this.currentNodeAddress));
            return this.store.dispatch(
              notificationReceived(id, "Connected to node " + msg.peer)
            );

          case PEER_REMOVED:
            this.store.dispatch(ordersUpdateRequest(this.currentNodeAddress));
            return this.store.dispatch(
              notificationReceived(id, "Disconnected from " + msg.peer)
            );

          case ORDER_UPDATED:
            return this.store.dispatch(ordersUpdated([msg.order], []));

          default:
            console.warn("Unrecognized message type", msg.type);
        }
      }
    };

    this.ws.onerror = errorEvent => {
      if (errorEvent.currentTarget.url === this.getWsUrl()) {
        console.warn("WebSocket error", errorEvent);
      }
    };
  }

  getWsUrl() {
    return "ws://" + this.currentNodeAddress + "/";
  }
}
