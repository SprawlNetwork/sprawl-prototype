import React, { PureComponent } from "react";
import { connect } from "react-redux";

import { notificationDismissed } from "../actions/notifications";

class Notification extends PureComponent {
  dismiss = () => this.props.dispatch(notificationDismissed(this.props.id));

  render() {
    return (
      <div
        className="alert alert-info alert-dismissible fade show"
        role="alert"
      >
        {this.props.msg}
        <button
          type="button"
          className="close"
          data-dismiss="alert"
          aria-label="Close"
          onClick={this.dismiss}
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    );
  }
}

export default connect()(Notification);
