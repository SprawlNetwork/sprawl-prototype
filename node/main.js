import Node from "./Node";

async function main() {
  const node = new Node();

  process.on("SIGINT", () => node.stop().then(() => process.exit(1)));
  await node.start();
}

main().catch(console.error);
