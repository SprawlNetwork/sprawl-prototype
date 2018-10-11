import { getEthBalance } from "../../common/eth";

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

export const remoteAccountBalanceUpdateRequest = () => async (
  dispatch,
  getState
) => {
  const {
    remoteAccount: { address }
  } = getState();

  const newBalance = await getEthBalance(address);

  const {
    remoteAccount: { ethBalance }
  } = getState();

  if (ethBalance === undefined || !newBalance.eq(ethBalance)) {
    return dispatch(remoteAccountBalanceUpdated(newBalance));
  }
};
