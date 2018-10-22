import { assetDataUtils, orderHashUtils } from "@0xproject/order-utils";

function _getSymbolFromAssetData(assetData, ethHelper) {
  const address = assetDataUtils.decodeERC20AssetData(assetData).tokenAddress;
  return ethHelper.getTokenSymbol(address);
}

export function getSprawlOrderFrom0xSignedOrder(signedOrder) {
  const hash = orderHashUtils.getOrderHashHex(signedOrder);

  return {
    id: hash,
    creationDate: new Date(),
    receptionDate: undefined,
    makerAssetAddress: assetDataUtils.decodeERC20AssetData(
      signedOrder.makerAssetData
    ).tokenAddress,
    takerAssetAddress: assetDataUtils.decodeERC20AssetData(
      signedOrder.takerAssetData
    ).tokenAddress,
    isValid: true,
    filling: false,
    fillingTx: undefined,
    fillingError: undefined,
    filled: false,
    signedOrder: signedOrder,
    signedTakeOrderTransaction: undefined
  };
}
