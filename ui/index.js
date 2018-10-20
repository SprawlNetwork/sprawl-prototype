import "./style.css";

import { Provider } from "react-redux";
import React from "react";
import ReactDOM from "react-dom";

import configureStore from "./configureStore";
import createSagaMiddleware from "redux-saga";
import { rootSaga } from "./sagas";

import App from "./containers/App";
import {
  localNetworkIdChanged,
  metamaskLoaded,
  nodeAddressChanged
} from "./actions";
import { EthHelper } from "../common/eth";
import * as ethers from "ethers";

const sagaMiddleware = createSagaMiddleware();

const store = configureStore(sagaMiddleware);

const defaultNodeAddress = window.location.search
  ? window.location.search.substr(1)
  : "127.0.0.1:1337";

store.dispatch(nodeAddressChanged(defaultNodeAddress));

window.addEventListener("load", () => {
  store.dispatch(metamaskLoaded());

  const injectedProvider = window.ethereum
    ? window.ethereum
    : window.web3.currentProvider;

  const ethHelper = new EthHelper(
    new ethers.providers.Web3Provider(injectedProvider)
  );

  ethHelper
    .getNetworkId()
    .then(id => store.dispatch(localNetworkIdChanged(id)));

  sagaMiddleware.run(rootSaga, ethHelper, store.dispatch.bind(store));
});

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root")
);
