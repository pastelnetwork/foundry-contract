import { getContractAt } from "@nomiclabs/hardhat-ethers/internal/helpers";
import { ethers } from "ethers";

export const getEnvVariable = (key: string, defaultValue?: string) => {
  if (process.env[key]) {
    return process.env[key] || "";
  }
  if (!defaultValue) {
    console.error(`${key} is not defined and no default value was provided`);
    return "";
  }
  return defaultValue || "";
};

export const getProvider = () => {
  if (getEnvVariable("NETWORK", "localhost") === "localhost") {
    return new ethers.providers.JsonRpcProvider();
  } else if (getEnvVariable("NETWORK", "mumbai") === "mumbai") {
    return ethers.getDefaultProvider(getEnvVariable("MUMBAI_URL", ""), {
      infura: getEnvVariable("INFURA_KEY"),
    });
  } else if (getEnvVariable("NETWORK", "goerli") === "goerli") {
    return ethers.getDefaultProvider(getEnvVariable("GOERLI_TESTNET_URL", ""), {
      infura: getEnvVariable("INFURA_KEY"),
    });
  } else if (getEnvVariable("NETWORK", "mainnet") === "mainnet") {
    return ethers.getDefaultProvider(getEnvVariable("MAINNET_URL", ""), {
      infura: getEnvVariable("INFURA_KEY"),
    });
  } else {
    return ethers.getDefaultProvider(getEnvVariable("NETWORK", "rinkeby"), {
      infura: getEnvVariable("INFURA_KEY"),
    });
  }
};

export const getAccount = () => {
  return new ethers.Wallet(getEnvVariable("PRIVATE_KEY"), getProvider());
};

export const getContract = (contractName: string, address: string, hre: any) => {
  const account = getAccount();
  return getContractAt(hre, contractName, address, account);
};
