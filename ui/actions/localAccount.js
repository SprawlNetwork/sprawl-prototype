import { getEthBalance } from "../eth";

export const LOCAL_ACCOUNT_CHANGED = "LOCAL_ACCOUNT_CHANGED";

export const localAccountChanged = address => {
  return {
    type: LOCAL_ACCOUNT_CHANGED,
    address
  };
};

export const updateLocalAccountIfNecessary = () => (dispatch, getState) => {
  const {
    localAccount: { address: current }
  } = getState();
  const updated = window.web3 && window.web3.eth.accounts[0];

  if (updated === current) {
    return null;
  }

  return dispatch(localAccountChanged(updated));
};

export const LOCAL_ACCOUNT_BALANCE_UPDATED = "LOCAL_ACCOUNT_BALANCE_UPDATED";

export const localAccountBalanceUpdated = ethBalance => ({
  type: LOCAL_ACCOUNT_BALANCE_UPDATED,
  ethBalance
});

export const localAccountBalanceUpdateRequest = () => async (
  dispatch,
  getState
) => {
  const {
    localAccount: { address }
  } = getState();

  if (address === undefined) {
    return null;
  }

  const newBalance = await getEthBalance(address);

  const {
    localAccount: { ethBalance }
  } = getState();

  if (ethBalance === undefined || !newBalance.eq(ethBalance)) {
    dispatch(localAccountBalanceUpdated(newBalance));
  }
};
