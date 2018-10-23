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
  localAccountAddressChanged,
  localAccountEthBalanceUpdated,
  MAKE_ORDER_REQUEST,
  TAKE_ORDER_REQUEST,
  TOKEN_ADDED,
  TOKEN_FAUCET_REQUESTED,
  TOKEN_SET_ALLOWANCE_REQUEST,
  tokenAllowanceUpdated,
  tokenBalanceUpdated,
  tokenFaucetCancelled,
  tokenFaucetFailed,
  tokenFaucetStarted,
  tokenFaucetSuccess,
  tokenSetAllowanceCancelled,
  tokenSetAllowanceFailed,
  tokenSetAllowanceStarted,
  tokenSetAllowanceSuccess
} from "../actions";
import { localAccountAddress, metaMaskUnlocked } from "../selectors";
import { makeOrderSaga, takeOrderSaga } from "./orders";
import { SIGNATURE_CANCELLED_BY_USER } from "../../common/eth";

const UPDATES_INTERVAL = 3000;

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

      // Sometimes the message about unlocking metamask is always shown.
      // This is here to help debug that, as it's not reproducible
      if (title === "local account address") {
        const metamaskUnlocked = yield select(metaMaskUnlocked);

        if (!metamaskUnlocked) {
          console.log("Metamask is locked", current, updated);
        }
      }

      if (!arEqual(current, updated)) {
        yield put(successActionCreator(updated));
      }
    } catch (error) {
      console.error("Error updating " + title, error);
    }

    // eslint-disable-next-line redux-saga/no-unhandled-errors
    yield delay(interval);
  }
}

const updateLocalAccountAddressSaga = ethHelper =>
  updateValue(
    localAccountAddress,
    () => ethHelper.getAccounts().then(accs => accs[0]),
    localAccountAddressChanged,
    "local account address"
  );

function* localAccountActionsAndUpdatesSaga(ethHelper, { address }) {
  try {
    yield takeEvery(MAKE_ORDER_REQUEST, makeOrderSaga, ethHelper, address);
    yield takeEvery(TAKE_ORDER_REQUEST, takeOrderSaga, ethHelper, address);

    yield call(
      updateValue,
      state => state.localAccount.ethBalance,
      () => ethHelper.getEthBalance(address),
      localAccountEthBalanceUpdated,
      "ETH balance of " + address,
      UPDATES_INTERVAL
    );
  } catch (error) {
    console.error(
      "Error updating local account " + address + " balances and allowances",
      error
    );
  }
}

function* tokenUpdatesSaga(ethHelper) {
  try {
    const address = yield select(state => state.localAccount.address);

    yield takeEvery(
      TOKEN_SET_ALLOWANCE_REQUEST,
      createTokenSetWithTxSaga(
        tokenAddress =>
          ethHelper.set0xProxyUnllimitedAllowance(tokenAddress, address),
        tokenSetAllowanceStarted,
        tokenSetAllowanceSuccess,
        tokenSetAllowanceFailed,
        tokenSetAllowanceCancelled,
        "token allowance"
      ),
      ethHelper
    );

    yield takeEvery(
      TOKEN_FAUCET_REQUESTED,
      createTokenSetWithTxSaga(
        tokenAddress => ethHelper.callTokenFaucet(tokenAddress, address),
        tokenFaucetStarted,
        tokenFaucetSuccess,
        tokenFaucetFailed,
        tokenFaucetCancelled,
        "token faucet call"
      ),
      ethHelper
    );

    const tokenAddresses = yield select(state => Object.keys(state.tokens));

    const tasks = [];

    for (const tokenAddress of tokenAddresses) {
      tasks.push(
        updateValue(
          state => state.tokens[tokenAddress].balance,
          () => ethHelper.getTokenBalance(tokenAddress, address),
          newValue => tokenBalanceUpdated(tokenAddress, newValue),
          "Token balance update of " + tokenAddress,
          UPDATES_INTERVAL
        )
      );

      tasks.push(
        updateValue(
          state => state.tokens[tokenAddress].allowance,
          () => ethHelper.getToken0xProxyAllowance(tokenAddress, address),
          newValue => tokenAllowanceUpdated(tokenAddress, newValue),
          "Token allowance update of " + tokenAddress,
          UPDATES_INTERVAL
        )
      );
    }

    yield all(tasks);
  } catch (error) {
    console.error("Error updating tokens' values", error);
  }
}

function createTokenSetWithTxSaga(
  setter,
  startedActionCreator,
  successActionCreator,
  errorActionCreator,
  cancelledActionCreator,
  title
) {
  return function*(ethHelper, action) {
    try {
      yield put(startedActionCreator(action.address));

      const tx = yield call(setter, action.address);
      yield call(() => ethHelper.waitForTxMinned(tx));

      yield put(successActionCreator(action.address));
    } catch (e) {
      if (e.code === SIGNATURE_CANCELLED_BY_USER) {
        console.log(title + " cancelled");
        yield put(cancelledActionCreator(action.address));
        return;
      }

      console.error("Error setting " + title, e);
      yield put(errorActionCreator(action.address, e));
    }
  };
}

function* startUpdatingNewAccountsSaga(ethHelper) {
  yield takeLatest(
    [LOCAL_ACCOUNT_ADDRESS_CHANGED, TOKEN_ADDED],
    tokenUpdatesSaga,
    ethHelper
  );

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
      updateLocalAccountAddressSaga(ethHelper)
    ]);
  } catch (error) {
    console.error("Error in local account saga", error);
  }
}
