import fse from "fs-extra";
import chalk from "chalk";
import * as ethers from "ethers";

const WALLET_FILE = ".unsafe-wallet-store";

export async function loadOrCreateWallet() {
  if (await isWalletSaved()) {
    return loadWallet();
  }

  const wallet = createWallet();
  await saveWallet(wallet);

  return wallet;
}

function createWallet() {
  const wallet = ethers.Wallet.createRandom();

  console.log(chalk.cyan("Created wallet with address " + wallet.address));

  return wallet;
}

async function loadWallet() {
  const wallet = new ethers.Wallet(await readPrivateKey());

  console.log(
    chalk.cyan("Loaded existing wallet with address " + wallet.address)
  );

  return wallet;
}

async function isWalletSaved() {
  return fse.pathExists(WALLET_FILE);
}

async function saveWallet(wallet) {
  return fse.outputFile(WALLET_FILE, wallet.privateKey);
}

async function readPrivateKey() {
  return fse.readFile(WALLET_FILE, "utf-8");
}
