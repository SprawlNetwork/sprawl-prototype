import * as ethers from "ethers";
import _ from "lodash";
import { ContractWrappers } from "@0xproject/contract-wrappers";
import ERC20Artifact from "@0xproject/contract-wrappers/lib/src/artifacts/ERC20Token";
import {
  orderHashUtils,
  signatureUtils,
  assetDataUtils,
  SignerType
} from "@0xproject/order-utils";
import { BigNumber } from "@0xproject/utils";
import * as datefns from "date-fns";

export const LOCAL_NETWORK_ID = 50;
const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
const TAKE_ORDER_GAS_LIMIT = 400000;

export class EthHelper {
  constructor(ethersProvider, ethersWallet) {
    this._ethersProvider = ethersProvider;

    if (ethersWallet !== undefined) {
      this._ethersWallet = ethersWallet.connect(this._ethersProvider);
    }
  }

  async getEthBalance(address) {
    return this._ethersProvider.getBalance(address);
  }

  async getWethBalance(address) {
    return this._getTokenBalance(await this.getWethAddress(), address);
  }

  async getZrxBalance(address) {
    return this._getTokenBalance(await this.getZrxAddress(), address);
  }

  async getTokenSymbol(tokenAddress) {
    const token = new ethers.Contract(
      tokenAddress,
      [
        {
          constant: true,
          inputs: [],
          name: "symbol",
          outputs: [
            {
              name: "",
              type: "string"
            }
          ],
          payable: false,
          stateMutability: "view",
          type: "function"
        }
      ],
      this._ethersProvider
    );

    return token.symbol();
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
    return (await this.getNetworkId()) === LOCAL_NETWORK_ID;
  }

  async createAndSignOrder(
    makerAddress,
    senderAddress,
    wethAmount,
    zrxAmount,
    isZrxPurchaseOrder
  ) {
    if (isZrxPurchaseOrder) {
      const wethBalance = await this.getWethBalance(makerAddress);
      const wethAllowance = await this.get0xERC20ProxyWethAllowance(
        makerAddress
      );

      if (wethBalance.lt(wethAmount)) {
        throw new Error("Not enough funds");
      }

      if (wethAllowance.lt(wethAmount)) {
        throw new Error("Not enough allowance");
      }
    } else {
      const zrxBalance = await this.getZrxBalance(makerAddress);
      const zrxAllowance = await this.get0xERC20ProxyZrxAllowance(makerAddress);

      if (zrxBalance.lt(zrxAmount)) {
        throw new Error("Not enough funds");
      }

      if (zrxAllowance.lt(zrxAmount)) {
        throw new Error("Not enough allowance");
      }
    }

    const tomorrow = datefns.addDays(new Date(), 1);
    const expirationDate = new BigNumber(Math.floor(tomorrow.getTime() / 1000));

    const wrapper = await this._getContractsWrapper();

    let makerAssetAmount = new BigNumber(zrxAmount);
    let takerAssetAmount = new BigNumber(wethAmount);
    let makerAssetData = assetDataUtils.encodeERC20AssetData(
      await this.getZrxAddress()
    );
    let takerAssetData = assetDataUtils.encodeERC20AssetData(
      await this.getWethAddress()
    );

    if (isZrxPurchaseOrder) {
      [makerAssetAmount, takerAssetAmount] = [
        takerAssetAmount,
        makerAssetAmount
      ];

      [makerAssetData, takerAssetData] = [takerAssetData, makerAssetData];
    }

    const order = {
      exchangeAddress: wrapper.exchange.getContractAddress(),
      makerAddress: makerAddress.toLowerCase(),
      takerAddress: NULL_ADDRESS,
      senderAddress: senderAddress.toLowerCase(),
      feeRecipientAddress: NULL_ADDRESS,
      expirationTimeSeconds: expirationDate,
      salt: this._generatePseudoRandomSalt(),
      makerAssetAmount,
      takerAssetAmount,
      makerAssetData,
      takerAssetData,
      makerFee: new BigNumber(0),
      takerFee: new BigNumber(0)
    };

    const orderHashHex = orderHashUtils.getOrderHashHex(order);

    const signature = await signatureUtils.ecSignOrderHashAsync(
      await this._get0xProvider(),
      orderHashHex,
      makerAddress.toLowerCase(),
      SignerType.Default
    );

    return { ...order, signature };
  }

