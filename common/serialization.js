export function serialize(key, value) {
  if (this[key] instanceof Date) {
    return { $class: "Date", $value: +this[key] };
  }

  return value;
}

export function unserialize(key, value) {
  if (value && value.$class === "Date") {
    return new Date(value.$value);
  }

  return value;
}
