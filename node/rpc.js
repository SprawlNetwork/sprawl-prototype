"use strict";

const util = require("util");
const jayson = require("jayson");
const cors = require("cors");
const connect = require("connect");
const jsonParser = require("body-parser").json;
const http = require("http");

class RPCServer {
  async start(port, methodsObject) {
    const jaysonServer = jayson.Server();

    const app = connect();

    for (const name of Object.getOwnPropertyNames(methodsObject.__proto__)) {
      if (!name.startsWith("_")) {
        jaysonServer.method(name, (args, callback) => {
          methodsObject[name](...args)
            .then(result => callback(null, result))
            .catch(err => callback(err));
        });
      }
    }

    jaysonServer.method("ping", (args, callback) => callback(null, args));

    app.use(cors({ methods: ["POST"] }));
    app.use(jsonParser());
    app.use(jaysonServer.middleware());

    this._httpServer = http.createServer(app);
    this._httpServer.listen(port);

    console.log("RPC listening on port", port);
  }

  async stop() {
    await util.promisify(this._httpServer.close.bind(this._httpServer));
  }
}

class RPCClient {
  constructor(ip, port) {
    this._ip = ip;
    this._port = port;
    const client = jayson.client.http(`http://${this._ip}:${this._port}`);
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

module.exports = { RPCServer, RPCClient };
