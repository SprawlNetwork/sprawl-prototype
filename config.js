const packageJson = require("./package.json");

module.exports = {
  TX_DEFAULTS: { gas: 400000 },
  MNEMONIC: packageJson.config.mnemonic,
  BASE_DERIVATION_PATH: `44'/60'/0'/0`,
  NETWORK_CONFIG: {
    url: 'http://127.0.0.1:8545',
    networkId: 50
  }
}