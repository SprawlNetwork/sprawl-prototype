import { BigNumber } from "@0xproject/utils";
import { LOCAL_NETWORK_ID } from "../common/eth";

export const nodeAddress = state => state.nodeConnection.address;

export const localAccountAddress = state => state.localAccount.address;

export const remoteAccountAddress = state => state.remoteAccount.address;

export const remoteAccountBalance = state => state.remoteAccount.ethBalance;

export const isLocalNetwork = state =>
  state.networks.remote.networkId === LOCAL_NETWORK_ID;

export const metaMaskUnlocked = state =>
  state.localAccount.address !== undefined;

export const localNetworkId = state => state.networks.local.networkId;

export const remoteNetworkId = state => state.networks.remote.networkId;

export const metaMaskInWrongNetwork = state =>
  state.networks.remote.networkId &&
  state.networks.local.networkId &&
  state.networks.local.networkId !== state.networks.remote.networkId;

export const connectedToNode = state => state.nodeConnection.connected;

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

export const isMetaMaskLoading = state => state.metamask.loading;
