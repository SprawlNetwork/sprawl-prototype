import { applyMiddleware, createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";

import { rootReducer } from "./reducers";
import { createLogger } from "redux-logger";

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
