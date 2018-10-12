import * as network from "./network";
import chalk from "chalk";
import { getNetworkId } from "./eth";
import { loadOrCreateWallet } from "./wallet";
import { encode } from "../common/messages";
import Dex from "./Dex";
import { PeerManager } from "./peers";
import { RPCServer } from "./rpc";

const DEFUALT_NODE_PORT = 1337;

export default class Node {
  constructor() {
    this._peerManager = new PeerManager();
    this._rpcServer = new RPCServer();
  }

  async _getRPCPort() {
    if (this._port === undefined) {
      this._port = await network.getAvailablePort(DEFUALT_NODE_PORT);
    }

    return this._port;
  }

  async _initPeerDiscovery() {
    const port = await this._getRPCPort();
    await this._peerManager.start(port);
  }

  async _stopPeerDiscovery() {
    await this._peerManager.stop();
  }

  async _startRPC(dex) {
    const port = await this._getRPCPort();
    await this._rpcServer.start(port, dex);
  }

  async _stopRPC() {
    await this._rpcServer.stop();
  }

  async start() {
    try {
      const wallet = await loadOrCreateWallet();
      await this.handleFixture(wallet);

      const dex = new Dex(
        wallet,
        await getNetworkId(),
        this._peerManager,
        msg => this._rpcServer.bloadcastToClients(encode(msg))
      );

      await this._startRPC(dex);
      await this._initPeerDiscovery();

      console.log(
        chalk.green.bold(
          `Open http://localhost:8080/?127.0.0.1:${await this._getRPCPort()} to connect to this node`
        )
      );
    } catch (error) {
      console.error("Error starting node", error);
      await this.stop();
    }
  }

  async handleFixture(wallet) {
    if ((await getNetworkId()) !== 50) {
      return;
    }

    const {
      sendEtherFromPredefinedAccounts,
      shouldSetupFixtureData,
      doesNodeHaveEnoughEther,
      getZrxSellOrders
    } = require("./fixture");

    if (shouldSetupFixtureData()) {
      if (!(await doesNodeHaveEnoughEther(wallet.address))) {
        await sendEtherFromPredefinedAccounts(wallet.address, 1e18);
      }
    }

    await getZrxSellOrders(wallet);
  }

  async stop() {
    await this._stopPeerDiscovery();
    await this._stopRPC();
  }
}
