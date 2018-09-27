import jaysonBrowserClient from "jayson/lib/client/browser";
import { serialize, unserialize } from "../common/serialization";

export class RPCClient {
  constructor(address) {
    if (!address.startsWith("http://")) {
      address = "http://" + address;
    }

    this._client = jaysonBrowserClient(
      (request, callback) => {
        const options = {
          method: "POST",
          body: request,
          headers: {
            "Content-Type": "application/json"
          }
        };

        fetch(address, options)
          .then(function(res) {
            return res.text();
          })
          .then(function(text) {
            callback(null, text);
          })
          .catch(function(err) {
            callback(err);
          });
      },
      {
        reviver: unserialize,
        replacer: serialize
      }
    );
  }

  async call(funcName, ...params) {
    return await new Promise((resolve, reject) => {
      this._client.request(funcName, params, (err, error, result) => {
        if (err) {
          reject(err);
          return;
        }

        if (error) {
          reject(new Error(`RPCError[${error.code}]: ${error.message}`));
          return;
        }

        resolve(result);
      });
    });
  }
}

export async function call(nodeAddress, funcName, ...params) {
  const client = new RPCClient(nodeAddress);

  return client.call(funcName, ...params);
}
