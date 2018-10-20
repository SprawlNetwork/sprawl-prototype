export const REMOTE_ACCOUNT_ADDRESS_CHANGED = "REMOTE_ACCOUNT_ADDRESS_CHANGED";

export const remoteAccountAddressChanged = address => ({
  type: REMOTE_ACCOUNT_ADDRESS_CHANGED,
  address
});

export const REMOTE_ACCOUNT_BALANCE_UPDATED = "REMOTE_ACCOUNT_BALANCE_UPDATED";

export const remoteAccountBalanceUpdated = ethBalance => ({
  type: REMOTE_ACCOUNT_BALANCE_UPDATED,
  ethBalance
});
