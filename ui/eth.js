import { EthHelper } from "../common/eth";
import * as ethers from "ethers";

/**
 * @type EthHelper
 */
export let ethHelper = undefined;

export function initEthHelper() {
  const injectedProvider = window.ethereum
    ? window.ethereum
    : window.web3.currentProvider;

  ethHelper = new EthHelper(
    new ethers.providers.Web3Provider(injectedProvider)
  );

  return ethHelper;
}
