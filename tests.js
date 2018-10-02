const datefns = require("date-fns");
const util = require("util");
const assert = require("assert");
const _ = require("lodash");
const ethUtil = require("ethereumjs-util");
const {
  ContractWrappers,
  RPCSubprovider,
  Web3ProviderEngine,
  orderHashUtils,
  signatureUtils,
  assetDataUtils,
  SignerType,
  BigNumber
} = require("0x.js");
const { MnemonicWalletSubprovider } = require("@0xproject/subproviders");
const { Web3Wrapper } = require("@0xproject/web3-wrapper");

const ethers = require("ethers");

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

const config = require("./config");

const nodeWallet = new ethers.Wallet(
  "0xf2f48ee19680706196e2e339e5da3491186e0c4c5030670656b0e0164837257d"
);

function getStartedProiderEngine() {
  const mnemonicWallet = new MnemonicWalletSubprovider({
    mnemonic: config.MNEMONIC,
    baseDerivationPath: config.BASE_DERIVATION_PATH,
    addressSearchLimit: 11
  });

  const pe = new Web3ProviderEngine();

  pe.addProvider(mnemonicWallet);
  pe.addProvider(new RPCSubprovider(config.NETWORK_CONFIG.url, 1000));
  pe.start();

  return pe;
}

async function withProviderEngine(callback) {
  const pe = getStartedProiderEngine();

  try {
    return await callback(pe);
  } finally {
    pe.stop();
  }
}

async function printAddressesBalance(
  addresses,
  web3,
  contractWrappers,
  etherTokenAddress,
  zrxTokenAddress
) {
  for (const addr of addresses) {
    const weiBalance = await web3.getBalanceInWeiAsync(addr);

    const wethBalance = await contractWrappers.erc20Token.getBalanceAsync(
      etherTokenAddress,
      addr
    );

    const zrxBalance = await contractWrappers.erc20Token.getBalanceAsync(
      zrxTokenAddress,
      addr
    );

    const ethBalance = Web3Wrapper.toUnitAmount(weiBalance, 18);
    const wethBalanceUnits = Web3Wrapper.toUnitAmount(wethBalance, 18);
    const zrxBaseUnits = Web3Wrapper.toUnitAmount(zrxBalance, 18);

    console.log(`Address: ${addr}
ETH: ${ethBalance}
WETH: ${wethBalanceUnits.toString(10)}
ZRX: ${zrxBaseUnits.toString(10)}`);
  }
}

async function loadAddressWithEth(web3, destinationAddress, value = 1e18) {
  const addresses = await web3.getAvailableAddressesAsync();

  const lastAddress = addresses[addresses.length - 1];

  return web3.sendTransactionAsync({
    from: lastAddress,
    to: destinationAddress.toLowerCase(),
    value: new BigNumber(value)
  });
}

async function loadAddressWithWeth(
  web3,
  contractWrappers,
  destinationAddress,
  value = 1e18
) {
  const etherTokenAddress = contractWrappers.etherToken.getContractAddressIfExists();

  const addresses = await web3.getAvailableAddressesAsync();
  const lastAddress = addresses[addresses.length - 1];

  await contractWrappers.etherToken.depositAsync(
    etherTokenAddress,
    new BigNumber(value),
    lastAddress
  );

  return await contractWrappers.erc20Token.transferAsync(
    etherTokenAddress,
    lastAddress,
    destinationAddress.toLowerCase(),
    new BigNumber(value)
  );
}

async function getNetworkId(pe) {
  const { result } = await util.promisify(pe.sendAsync.bind(pe))({
    jsonrpc: "2.0",
    method: "net_version",
    params: [],
    id: 67
  });

  return +result;
}

async function createZRXSellOrder(
  providerEngine,
  contractWrappers,
  zrxTokenAddress,
  etherTokenAddress,
  maker,
  zrxAmount = 1e18,
  wethAmount = 1e18
) {
  const makerAssetData = assetDataUtils.encodeERC20AssetData(zrxTokenAddress);
  const takerAssetData = assetDataUtils.encodeERC20AssetData(etherTokenAddress);

  const expirationDate = new BigNumber(1538177290 + 3600 * 48);
  const exchangeAddress = contractWrappers.exchange.getContractAddress();

  // Create the order
  const order = {
    exchangeAddress,
    makerAddress: maker,
    takerAddress: NULL_ADDRESS,
    senderAddress: NULL_ADDRESS,
    feeRecipientAddress: NULL_ADDRESS,
    expirationTimeSeconds: expirationDate,
    salt: generatePseudoRandomSalt(),
    makerAssetAmount: new BigNumber(zrxAmount),
    takerAssetAmount: new BigNumber(wethAmount),
    makerAssetData,
    takerAssetData,
    makerFee: new BigNumber(0),
    takerFee: new BigNumber(0)
  };

  const orderHashHex = orderHashUtils.getOrderHashHex(order);
  const signature = await signatureUtils.ecSignOrderHashAsync(
    providerEngine,
    orderHashHex,
    maker,
    SignerType.Default
  );

  return { ...order, signature };
}

