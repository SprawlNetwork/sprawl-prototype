import chalk from "chalk";
import { encode } from "../common/messages";
import * as network from "./network";
import { getNetworkId } from "./eth";
import { loadOrCreateWallet } from "./wallet";
import { Dex } from "./dex";
import { PeerManager } from "./peers";
import { RPCServer } from "./rpc";

const DEFUALT_NODE_PORT = 1337;

export class Node {
  constructor() {
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
    const peerManager = await this._getPeerManager();
    await peerManager.start(port);
  }

  async _stopPeerDiscovery() {
    const peerManager = await this._getPeerManager();
    await peerManager.stop();
  }

  async _startRPC(dex) {
    const port = await this._getRPCPort();
    await this._rpcServer.start(port, dex);
  }

  async _stopRPC() {
    await this._rpcServer.stop();
  }

  async _getWallet() {
    if (this._wallet === undefined) {
      this._wallet = await loadOrCreateWallet();
    }

    return this._wallet;
  }

  async _getPeerManager() {
    if (this._peerManager === undefined) {
      const wallet = await this._getWallet();
      this._peerManager = new PeerManager(wallet);
    }

    return this._peerManager;
  }

  async start() {
    try {
      const peerManager = await this._getPeerManager();
      const wallet = await this._getWallet();

      this._dex = new Dex(wallet, await getNetworkId(), peerManager, msg =>
        this._rpcServer.bloadcastToClients(encode(msg))
      );
      this._dex._start();

      await this.handleFixture(wallet, this._dex);

      await this._startRPC(this._dex);
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

  async handleFixture(wallet, dex) {
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

    const orders = await getZrxSellOrders(wallet);

    for (const order of orders) {
      await dex.receiveOrder(order);
    }
  }

  async stop() {
    await this._stopPeerDiscovery();
    await this._stopRPC();
    if (this._dex) {
      this._dex._stop();
    }
  }
}
