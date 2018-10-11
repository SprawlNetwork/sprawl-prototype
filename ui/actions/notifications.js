import _ from "lodash";

export const notificationReceived = (
  id = _.random(1, 1000),
  msg
) => dispatch => {
  dispatch(notificationAdded(id, msg));

  setTimeout(() => dispatch(notificationExpired(id)), 10000);
};

export const NOTIFICATION_ADDED = "NOTIFICATION_ADDED";

export const notificationAdded = (id, msg) => ({
  type: NOTIFICATION_ADDED,
  id,
  msg
});

export const NOTIFICATION_EXPIRED = "NOTIFICATION_EXPIRED";

export const notificationExpired = id => ({
  type: NOTIFICATION_EXPIRED,
  id
});

export const NOTIFICATION_DISMISSED = "NOTIFICATION_DISMISSED";

export const notificationDismissed = id => ({
  type: NOTIFICATION_DISMISSED,
  id
});
