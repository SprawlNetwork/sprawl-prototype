import { EthHelper } from "../common/eth";
import * as ethers from "ethers";

/**
 * @type EthHelper
 */
export let ethHelper;

// This is so wrong
window.addEventListener("load", () => {
  ethHelper = new EthHelper(
    new ethers.providers.Web3Provider(window.web3.currentProvider)
  );
});
