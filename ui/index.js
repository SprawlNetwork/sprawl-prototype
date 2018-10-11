import "./style.css";

import { Provider } from "react-redux";
import React from "react";
import ReactDOM from "react-dom";

import configureStore from "./configureStore";
import { initBackgroundJobs } from "./background";

import App from "./containers/App";
import { connectionToNodeRequested, nodeAddressChanged } from "./actions";
import WebsocketUpdater from "./WebsocketUpdater";

const defaultNodeAddress = window.location.search
  ? window.location.search.substr(1)
  : "127.0.0.1:1337";

const store = configureStore();
store.dispatch(nodeAddressChanged(defaultNodeAddress));
store.dispatch(connectionToNodeRequested(defaultNodeAddress));

// TODO: Move the other backgroundJobs to WebsocketUpdater
window.addEventListener("load", _ => initBackgroundJobs(store));
window.addEventListener("load", _ => {
  const backgroundUpdater = new WebsocketUpdater(store);
  backgroundUpdater.start();
});

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
