import { PureComponent } from "react";
import { connectSelectors } from "../redux";
import React from "react";

class ErrorsBoundary extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {};
  }

  componentDidCatch(error, info) {
    this.setState({ renderError: error, renderErrorInfo: info });

    console.error("Uncaught error got into the error boundary", error, info);
  }

  render() {
    if (this.props.error || this.state.renderError) {
      return (
        <div className="overlay-message error-boundary">
          <div>
            <h2>An error occurred, please reload the page and try again</h2>
            <h3>If this problem persists please report it</h3>
            <div className="error-info">
              <pre>
                <code>{this._getErrorDump()}</code>
              </pre>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }

  _getErrorDump() {
    if (this.state.renderError) {
      return `${this.state.renderError.stack}
      
Components stack:${this.state.renderErrorInfo.componentStack}`;
    }

    return this.props.error.stack;
  }
}

export default connectSelectors({ error: state => state.rootSagaError })(
  ErrorsBoundary
);
