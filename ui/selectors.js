import { LOCAL_NETWORK_ID } from "../common/eth";
import { BigNumber } from "@0xproject/utils";

export const nodeAddress = state => state.nodeConnection.address;

export const isLocalNetwork = state =>
  state.networks.remote.networkId === LOCAL_NETWORK_ID;

export const metaMaskUnlocked = state =>
  state.localAccount.address !== undefined;

export const metaMaskInWrongNetwork = state =>
  state.networks.remote.networkId !== undefined &&
  state.networks.local.networkId !== state.networks.remote.networkId;

export const couldNotConnectToNode = state =>
  !state.nodeConnection.connected && state.nodeConnection.error;

export const lostConnectionToNode = state =>
  state.nodeConnection.connected && state.nodeConnection.error;

export const allowanceIsBigEnough = allowance =>
  allowance !== undefined &&
  allowance.gt(
    new BigNumber(
      "0x0FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
    )
  );

export const hasWethAllowanceError = state =>
  !!state.localAccount.wethAllowanceError;

export const hasZrxAllowanceError = state =>
  !!state.localAccount.zrxAllowanceError;
