import net from "net";
import os from "os";
import _ from "lodash";

function isPortAvailable(port) {
  return new Promise((resolve, reject) => {
    const server = net
      .createServer()
      .once(
        "error",
        err => (err.code === "EADDRINUSE" ? resolve(false) : reject(err))
      )
      .once("listening", () =>
        server.once("close", () => resolve(true)).close()
      )
      .listen(port);
  });
}

/**
 * Finds an available port.
 *
 * @note There's an obvious race condition here. The port given by this function
 * can become unavailable before you use it.
 */
export async function getAvailablePort(firstPortToTry, maxPortsToTry = 100) {
  for (let i = 0; i < maxPortsToTry; i++) {
    const port = firstPortToTry + i;
    if (await isPortAvailable(port)) {
      return port;
    }
  }

  throw new Error("No available port found");
}

export function isLocalIp(ip) {
  const interfaces = _.flatten(Object.values(os.networkInterfaces()));

  return interfaces
    .filter(i => !i.internal)
    .filter(i => i.family === "IPv4")
    .find(i => i.address === ip);
}

export function getFirstLocalIp() {
  const interfaces = _.flatten(Object.values(os.networkInterfaces()));

  return interfaces
    .filter(i => !i.internal)
    .filter(i => i.family === "IPv4")
    .map(i => i.address)
    .sort()[0];
}
