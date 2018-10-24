import React, { Component } from "react";
import { connect } from "react-redux";
import { CSSTransitionGroup } from "react-transition-group";

import { Notification } from "./Notification";

class NotificationsComponent extends Component {
  render() {
    return (
      <div className="notificationsContainer d-none d-md-block">
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

export const Notifications = connect(mapStateToProps)(NotificationsComponent);
