import { ethers } from "ethers";

export function Amount({ units }) {
  return ethers.utils.formatEther(units.toString());
}
