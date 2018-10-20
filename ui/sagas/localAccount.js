import {
  put,
  select,
  all,
  call,
  takeLatest,
  takeEvery
} from "redux-saga/effects";
import { delay } from "redux-saga";
import {
  LOCAL_ACCOUNT_ADDRESS_CHANGED,
  LOCAL_ACCOUNT_WETH_ALLOWANCE_REQUEST,
  LOCAL_ACCOUNT_ZRX_ALLOWANCE_REQUEST,
  localAccountAddressChanged,
  localAccountEthBalanceUpdated,
  localAccountWethAllowanceUpdated,
  localAccountWethBalanceUpdated,
  localAccountZrxAllowanceUpdated,
  localAccountZrxBalanceUpdated,
  MAKE_ORDER_REQUEST,
  TAKE_ORDER_REQUEST,
  wethAllowanceSettingError,
  wethAllowanceSettingStarted,
  wethAllowanceSettingSuccess,
  zrxAllowanceSettingError,
  zrxAllowanceSettingStarted,
  zrxAllowanceSettingSuccess
} from "../actions";
import { localAccountAddress } from "../selectors";
import { makeOrderSaga, takeOrderSaga } from "./orders";

function arEqual(current, updated) {
  if (current !== undefined && current.eq !== undefined) {
    return current.eq(updated);
  }

  return current === updated;
}

function* updateValue(
  currentValueSelector,
  updatedValueGetter,
  successActionCreator,
  title = "local account value",
  interval = 1000
) {
  while (true) {
    try {
      const current = yield select(currentValueSelector);
      const updated = yield call(updatedValueGetter);

      if (!arEqual(current, updated)) {
        yield put(successActionCreator(updated));
      }
    } catch (error) {
      console.error("Error updating " + title, error);
    }

    yield delay(interval);
  }
}

const updateLocalAccountAddressSaga = () =>
  updateValue(
    localAccountAddress,
    () => window.web3 && window.web3.eth.accounts[0],
    localAccountAddressChanged,
    "local account address"
  );

function* localAccountActionsAndUpdatesSaga(ethHelper, { address }) {
  const UPDATES_INTERVAL = 3000;

  try {
    yield takeEvery(
      LOCAL_ACCOUNT_WETH_ALLOWANCE_REQUEST,
      createSetAllowanceSaga(
        () => ethHelper.set0xERC20ProxyWethUnllimitedAllowance(address),
        wethAllowanceSettingStarted,
        wethAllowanceSettingSuccess,
        wethAllowanceSettingError
      ),
      ethHelper
    );

    yield takeEvery(
      LOCAL_ACCOUNT_ZRX_ALLOWANCE_REQUEST,
      createSetAllowanceSaga(
        () => ethHelper.set0xERC20ProxyZrxUnllimitedAllowance(address),
        zrxAllowanceSettingStarted,
        zrxAllowanceSettingSuccess,
        zrxAllowanceSettingError
      ),
      ethHelper
    );

    yield takeEvery(MAKE_ORDER_REQUEST, makeOrderSaga, ethHelper, address);
    yield takeEvery(TAKE_ORDER_REQUEST, takeOrderSaga, ethHelper, address);

    yield all([
      updateValue(
        state => state.localAccount.ethBalance,
        () => ethHelper.getEthBalance(address),
        localAccountEthBalanceUpdated,
        "ETH balance of " + address,
        UPDATES_INTERVAL
      ),
      updateValue(
        state => state.localAccount.wethBalance,
        () => ethHelper.getWethBalance(address),
        localAccountWethBalanceUpdated,
        "WETH balance of " + address,
        UPDATES_INTERVAL
      ),
      updateValue(
        state => state.localAccount.zrxBalance,
        () => ethHelper.getZrxBalance(address),
        localAccountZrxBalanceUpdated,
        "ZRX balance of " + address,
        UPDATES_INTERVAL
      ),
      updateValue(
        state => state.localAccount.wethAllowance,
        () => ethHelper.get0xERC20ProxyWethAllowance(address),
        localAccountWethAllowanceUpdated,
        "WETH allowance of " + address,
        UPDATES_INTERVAL
      ),
      updateValue(
        state => state.localAccount.zrxAllowance,
        () => ethHelper.get0xERC20ProxyZrxAllowance(address),
        localAccountZrxAllowanceUpdated,
        "ZRX allowance of " + address,
        UPDATES_INTERVAL
      )
    ]);
  } catch (error) {
    console.error(
      "Error updating local account " + address + " balances and allowances",
      error
    );
  }
}

function createSetAllowanceSaga(
  allowanceSetter,
  allowanceSettingStartedActionCreator,
  allowanceSettingSuccessActionCreator,
  allowanceSettingErrorActionCreator
) {
  return function*(ethHelper) {
    try {
      yield put(allowanceSettingStartedActionCreator());

      const tx = yield call(allowanceSetter);
      yield call(() => ethHelper.waitForTxMinned(tx));

      yield put(allowanceSettingSuccessActionCreator());
    } catch (e) {
      console.error("Error setting allowance", e);
      yield put(allowanceSettingErrorActionCreator(e));
    }
  };
}

function* startUpdatingNewAccountsSaga(ethHelper) {
  yield takeLatest(
    LOCAL_ACCOUNT_ADDRESS_CHANGED,
    localAccountActionsAndUpdatesSaga,
    ethHelper
  );
}

export function* localAccountSaga(ethHelper) {
  try {
    yield all([
      startUpdatingNewAccountsSaga(ethHelper),
      updateLocalAccountAddressSaga()
    ]);
  } catch (error) {
    console.error("Error in local account saga", error);
  }
}