function generatePseudoRandomSalt() {
  return new BigNumber(0);
  // return new BigNumber(_.random(0, 100000, false));
}

async function main() {
  return withProviderEngine(async pe => {
    const web3 = new Web3Wrapper(pe);

    const networkId = await getNetworkId(pe);

    if (networkId !== config.NETWORK_CONFIG.networkId) {
      console.error(
        `Expected network ${
          config.NETWORK_CONFIG.networkId
        } but connected to ${networkId}`
      );
      process.exit(1);
    }

    const contractWrappers = new ContractWrappers(pe, {
      networkId: config.NETWORK_CONFIG.networkId
    });

    const addresses = await web3.getAvailableAddressesAsync();
    const zrxTokenAddress = contractWrappers.exchange.getZRXTokenAddress();
    const etherTokenAddress = contractWrappers.etherToken.getContractAddressIfExists();

    await contractWrappers.erc20Token.setUnlimitedProxyAllowanceAsync(
      zrxTokenAddress,
      addresses[0]
    );

    if (!etherTokenAddress) {
      throw new Error("Ether Token not found on this network");
    }

    const wethBalance = await contractWrappers.erc20Token.getBalanceAsync(
      etherTokenAddress,
      nodeWallet.address.toLowerCase()
    );

    if (wethBalance.eq(0)) {
      await loadAddressWithWeth(
        web3,
        contractWrappers,
        nodeWallet.address.toLowerCase(),
        10e18
      );
    }

    const signedOrder = await createZRXSellOrder(
      pe,
      contractWrappers,
      zrxTokenAddress,
      etherTokenAddress,
      addresses[0]
    );

    // await printAddressesBalance(
    //   [...addresses],
    //   web3,
    //   contractWrappers,
    //   etherTokenAddress,
    //   zrxTokenAddress
    // );

    // const txHash = await contractWrappers.exchange.fillOrderAsync(
    //   signedOrder,
    //   new BigNumber(1e18),
    //   nodeWallet.address.toLowerCase(),
    //   {
    //     gasLimit: config.TX_DEFAULTS.gas
    //   }
    // );

    const transactionEncoder = await contractWrappers.exchange.transactionEncoderAsync();

    const fillData = transactionEncoder.fillOrderTx(
      signedOrder,
      new BigNumber(1e18)
    );

    const takerTransactionSalt = generatePseudoRandomSalt();

    const executeTransactionHex = transactionEncoder.getTransactionHex(
      fillData,
      takerTransactionSalt,
      nodeWallet.address.toLowerCase()
    );

    debugger;

    const takerSignatureHex = await signatureUtils.ecSignOrderHashAsync(
      pe,
      executeTransactionHex,
      nodeWallet.address.toLowerCase(),
      SignerType.Default
    );

    console.log(
      "El tx hash\t",
      "0xefd99055da5af58a48df1bd9b303baafe5ba70943b35645d5fd33b2280572da1"
    );

    console.log(
      "Lo firmado\t",
      "0xc69cbbf52d799d0dde8e4ad695155c8119551903a4c9a71d8137a9f89311c0bb"
    );

    console.log(
      "Por ethUtil\t",
      "0x" +
        ethUtil
          .hashPersonalMessage(ethUtil.toBuffer(executeTransactionHex))
          .toString("hex")
    );

    console.log(
      "Por ethers\t",
      ethers.utils.hashMessage(
        new Buffer(executeTransactionHex.substr(2), "hex")
      )
    );

    const localSignature = await nodeWallet.signMessage(
      new Buffer(executeTransactionHex.substr(2), "hex")
    );

    console.log("");
    console.log(
      "Local signature:\n",
      ethers.utils.splitSignature(localSignature)
    );
    console.log(
      "Remote signature:\n",
      signatureUtils.parseECSignature(takerSignatureHex)
    );

    const reformattedLocalSignatureHex = signatureUtils.convertECSignatureToSignatureHex(
      ethers.utils.splitSignature(localSignature),
      SignerType.Default
    );

    console.log(reformattedLocalSignatureHex === takerSignatureHex);

    // The sender submits this operation via executeTransaction passing in the signature from the taker
    const txHash = await contractWrappers.exchange.executeTransactionAsync(
      takerTransactionSalt,
      nodeWallet.address.toLowerCase(),
      fillData,
      reformattedLocalSignatureHex,
      addresses[1],
      {
        gasLimit: config.TX_DEFAULTS.gas
      }
    );

    console.log(txHash);
  });
}

main().catch(console.error);
