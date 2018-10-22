export const TOKEN_ADDED = "TOKEN_ADDED";

export const tokenAdded = token => ({
  type: TOKEN_ADDED,
  token
});

export const TOKEN_BALANCE_UPDATED = "TOKEN_BALANCE_UPDATED";

export const tokenBalanceUpdated = (address, balance) => ({
  type: TOKEN_BALANCE_UPDATED,
  address,
  balance
});

export const TOKEN_ALLOWANCE_UPDATED = "TOKEN_ALLOWANCE_UPDATED";

export const tokenAllowanceUpdated = (address, allowance) => ({
  type: TOKEN_ALLOWANCE_UPDATED,
  address,
  allowance
});

export const TOKEN_SET_ALLOWANCE_REQUEST = "TOKEN_SET_ALLOWANCE_REQUEST";

export const tokenSetAllowanceRequest = address => ({
  type: TOKEN_SET_ALLOWANCE_REQUEST,
  address
});

export const TOKEN_SET_ALLOWANCE_STARTED = "TOKEN_SET_ALLOWANCE_STARTED";

export const tokenSetAllowanceStarted = address => ({
  type: TOKEN_SET_ALLOWANCE_STARTED,
  address
});

export const TOKEN_SET_ALLOWANCE_FAILED = "TOKEN_SET_ALLOWANCE_FAILED";

export const tokenSetAllowanceFailed = (address, error) => ({
  type: TOKEN_SET_ALLOWANCE_FAILED,
  address,
  error
});

export const TOKEN_SET_ALLOWANCE_SUCCESS = "TOKEN_SET_ALLOWANCE_SUCCESS";

export const tokenSetAllowanceSuccess = address => ({
  type: TOKEN_SET_ALLOWANCE_SUCCESS,
  address
});

export const TOKEN_SET_ALLOWANCE_ERROR_DISMISS =
  "TOKEN_SET_ALLOWANCE_ERROR_DISMISS";

export const tokenSetAllowanceErrorDismiss = address => ({
  type: TOKEN_SET_ALLOWANCE_ERROR_DISMISS,
  address
});
