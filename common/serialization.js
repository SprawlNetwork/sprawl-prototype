import _ from "lodash";
import { BigNumber } from "@0xproject/utils";

function isBignumberish(v) {
  if (!_.isObject(v)) {
    return false;
  }

  const keys = Object.keys(v);
  const isWeb3BigNumber =
    keys.includes("s") && keys.includes("e") && keys.includes("c");

  const isEthersBigNumber = v._ethersType === "BigNumber";

  return isWeb3BigNumber || isEthersBigNumber;
}

export function serialize(key, value) {
  if (this[key] instanceof Date) {
    return { $class: "Date", $value: +this[key] };
  }

  if (isBignumberish(this[key])) {
    return { $class: "BigNumber", $value: this[key].toString(10) };
  }

  return value;
}

export function unserialize(key, value) {
  if (value && value.$class === "Date") {
    return new Date(value.$value);
  }

  if (value && value.$class === "BigNumber") {
    return new BigNumber(value.$value);
  }

  return value;
}
