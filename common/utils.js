export function fromEntries(entries) {
  return entries.reduce(
    (merged, entry) => ({ ...merged, [entry[0]]: entry[1] }),
    {}
  );
}
