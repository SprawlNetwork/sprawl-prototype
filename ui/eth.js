import { promisify } from "es6-promisify";

export async function getEthBalance(address) {
  return await promisify(window.web3.eth.getBalance.bind(window.web3.eth))(
    address
  );
}
