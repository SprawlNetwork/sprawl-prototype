import * as ethers from "ethers";

export async function getNetworkId() {
  const provider = new ethers.providers.JsonRpcProvider(getEthereumRPCURL());
  const network = await provider.getNetwork();
  return network.chainId;
}

export function getEthereumRPCURL() {
  if (process.env.LOCAL_NODE) {
    return "http://localhost:8545";
  }

  return "https://ropsten.infura.io";
}
