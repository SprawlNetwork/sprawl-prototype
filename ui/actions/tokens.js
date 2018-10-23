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

export const TOKEN_SET_ALLOWANCE_CANCELLED = "TOKEN_SET_ALLOWANCE_CANCELLED";

export const tokenSetAllowanceCancelled = address => ({
  type: TOKEN_SET_ALLOWANCE_CANCELLED,
  address
});

export const TOKEN_FAUCET_REQUESTED = "TOKEN_FAUCET_REQUESTED";

export const tokenFaucetRequested = address => ({
  type: TOKEN_FAUCET_REQUESTED,
  address
});

export const TOKEN_FAUCET_STARTED = "TOKEN_FAUCET_STARTED";

export const tokenFaucetStarted = address => ({
  type: TOKEN_FAUCET_STARTED,
  address
});

export const TOKEN_FAUCET_FAILED = "TOKEN_FAUCET_FAILED";

export const tokenFaucetFailed = (address, error) => ({
  type: TOKEN_FAUCET_FAILED,
  address,
  error
});

export const TOKEN_FAUCET_SUCCESS = "TOKEN_FAUCET_SUCCESS";

export const tokenFaucetSuccess = address => ({
  type: TOKEN_FAUCET_SUCCESS,
  address
});

export const TOKEN_FAUCET_ERROR_DISMISS = "TOKEN_FAUCET_ERROR_DISMISS";

export const tokenFaucetErrorDismiss = address => ({
  type: TOKEN_FAUCET_ERROR_DISMISS,
  address
});

export const TOKEN_FAUCET_CANCELLED = "TOKEN_FAUCET_CANCELLED";

export const tokenFaucetCancelled = address => ({
  type: TOKEN_FAUCET_CANCELLED,
  address
});
