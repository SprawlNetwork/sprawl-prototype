import { ethHelper } from "../eth";

export const LOCAL_ACCOUNT_ADDRESS_CHANGED = "LOCAL_ACCOUNT_ADDRESS_CHANGED";

export const localAccountAddressChanged = address => {
  return {
    type: LOCAL_ACCOUNT_ADDRESS_CHANGED,
    address
  };
};

export const updateLocalAccountAddressIfNecessary = () => (
  dispatch,
  getState
) => {
  const {
    localAccount: { address: current }
  } = getState();
  const updated = window.web3 && window.web3.eth.accounts[0];

  if (updated === current) {
    return null;
  }

  return dispatch(localAccountAddressChanged(updated));
};

export const LOCAL_ACCOUNT_ETH_BALANCE_UPDATED =
  "LOCAL_ACCOUNT_ETH_BALANCE_UPDATED";

export const localAccountEthBalanceUpdated = ethBalance => ({
  type: LOCAL_ACCOUNT_ETH_BALANCE_UPDATED,
  ethBalance
});

export const LOCAL_ACCOUNT_WETH_BALANCE_UPDATED =
  "LOCAL_ACCOUNT_WETH_BALANCE_UPDATED";

export const localAccountWethBalanceUpdated = wethBalance => ({
  type: LOCAL_ACCOUNT_WETH_BALANCE_UPDATED,
  wethBalance
});

export const LOCAL_ACCOUNT_ZRX_BALANCE_UPDATED =
  "LOCAL_ACCOUNT_ZRX_BALANCE_UPDATED";

export const localAccountZrxBalanceUpdated = zrxBalance => ({
  type: LOCAL_ACCOUNT_ZRX_BALANCE_UPDATED,
  zrxBalance
});

export const localAccountEthBalanceUpdateRequest = createLocalAccountFieldUpdateRequestThunk(
  address => ethHelper.getEthBalance(address),
  state => state.localAccount.ethBalance,
  localAccountEthBalanceUpdated
);

export const localAccountWethBalanceUpdateRequest = createLocalAccountFieldUpdateRequestThunk(
  address => ethHelper.getWethPendingBalance(address),
  state => state.localAccount.wethBalance,
  localAccountWethBalanceUpdated
);

export const localAccountZrxBalanceUpdateRequest = createLocalAccountFieldUpdateRequestThunk(
  address => ethHelper.getZrxPendingBalance(address),
  state => state.localAccount.zrxBalance,
  localAccountZrxBalanceUpdated
);

export const LOCAL_ACCOUNT_WETH_ALLOWANCE_UPDATED =
  "LOCAL_ACCOUNT_WETH_ALLOWANCE_UPDATED";

export const localAccountWethAllowanceUpdated = wethAllowance => ({
  type: LOCAL_ACCOUNT_WETH_ALLOWANCE_UPDATED,
  wethAllowance
});

export const LOCAL_ACCOUNT_ZRX_ALLOWANCE_UPDATED =
  "LOCAL_ACCOUNT_ZRX_ALLOWANCE_UPDATED";

export const localAccountZrxAllowanceUpdated = zrxAllowance => ({
  type: LOCAL_ACCOUNT_ZRX_ALLOWANCE_UPDATED,
  zrxAllowance
});

export const localAccountWethAllowanceUpdateRequest = createLocalAccountFieldUpdateRequestThunk(
  address => ethHelper.get0xERC20ProxyWethAllowance(address),
  state => state.localAccount.wethAllowance,
  localAccountWethAllowanceUpdated
);

export const localAccountZrxAllowanceUpdateRequest = createLocalAccountFieldUpdateRequestThunk(
  address => ethHelper.get0xERC20ProxyZrxAllowance(address),
  state => state.localAccount.zrxAllowance,
  localAccountZrxAllowanceUpdated
);

function createLocalAccountFieldUpdateRequestThunk(
  updatedValueGetter,
  currentValueSelector,
  successActionCreator
) {
  return () => async (dispatch, getState) => {
    const {
      localAccount: { address }
    } = getState();

    if (address === undefined) {
      return null;
    }

    const updatedValue = await updatedValueGetter(address);
    const currentValue = currentValueSelector(getState());

    if (currentValue === undefined || !currentValue.eq(updatedValue)) {
      return dispatch(successActionCreator(updatedValue));
    }
  };
}

