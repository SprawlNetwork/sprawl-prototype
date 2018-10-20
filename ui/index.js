import "./style.css";

import { Provider } from "react-redux";
import React from "react";
import ReactDOM from "react-dom";

import configureStore from "./configureStore";
import { initBackgroundJobs } from "./background";
import createSagaMiddleware from "redux-saga";
import { initEthHelper } from "./eth";
import { rootSaga } from "./sagas";

import App from "./containers/App";
import { metamaskLoaded, nodeAddressChanged } from "./actions";
import WebsocketUpdater from "./WebsocketUpdater";

const defaultNodeAddress = window.location.search
  ? window.location.search.substr(1)
  : "127.0.0.1:1337";

const sagaMiddleware = createSagaMiddleware();

const store = configureStore(sagaMiddleware);

window.addEventListener("load", () => {
  // This is fine ☕️🔥
  const ethHelper = initEthHelper();

  sagaMiddleware.run(rootSaga, ethHelper);

  store.dispatch(metamaskLoaded());

  initBackgroundJobs(store);

  const backgroundUpdater = new WebsocketUpdater(store);
  backgroundUpdater.start();
});

store.dispatch(nodeAddressChanged(defaultNodeAddress));

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
