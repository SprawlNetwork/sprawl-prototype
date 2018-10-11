import * as ethers from "ethers";
import { ContractWrappers } from "@0xproject/contract-wrappers";
import ERC20Artifact from "@0xproject/contract-wrappers/lib/src/artifacts/ERC20Token";
import { BigNumber } from "bignumber.js";

export const LOCAL_NETWORK_ID = 50;

export class EthHelper {
  constructor(ethersProvider) {
    this._ethersProvider = ethersProvider;
  }

  async getEthBalance(address) {
    return this._ethersProvider.getBalance(address);
  }

  async getWethPendingBalance(address) {
    return this._getPendingTokenBalance(await this.getWethAddress(), address);
  }

  async getZrxPendingBalance(address) {
    return this._getPendingTokenBalance(await this.getZrxAddress(), address);
  }

  async get0xERC20ProxyWethAllowance(address) {
    return this._getTokenAllowance(
      await this.getWethAddress(),
      address,
      await this.get0xERC20ProxyAddress()
    );
  }

  async get0xERC20ProxyZrxAllowance(address) {
    return this._getTokenAllowance(
      await this.getZrxAddress(),
      address,
      await this.get0xERC20ProxyAddress()
    );
  }

  async set0xERC20ProxyWethUnllimitedAllowance(address) {
    const wrapper = await this._getContractsWrapper();
    return wrapper.erc20Token.setUnlimitedAllowanceAsync(
      await this.getWethAddress(),
      address,
      await this.get0xERC20ProxyAddress()
    );
  }

  async set0xERC20ProxyZrxUnllimitedAllowance(address) {
    const wrapper = await this._getContractsWrapper();
    return wrapper.erc20Token.setUnlimitedAllowanceAsync(
      await this.getZrxAddress(),
      address,
      await this.get0xERC20ProxyAddress()
    );
  }

  async getWethAddress() {
    if (this._wethAddress === undefined) {
      const wrapper = await this._getContractsWrapper();
      this._wethAddress = wrapper.etherToken.getContractAddressIfExists();
    }

    return this._wethAddress;
  }

  async getZrxAddress() {
    if (this._zrxAddress === undefined) {
      const wrapper = await this._getContractsWrapper();
      this._zrxAddress = wrapper.exchange.getZRXTokenAddress();
    }

    return this._zrxAddress;
  }

  async get0xERC20ProxyAddress() {
    if (this._0xERC20ProxyAddress === undefined) {
      const wrapper = await this._getContractsWrapper();
      this._0xERC20ProxyAddress = wrapper.erc20Proxy.getContractAddress();
    }

    return this._0xERC20ProxyAddress;
  }

  async waitForTxMinned(txId) {
    await this.waitIfLocalNetwork();
    const result = await this._ethersProvider.waitForTransaction(txId);
    return result;
  }

  async waitIfLocalNetwork(millis = 7000) {
    /*global setTimeout*/
    if (this.isLocalNetwork()) {
      await new Promise(resolve => setTimeout(resolve, millis));
    }
  }

  async isLocalNetwork() {
    return (await this._getNetworkId()) === LOCAL_NETWORK_ID;
  }

  _get0xProvider() {
    if (this._0xProvider === undefined) {
      this._0xProvider = this._ethersProviderTo0xProvider(this._ethersProvider);
    }

    return this._0xProvider;
  }

  async _getNetworkId() {
    if (this._networkId === undefined) {
      const network = await this._ethersProvider.getNetwork();
      this._networkId = +network.chainId;
    }

    return this._networkId;
  }

  async _getContractsWrapper() {
    if (this._contractsWrapper === undefined) {
      this._contractsWrapper = new ContractWrappers(this._get0xProvider(), {
        networkId: await this._getNetworkId()
      });
    }

    return this._contractsWrapper;
  }

  _ethersProviderTo0xProvider(ethersProvider) {
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

  async _getPendingTokenBalance(tokenAddress, address) {
    const token = new ethers.Contract(
      tokenAddress,
      ERC20Artifact.compilerOutput.abi,
      this._ethersProvider
    );

    const data = token.interface.functions.balanceOf.encode([address]);

    return this._ethersProvider
      .send("eth_call", [{ to: tokenAddress, data }, "pending"])
      .then(r => new BigNumber(r));
  }

  async _getTokenAllowance(tokenAddress, tokensOwner, approvedAddress) {
    const token = new ethers.Contract(
      tokenAddress,
      ERC20Artifact.compilerOutput.abi,
      this._ethersProvider
    );

    return token.functions
      .allowance(tokensOwner, approvedAddress)
      .then(v => new BigNumber(v));
  }
}
