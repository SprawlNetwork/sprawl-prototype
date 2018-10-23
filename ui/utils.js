import { connect } from "react-redux";

export const connectSelectors = (selectorsMap = {}) =>
  connect((state, ownProps = {}) =>
    Object.assign(
      {},
      ...Object.keys(selectorsMap).map(k => ({ [k]: selectorsMap[k](state) })),
      ownProps
    )
  );
