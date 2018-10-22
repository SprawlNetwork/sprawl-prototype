import { applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";

import rootReducer from "./reducers";
import { createLogger } from "redux-logger";

const configureStore = (sagaMiddleware, preloadedState) => {
  return createStore(
    rootReducer,
    preloadedState,
    composeWithDevTools(applyMiddleware(sagaMiddleware, createLogger()))
  );
};

export default configureStore;
