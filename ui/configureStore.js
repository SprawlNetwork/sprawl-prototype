import { applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";

import { createLogger } from "redux-logger";
import { rootReducer } from "./reducers";

export const configureStore = (sagaMiddleware, preloadedState) => {
  const midlewares = [sagaMiddleware];

  /* global ENABLE_REDUX_LOGS */
  if (ENABLE_REDUX_LOGS) {
    midlewares.push(createLogger());
  }

  return createStore(
    rootReducer,
    preloadedState,
    composeWithDevTools(applyMiddleware(...midlewares))
  );
};
