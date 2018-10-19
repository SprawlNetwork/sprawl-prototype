import { serialize, unserialize } from "../common/serialization";

import WebSocket from "ws";
import enableDestroy from "server-destroy";
import util from "util";
import jayson from "jayson";
import cors from "cors";
import connect from "connect";
import { json as jsonParser } from "body-parser";
import http from "http";
import errorhandler from "errorhandler";
import morgan from "morgan";
import chalk from "chalk";

export class RPCServer {
  async start(port, methodsObject) {
    const jaysonServer = jayson.Server(
      {},
      {
        reviver: unserialize,
        replacer: serialize
      }
    );

    for (const name of Object.getOwnPropertyNames(methodsObject.__proto__)) {
      if (!name.startsWith("_")) {
        jaysonServer.method(name, (args, callback) => {
          methodsObject[name](...args)
            .then(result => callback(null, result))
            .catch(err => {
              callback(err);
              console.error(err);
            });
        });
      }
    }

    jaysonServer.method("ping", (args, callback) => callback(null, args));

    const app = connect();
    app.use(errorhandler());
    app.use(jsonParser({ reviver: unserialize }));
    app.use(
      morgan(
        function(tokens, req, res) {
          if (req.method === "OPTIONS") {
            return;
          }

          const methodName =
            req.method === "POST" && req.body && req.body.method
              ? req.body.method
              : "";

          if (methodName === "ping") {
            return;
          }

          if (methodName === "getOrders") {
            return;
          }

          const methodExists =
            Object.getOwnPropertyNames(methodsObject.__proto__).includes(
              methodName
            ) || methodName === "ping";

          const notFound = methodName !== "" && !methodExists;

          const method = methodName + (notFound ? " [NOT FOUND]" : "");

          const userAgent = tokens["user-agent"](req);
          const formattedUserAgent =
            userAgent.length > 30 ? userAgent.substr(0, 27) + "..." : userAgent;

          const msg = [
            "[" + new Date().toLocaleString() + "]",
            tokens.method(req, res),
            tokens.url(req, res),
            method,
            "-",
            formattedUserAgent
          ].join(" ");

          if (notFound) {
            return chalk.red(msg);
          }

          if (methodName !== "") {
            return chalk.cyan(msg);
          }

          return chalk.yellow(msg);
        },
        { immediate: true }
      )
    );
    app.use(cors({ methods: ["POST"] }));
    app.use(jaysonServer.middleware());

    this._httpServer = http.createServer(app);
    this._httpServer.listen(port);
    enableDestroy(this._httpServer);

    // This should probably go somewhere else
    this._wss = new WebSocket.Server({ server: this._httpServer });

    console.log(chalk.green.bold("RPC listening on port " + port));
  }

  async stop() {
    if (this._httpServer && this._httpServer.listening) {
      this._wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.close();
        }
      });

      this._httpServer.destroy();
    }
  }

  bloadcastToClients(msg) {
    this._wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  }
}

export class RPCClient {
  constructor(localPeerName, ip, port) {
    const client = jayson.client.http({
      host: ip,
      port: port,
      headers: {
        "User-Agent": localPeerName
      },
      reviver: unserialize,
      replacer: serialize
    });
    this._request = util.promisify(client.request.bind(client));
  }

  async call(funcName, ...params) {
    const response = await this._request(funcName, params);

    if (response.error) {
      throw new Error(
        `RPCError[${response.error.code}]: ${response.error.message}`
      );
    }

    return response.result;
  }
}
