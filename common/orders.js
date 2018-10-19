import { assetDataUtils, orderHashUtils } from "@0xproject/order-utils";

async function getSymbolFromAssetData(assetData, ethHelper) {
  const address = assetDataUtils.decodeERC20AssetData(assetData).tokenAddress;
  return ethHelper.getTokenSymbol(address);
}

export async function getSprawlOrderFrom0xSignedOrder(signedOrder, ethHelper) {
  const hash = orderHashUtils.getOrderHashHex(signedOrder);

  return {
    id: hash,
    creationDate: new Date(),
    receptionDate: undefined,
    makerAssetSymbol: await getSymbolFromAssetData(
      signedOrder.makerAssetData,
      ethHelper
    ),
    takerAssetSymbol: await getSymbolFromAssetData(
      signedOrder.takerAssetData,
      ethHelper
    ),
    isValid: true,
    filling: false,
    fillingTx: undefined,
    fillingError: undefined,
    filled: false,
    signedOrder: signedOrder,
    signedTakeOrderTransaction: undefined
  };
}
