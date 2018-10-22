export const LOCAL_ACCOUNT_ADDRESS_CHANGED = "LOCAL_ACCOUNT_ADDRESS_CHANGED";

export const localAccountAddressChanged = address => {
  return {
    type: LOCAL_ACCOUNT_ADDRESS_CHANGED,
    address
  };
};

export const LOCAL_ACCOUNT_ETH_BALANCE_UPDATED =
  "LOCAL_ACCOUNT_ETH_BALANCE_UPDATED";

export const localAccountEthBalanceUpdated = ethBalance => ({
  type: LOCAL_ACCOUNT_ETH_BALANCE_UPDATED,
  ethBalance
});
