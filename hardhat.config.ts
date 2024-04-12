import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@openzeppelin/hardhat-upgrades";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

import "./tasks/accounts";
import "./tasks/deploy";

import { resolve } from "path";

import { config as dotenvConfig } from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import { NetworkUserConfig } from "hardhat/types";
import { ethers } from "ethers";

dotenvConfig({ path: resolve(__dirname, "./.env") });

// Ensure that we have all the environment variables we need.
const privateKey: string | undefined = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error("Please set your Private key in a .env file");
}

const testSignerPrivateKey1: string | undefined = process.env.TEST_SIGNER_PRIVATE_KEY1;
if (!testSignerPrivateKey1) {
  throw new Error("Please set your test signer's private key in a .env file");
}

const testSignerPrivateKey2: string | undefined = process.env.TEST_SIGNER_PRIVATE_KEY2;
if (!testSignerPrivateKey2) {
  throw new Error("Please set your test signer's private key in a .env file");
}

const infuraApiKey: string | undefined = process.env.INFURA_KEY;
if (!infuraApiKey) {
  throw new Error("Please set your INFURA_EY in a .env file");
}

const chainIds = {
  arbitrumOne: 42161,
  avalanche: 43114,
  bsc: 56,
  goerli: 5,
  hardhat: 31337,
  kovan: 42,
  mainnet: 1,
  optimism: 10,
  polygon: 137,
  rinkeby: 4,
  ropsten: 3,
  mumbai: 80001,
  tbsc: 97,
};

function getChainConfig(network: keyof typeof chainIds, defaultUrl?: string): NetworkUserConfig {
  const url: string = defaultUrl || "https://" + network + ".infura.io/v3/" + infuraApiKey;
  return {
    accounts: [privateKey || "", testSignerPrivateKey1 || "", testSignerPrivateKey2 || ""],
    chainId: chainIds[network],
    url,
  };
}

const config: HardhatUserConfig = {
  defaultNetwork: process.env.NETWORK || "mumbai",
  etherscan: {
    apiKey: {
      arbitrumOne: process.env.ARBSCAN_API_KEY || "",
      avalanche: process.env.SNOWTRACE_API_KEY || "",
      bsc: process.env.BSCSCAN_API_KEY || "",
      // tbsc: process.env.BSCSCAN_API_KEY || "",
      goerli: process.env.ETHERSCAN_API_KEY || "",
      kovan: process.env.ETHERSCAN_API_KEY || "",
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      optimisticEthereum: process.env.OPTIMISM_API_KEY || "",
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
      // mumbai: process.env.POLYGONSCAN_API_KEY || "",
      rinkeby: process.env.ETHERSCAN_API_KEY || "",
      ropsten: process.env.ETHERSCAN_API_KEY || "",
    },
  },
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: [],
    src: "./contracts",
  },
  networks: {
    hardhat: {
      accounts: [
        {
          privateKey: privateKey || "",
          balance: ethers.utils.parseEther("1000").toString(),
        },
        {
          privateKey: testSignerPrivateKey1 || "",
          balance: ethers.utils.parseEther("1000").toString(),
        },
        {
          privateKey: testSignerPrivateKey2 || "",
          balance: ethers.utils.parseEther("1000").toString(),
        },
      ],
      chainId: chainIds.hardhat,
    },
    arbitrumOne: getChainConfig("arbitrumOne"),
    avalanche: getChainConfig("avalanche"),
    bsc: getChainConfig("bsc", process.env.BSC_MAINNET_URL),
    tbsc: getChainConfig("tbsc", process.env.BSC_TESTNET_URL),
    goerli: getChainConfig("goerli", process.env.GOERLI_TESTNET_URL),
    kovan: getChainConfig("kovan"),
    mainnet: getChainConfig("mainnet"),
    optimism: getChainConfig("optimism"),
    polygon: getChainConfig("polygon", process.env.POLYGON_URL),
    rinkeby: getChainConfig("rinkeby"),
    ropsten: getChainConfig("ropsten"),
    mumbai: getChainConfig("mumbai", process.env.MUMBAI_URL),
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test/v2",
  },
  solidity: {
    compilers: [
      {
        version: "0.8.4",
        settings: {
          metadata: {
            // Not including the metadata hash
            // https://github.com/paulrberg/solidity-template/issues/31
            bytecodeHash: "none",
          },
          // Disable the optimizer when debugging
          // https://hardhat.org/hardhat-network/#solidity-optimizer-support
          optimizer: {
            enabled: true,
            runs: 1,
          },
        },
      },
    ],
  },
  typechain: {
    outDir: "src/types",
    target: "ethers-v5",
  },
};

export default config;