  async signTakeOrderTransaction(takerAddress, signedOrder) {
    const wrapper = await this._getContractsWrapper();
    const transactionEncoder = await wrapper.exchange.transactionEncoderAsync();

    const data = transactionEncoder.fillOrderTx(
      signedOrder,
      signedOrder.takerAssetAmount
    );

    const salt = this._generatePseudoRandomSalt();

    const executeTransactionHex = transactionEncoder.getTransactionHex(
      data,
      salt,
      takerAddress
    );

    const signature = await signatureUtils.ecSignOrderHashAsync(
      this._get0xProvider(),
      executeTransactionHex,
      takerAddress,
      SignerType.Default
    );

    return { takerAddress, signature, salt, data };
  }

  async takeOrder(senderAddress, signedTakeOrderTransaction) {
    const wrapper = await this._getContractsWrapper();
    return wrapper.exchange.executeTransactionAsync(
      signedTakeOrderTransaction.salt,
      signedTakeOrderTransaction.takerAddress,
      signedTakeOrderTransaction.data,
      signedTakeOrderTransaction.signature,
      senderAddress.toLowerCase(),
      {
        gasLimit: TAKE_ORDER_GAS_LIMIT
      }
    );
  }

  async isOrderFilled(signedOrder) {
    const wrapper = await this._getContractsWrapper();
    const orderStatus = await wrapper.exchange.getOrderInfoAsync(signedOrder, {
      defaultBlock: "latest"
    });
    console.log(orderStatus);

    return orderStatus.orderStatus === 5;
  }

  _generatePseudoRandomSalt() {
    return new BigNumber(_.random(0, 10000000, false));
  }

  async ___testMetamaskBugWithGanache(address) {
    /*global console*/
    console.log(await this.get0xERC20ProxyWethAllowance(address));
    const tx = await this.set0xERC20ProxyWethUnllimitedAllowance(address);
    console.log(tx);
    console.log(await this._ethersProvider.waitForTransaction(tx));

    // This call returns an outdated value
    console.log(await this.get0xERC20ProxyWethAllowance(address));
  }

  _get0xProvider() {
    if (this._0xProvider === undefined) {
      this._0xProvider = this._ethersProviderTo0xProvider(
        this._ethersProvider,
        this._ethersWallet
      );
    }

    return this._0xProvider;
  }

  async getNetworkId() {
    if (this._networkId === undefined) {
      const network = await this._ethersProvider.getNetwork();
      this._networkId = +network.chainId;
    }

    return this._networkId;
  }

  /**
   * @returns {Promise<ContractWrappers>}
   */
  async _getContractsWrapper() {
    if (this._contractsWrapper === undefined) {
      this._contractsWrapper = new ContractWrappers(this._get0xProvider(), {
        networkId: await this.getNetworkId()
      });
    }

    return this._contractsWrapper;
  }

  _ethersProviderTo0xProvider(ethersProvider, wallet) {
    return {
      sendAsync: async (payload, callback) => {
        if (wallet !== undefined) {
          let result;
          let error;

          let ethersParams;
          try {
            switch (payload.method) {
              case "eth_accounts":
                result = [wallet.address.toLowerCase()];
                break;

              case "eth_sendTransaction":
                if (
                  payload.params[0].from.toLowerCase() ===
                  wallet.address.toLowerCase()
                ) {
                  ethersParams = {
                    ...payload.params[0],
                    gasLimit: payload.params[0].gas
                  };
                  delete ethersParams.gas;
                  delete ethersParams.from;

                  result = (await wallet.sendTransaction(ethersParams)).hash;
                  break;
                }
            }
          } catch (e) {
            error = e;
          }

          if (error) {
            callback(error);

            return;
          }

          if (result) {
            callback(null, {
              result,
              id: payload.id,
              jsonrpc: payload.jsonrpc
            });
            return;
          }
        }

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

  async _getTokenBalance(tokenAddress, address) {
    const token = new ethers.Contract(
      tokenAddress,
      ERC20Artifact.compilerOutput.abi,
      this._ethersProvider
    );

    return token.functions.balanceOf(address).then(v => new BigNumber(v));
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
