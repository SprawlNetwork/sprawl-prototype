import * as ethers from "ethers";
import { ContractWrappers } from "@0xproject/contract-wrappers";
import ERC20Artifact from "@0xproject/contract-wrappers/lib/src/artifacts/ERC20Token";
import { BigNumber } from "bignumber.js";

export const LOCAL_NETWORK_ID = 50;

function getMetaMaskProvider() {
  // eslint-disable-next-line
  return new ethers.providers.Web3Provider(window.web3.currentProvider);
}

function ethersProviderTo0xProvider(ethersProvider) {
  return {
    sendAsync(payload, callback) {
      ethersProvider
        .send(payload.method, payload.params)
        .then(res =>
          callback(null, {
            result: res,
            id: payload.id,
            jsonrpc: payload.jsonrpc
          })
        )
        .catch(err => callback(err));
    }
  };
}

export async function getEthBalance(address, provider = getMetaMaskProvider()) {
  return provider.getBalance(address, "pending");
}

export async function getWethBalance(
  address,
  provider = getMetaMaskProvider()
) {
  const wethAddress = await getWethAddress(provider);
  return getPendingTokenBalance(wethAddress, address, provider);
}

export async function getWeth0xProxyAllowance(
  tokensOwner,
  provider = getMetaMaskProvider()
) {
  const wethAddress = await getWethAddress(provider);
  return getPendingTokenAllowance(
    wethAddress,
    tokensOwner,
    await get0xERC20ProxyAddress(provider),
    provider
  );
}

export async function getZrxBalance(address, provider = getMetaMaskProvider()) {
  const zrxAddress = await getZRXAddress(provider);
  return getPendingTokenBalance(zrxAddress, address, provider);
}

export async function getZrx0xProxyAllowance(
  tokensOwner,
  provider = getMetaMaskProvider()
) {
  const zrxAddress = await getZRXAddress(provider);
  return getPendingTokenAllowance(
    zrxAddress,
    tokensOwner,
    await get0xERC20ProxyAddress(provider),
    provider
  );
}

async function get0xERC20ProxyAddress(provider) {
  const network = await provider.getNetwork();

  const wrapper = new ContractWrappers(ethersProviderTo0xProvider(provider), {
    networkId: network.chainId
  });

  return wrapper.erc20Proxy.getContractAddress();
}

async function getWethAddress(provider) {
  const network = await provider.getNetwork();

  const wrapper = new ContractWrappers(ethersProviderTo0xProvider(provider), {
    networkId: network.chainId
  });

  return wrapper.etherToken.getContractAddressIfExists();
}

async function getZRXAddress(provider) {
  const network = await provider.getNetwork();

  const wrapper = new ContractWrappers(ethersProviderTo0xProvider(provider), {
    networkId: network.chainId
  });

  return wrapper.exchange.getZRXTokenAddress();
}

async function getPendingTokenBalance(tokenAddress, address, provider) {
  const token = new ethers.Contract(
    tokenAddress,
    ERC20Artifact.compilerOutput.abi,
    provider
  );

  const data = token.interface.functions.balanceOf.encode([address]);

  return provider
    .send("eth_call", [{ to: tokenAddress, data }, "pending"])
    .then(r => new BigNumber(r));
}

async function getPendingTokenAllowance(
  tokenAddress,
  tokensOwner,
  approvedAddress,
  provider
) {
  const token = new ethers.Contract(
    tokenAddress,
    ERC20Artifact.compilerOutput.abi,
    provider
  );

  const data = token.interface.functions.allowance.encode([
    tokensOwner,
    approvedAddress
  ]);

  return provider
    .send("eth_call", [{ to: tokenAddress, data }, "pending"])
    .then(r => new BigNumber(r));
}
