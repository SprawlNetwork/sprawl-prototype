import "./style.css";

import { Provider } from "react-redux";
import React from "react";
import ReactDOM from "react-dom";

import createSagaMiddleware from "redux-saga";
import * as ethers from "ethers";
import { EthHelper } from "../common/eth";
import { configureStore } from "./configureStore";
import { rootSaga } from "./sagas";

import { App } from "./containers/App";
import {
  localNetworkIdChanged,
  metamaskLoaded,
  nodeAddressChanged
} from "./actions";
import { ErrorsBoundary } from "./containers/ErrorsBoundary";
import { rootSagaError } from "./actions/sagas";

const sagaMiddleware = createSagaMiddleware();

const store = configureStore(sagaMiddleware);

const defaultNodeAddress = window.location.search
  ? window.location.search.substr(1)
  : "127.0.0.1:1337";

store.dispatch(nodeAddressChanged(defaultNodeAddress));

window.addEventListener("load", () => {
  const injectedProvider = window.ethereum
    ? window.ethereum
    : window.web3.currentProvider;

  const ethHelper = new EthHelper(
    new ethers.providers.Web3Provider(injectedProvider)
  );

  ethHelper
    .getNetworkId()
    .then(id => store.dispatch(localNetworkIdChanged(id)));

  const rootSagaTask = sagaMiddleware.run(
    rootSaga,
    ethHelper,
    store.dispatch.bind(store)
  );

  rootSagaTask.done.catch(sagaError =>
    store.dispatch(rootSagaError(sagaError.error))
  );

  store.dispatch(metamaskLoaded());
});

ReactDOM.render(
  <Provider store={store}>
    <ErrorsBoundary>
      <App />
    </ErrorsBoundary>
  </Provider>,
  document.getElementById("root")
);
