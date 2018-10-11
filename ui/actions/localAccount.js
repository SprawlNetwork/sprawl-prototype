import {
  getEthBalance,
  getWeth0xProxyAllowance,
  getWethBalance,
  getZrx0xProxyAllowance,
  getZrxBalance
} from "../../common/eth";

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
  getEthBalance,
  state => state.localAccount.ethBalance,
  localAccountEthBalanceUpdated
);

export const localAccountWethBalanceUpdateRequest = createLocalAccountFieldUpdateRequestThunk(
  getWethBalance,
  state => state.localAccount.wethBalance,
  localAccountWethBalanceUpdated
);

export const localAccountZrxBalanceUpdateRequest = createLocalAccountFieldUpdateRequestThunk(
  getZrxBalance,
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
  getWeth0xProxyAllowance,
  state => state.localAccount.wethAllowance,
  localAccountWethAllowanceUpdated
);

export const localAccountZrxAllowanceUpdateRequest = createLocalAccountFieldUpdateRequestThunk(
  getZrx0xProxyAllowance,
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

    if (currentValue === undefined || !updatedValue.eq(currentValue)) {
      dispatch(successActionCreator(updatedValue));
    }
  };
}
