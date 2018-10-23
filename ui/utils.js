import { connect } from "react-redux";
import { apply } from "redux-saga/effects";

export const connectSelectors = (selectorsMap = {}) =>
  connect((state, ownProps = {}) =>
    Object.assign(
      {},
      ...Object.keys(selectorsMap).map(k => ({ [k]: selectorsMap[k](state) })),
      ownProps
    )
  );

// eslint-disable-next-line redux-saga/no-unhandled-errors
export const callMethod = (obj, func, ...args) => apply(obj, func, args);
