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

export const LOCAL_ACCOUNT_WETH_ALLOWANCE_REQUEST =
  "LOCAL_ACCOUNT_WETH_ALLOWANCE_REQUEST";

export const localAccountWethAllowanceRequest = () => ({
  type: LOCAL_ACCOUNT_WETH_ALLOWANCE_REQUEST
});

export const LOCAL_ACCOUNT_ZRX_ALLOWANCE_REQUEST =
  "LOCAL_ACCOUNT_ZRX_ALLOWANCE_REQUEST";

export const localAccountZrxAllowanceRequest = () => ({
  type: LOCAL_ACCOUNT_ZRX_ALLOWANCE_REQUEST
});