export const WETH_ALLOWANCE_SETTING_STARTED = "WETH_ALLOWANCE_SETTING_STARTED";

export const wethAllowanceSettingStarted = () => ({
  type: WETH_ALLOWANCE_SETTING_STARTED
});

export const WETH_ALLOWANCE_SETTING_SUCCESS = "WETH_ALLOWANCE_SETTING_SUCCESS";

export const wethAllowanceSettingSuccess = () => ({
  type: WETH_ALLOWANCE_SETTING_SUCCESS
});

export const WETH_ALLOWANCE_SETTING_ERROR = "WETH_ALLOWANCE_SETTING_ERROR";

export const wethAllowanceSettingError = error => ({
  type: WETH_ALLOWANCE_SETTING_ERROR,
  error
});

export const WETH_ALLOWANCE_SETTING_ERROR_DISMISS =
  "WETH_ALLOWANCE_SETTING_ERROR_DISMISS";

export const wethAllowanceSettingErrorDismiss = () => ({
  type: WETH_ALLOWANCE_SETTING_ERROR_DISMISS
});

export const ZRX_ALLOWANCE_SETTING_STARTED = "ZRX_ALLOWANCE_SETTING_STARTED";

export const zrxAllowanceSettingStarted = () => ({
  type: ZRX_ALLOWANCE_SETTING_STARTED
});

export const ZRX_ALLOWANCE_SETTING_SUCCESS = "ZRX_ALLOWANCE_SETTING_SUCCESS";

export const zrxAllowanceSettingSuccess = () => ({
  type: ZRX_ALLOWANCE_SETTING_SUCCESS
});

export const ZRX_ALLOWANCE_SETTING_ERROR = "ZRX_ALLOWANCE_SETTING_ERROR";

export const zrxAllowanceSettingError = error => ({
  type: ZRX_ALLOWANCE_SETTING_ERROR,
  error
});

export const ZRX_ALLOWANCE_SETTING_ERROR_DISMISS =
  "ZRX_ALLOWANCE_SETTING_ERROR_DISMISS";

export const zrxAllowanceSettingErrorDismiss = () => ({
  type: ZRX_ALLOWANCE_SETTING_ERROR_DISMISS
});

const createSetAllowanceThunk = (
  allowanceSetter,
  allowanceSettingStartedActionCreator,
  allowanceSettingSuccessActionCreator,
  allowanceSettingErrorActionCreator,
  allowanceUpdateRequestActionCreator
) => () => async (dispatch, getState) => {
  const {
    localAccount: { address },
    remoteAccount: { address: remoteAddress }
  } = getState();

  const signedOrder = await ethHelper.createAndSignOrder(
    address,
    remoteAddress,
    1,
    2,
    false
  );

  const signedTakeOrderTransaction = await ethHelper.signTakeOrderTransaction(
    address,
    signedOrder
  );

  console.log(signedOrder);
  console.log(signedTakeOrderTransaction);
  return;

  await dispatch(allowanceSettingStartedActionCreator());

  try {
    const tx = await allowanceSetter(address);
    await ethHelper.waitForTxMinned(tx);
  } catch (e) {
    console.error("Error setting allowance", e);
    return dispatch(allowanceSettingErrorActionCreator(e));
  }

  await dispatch(allowanceUpdateRequestActionCreator());
  return dispatch(allowanceSettingSuccessActionCreator());
};

export const localAccountWethAllowanceRequest = createSetAllowanceThunk(
  address => ethHelper.set0xERC20ProxyWethUnllimitedAllowance(address),
  wethAllowanceSettingStarted,
  wethAllowanceSettingSuccess,
  wethAllowanceSettingError,
  localAccountWethAllowanceUpdateRequest
);

export const localAccountZrxAllowanceRequest = createSetAllowanceThunk(
  address => ethHelper.set0xERC20ProxyZrxUnllimitedAllowance(address),
  zrxAllowanceSettingStarted,
  zrxAllowanceSettingSuccess,
  zrxAllowanceSettingError,
  localAccountZrxAllowanceUpdateRequest
);
