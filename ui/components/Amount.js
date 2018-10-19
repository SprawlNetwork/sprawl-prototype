import { ethers } from "ethers";

export function Amount({ units, symbol }) {
  return (
    ethers.utils.formatEther(units.toString()) + (symbol ? " " + symbol : "")
  );
}
