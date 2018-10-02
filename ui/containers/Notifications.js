import React, { Component } from "react";
import { connect } from "react-redux";
import { CSSTransitionGroup } from "react-transition-group";

import Notification from "./Notification";

class Notifications extends Component {
  render() {
    return (
      <div
        className="d-none d-md-block"
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          width: "auto"
        }}
      >
        <CSSTransitionGroup
          transitionName="notification"
          transitionEnterTimeout={500}
          transitionLeaveTimeout={300}
        >
          {this.props.notifications.map(n => (
            <Notification key={n.id} id={n.id} msg={n.msg} />
          ))}
        </CSSTransitionGroup>
      </div>
    );
  }
}

const mapStateToProps = ({ notifications }) => ({
  notifications
});

export default connect(mapStateToProps)(Notifications);
