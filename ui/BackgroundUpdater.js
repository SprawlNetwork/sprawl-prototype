import ReconnectingWebsocket from "reconnecting-websocket";

import { decode, NEW_PEER, PEER_REMOVED } from "../common/messages";
import { notificationReceived } from "./actions/notifications";

export default class BackgroundUpdater {
  constructor(store) {
    this.store = store;
    this.setupNewNode();
  }

  setupNewNode() {
    this.currentNodeAddress = this.getNodeAddress();
    this.connectWebsockets();
  }

  start() {
    this.store.subscribe(this.onStateChanged.bind(this));
  }

  onStateChanged() {
    if (this.getNodeAddress() !== this.currentNodeAddress) {
      this.setupNewNode();
    }
  }

  getNodeAddress() {
    return this.store.getState().nodeAddress;
  }

  connectWebsockets() {
    if (this.ws !== undefined) {
      this.ws.close();
      this.ws = undefined;
    }

    this.ws = new ReconnectingWebsocket(this.getWsUrl());

    this.ws.onopen = openEvent => {
      console.log("WebSocket connected to", openEvent.currentTarget.url);
    };

    this.ws.onmessage = messageEvent => {
      if (messageEvent.currentTarget.url === this.getWsUrl()) {
        const msg = decode(messageEvent.data);

        const id = new Date().getTime();

        switch (msg.type) {
          case NEW_PEER:
            return this.store.dispatch(
              notificationReceived(id, "Connected to node " + msg.peer)
            );

          case PEER_REMOVED:
            return this.store.dispatch(
              notificationReceived(id, "Disconnected from " + msg.peer)
            );
        }

        console.log(msg);
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
