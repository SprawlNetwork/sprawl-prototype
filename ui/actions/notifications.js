export const NOTIFICATION_RECEIVED = "NOTIFICATION_RECEIVED";

export const notificationReceived = msg => ({
  type: NOTIFICATION_RECEIVED,
  msg
});

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
