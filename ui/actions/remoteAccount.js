import { call } from "../rpc";
import { getEthBalance } from "../eth";

export const REMOTE_ACCOUNT_LOAD_STARTED = "REMOTE_ACCOUNT_LOAD_STARTED";

export const remoteAccountLoadStarted = () => ({
  type: REMOTE_ACCOUNT_LOAD_STARTED
});

export const REMOTE_ACCOUNT_LOAD_SUCCESS = "REMOTE_ACCOUNT_LOAD_SUCCESS";

export const remoteAccountLoadSuccess = (address, ethBalance) => ({
  type: REMOTE_ACCOUNT_LOAD_SUCCESS,
  address,
  ethBalance
});

export const REMOTE_ACCOUNT_LOAD_FAILED = "REMOTE_ACCOUNT_LOAD_FAILED";

export const remoteAccountLoadFailed = error => ({
  type: REMOTE_ACCOUNT_LOAD_FAILED,
  error
});

export const remoteAccountLoadRequest = nodeAddress => async dispatch => {
  dispatch(remoteAccountLoadStarted());

  let remoteAccountAddress;
  let balance;

  try {
    remoteAccountAddress = await call(nodeAddress, "getAddress");
    balance = await getEthBalance(remoteAccountAddress);
  } catch (error) {
    return dispatch(remoteAccountLoadFailed(error));
  }

  dispatch(remoteAccountLoadSuccess(remoteAccountAddress, balance));
};

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
    dispatch(remoteAccountBalanceUpdated(newBalance));
  }
};
