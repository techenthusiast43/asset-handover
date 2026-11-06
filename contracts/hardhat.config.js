require("@nomicfoundation/hardhat-toolbox");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

// Load local contracts/.env first
dotenv.config();

// Also check root .env and override if root has non-empty values
const rootEnvPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(rootEnvPath)) {
  const rootConfig = dotenv.parse(fs.readFileSync(rootEnvPath));
  for (const k in rootConfig) {
    if (rootConfig[k] && rootConfig[k].trim() !== "") {
      process.env[k] = rootConfig[k].trim();
    }
  }
}

const BOT_TESTNET_RPC = process.env.BOT_TESTNET_RPC || "https://rpc.bohr.life";
let rawPrivateKey = (process.env.PRIVATE_KEY || "").trim();

// Strip quotes if user pasted with quotes
if ((rawPrivateKey.startsWith('"') && rawPrivateKey.endsWith('"')) || (rawPrivateKey.startsWith("'") && rawPrivateKey.endsWith("'"))) {
  rawPrivateKey = rawPrivateKey.slice(1, -1).trim();
}

const PRIVATE_KEY =
  rawPrivateKey && rawPrivateKey.length >= 64
    ? (rawPrivateKey.startsWith("0x") ? rawPrivateKey : `0x${rawPrivateKey}`)
    : "0x0000000000000000000000000000000000000000000000000000000000000001";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    botTestnet: {
      url: BOT_TESTNET_RPC,
      chainId: 968,
      accounts: [PRIVATE_KEY],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
