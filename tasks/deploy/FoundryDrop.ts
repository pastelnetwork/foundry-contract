import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";

import { FoundryDrop } from "../../src/types/FoundryDrop";
import { FoundryDrop__factory } from "../../src/types/factories/FoundryDrop__factory";

import { getContract } from "../helpers";
import { Contract } from "ethers";
import fs from "fs";

task("deploy:FoundryDrop")
  .addParam("name", "Name of the contract")
  .addParam("symbol", "Symbol of the contract")
  .addParam("maxSupply", "Max supply of the contract")
  .addParam("royalty", "Royalty percentage")
  .addParam("baseUri", "Base URI of the contract")
  .addParam("primaryWallet", "Primary wallet address")
  .setAction(async function (taskArguments: TaskArguments, { ethers, upgrades }) {
    const dropFactory: FoundryDrop__factory = <FoundryDrop__factory>await ethers.getContractFactory("FoundryDrop");

    const FoundryDrop: FoundryDrop = <FoundryDrop>(
      await upgrades.deployProxy(dropFactory, [
        taskArguments.name,
        taskArguments.symbol,
        parseInt(taskArguments.maxSupply, 10),
        parseInt(taskArguments.royalty, 10),
        taskArguments.baseUri,
        taskArguments.primaryWallet,
      ])
    );

    await FoundryDrop.deployed();
    console.log("FoundryDrop deployed to: ", FoundryDrop.address);
  });

task("test:setGuaranteedSmartmint")
  .addParam("address", "Address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const contract: Contract = await getContract("FoundryDrop", taskArguments.address, hre);

    const FCSM = await fs.readFileSync(__dirname + "/FCSM.txt", "utf-8");

    const array = FCSM.split("\r");

    const response = await contract.setGuaranteedSmartmintUsers(array.map(iter => Number(iter)));

    const answer = await response.wait();

    console.log(answer);
  });

task("test:setWhiteListSmartmint")
  .addParam("address", "Address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const contract: Contract = await getContract("FoundryDrop", taskArguments.address, hre);

    const FCFSSM = await fs.readFileSync(__dirname + "/FCFSSM.txt", "utf-8");

    const array = FCFSSM.split("\r");

    const response = await contract.setWhiteListSmartmintUsers(array.map(iter => Number(iter)));

    const answer = await response.wait();

    console.log(answer);
  });

task("test:setGuaranteedAddresses")
  .addParam("address", "Address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const contract: Contract = await getContract("FoundryDrop", taskArguments.address, hre);

    const response = await contract.setGuaranteedAddresses([
      "0x185b3F6618A50122C70FD100C7Aac729621B8a25",
      "0xFD2b3c9DF1c8e3493540dfd05EA951d584aB34c4",
      "0xfc6054808531e90B5D7EE7b288BCbe1236737986",
      "0xCE9d85110a662b2bd7bE0A08165Dd60C8A7B93a7",
      "0xd8EEBcC727dEc057c0bF7831086A1615859c1B98",
      "0x30D2CA7476cBbA5D4b6e7f8EB64A5047BE443706",
      "0xde888435d018aAfDb1b47027DC0f766821CC8122",
      "0x4E6e15D3F408985e3F90798CE30a756FeFa82963",
    ]);

    const answer = await response.wait();

    console.log(answer);
  });

task("test:setWhiteListAddresses")
  .addParam("address", "Address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const contract: Contract = await getContract("FoundryDrop", taskArguments.address, hre);

    const FCFSAddresses = await fs.readFileSync(__dirname + "/FCFSAddr.txt", "utf-8");

    const array = FCFSAddresses.split("\r");

    const response = await contract.setWhiteListAddresses(array);

    const answer = await response.wait();

    console.log(answer);
  });

task("test:checkFCSmartmint")
  .addParam("address", "Address")
  .addParam("user", "User id")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const contract: Contract = await getContract("FoundryDrop", taskArguments.address, hre);

    const response = await contract.isGuaranteedSmartmint(parseInt(taskArguments.user, 10));

    console.log(response);
  });

task("test:checkFCAddress")
  .addParam("address", "Address")
  .addParam("wallet", "User wallet")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const contract: Contract = await getContract("FoundryDrop", taskArguments.address, hre);

    const response = await contract.isGuaranteedAddress(taskArguments.wallet);

    console.log(response);
  });

task("test:checkMaxQuantity")
  .addParam("address", "Address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const contract: Contract = await getContract("FoundryDrop", taskArguments.address, hre);

    // const response = await contract.hasUserMintedSmartmint[20373];
    const response = await contract.hasUserMintedSmartmint(20373);
    // const response = await contract.getMaxQuantity(20373, "0x185b3F6618A50122C70FD100C7Aac729621B8a25");

    console.log(response);
  });

task("test:setStage")
  .addParam("address", "Address")
  .addParam("stage", "Stage")
  .addParam("price", "Price")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const contract: Contract = await getContract("FoundryDrop", taskArguments.address, hre);

    const response = await contract.setStage(taskArguments.stage, hre.ethers.utils.parseEther(taskArguments.price));

    const answer = await response.wait();

    console.log(answer);
  });

task("test:setPurchaseableCount")
  .addParam("address", "Address")
  .addParam("count", "Count")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const contract: Contract = await getContract("FoundryDrop", taskArguments.address, hre);

    const response = await contract.setMaxPurchaseableCount(taskArguments.count);

    const answer = await response.wait();

    console.log(answer);
  });

task("test:mint")
  .addParam("address", "Contract address")
  .addParam("user", "User id")
  .addParam("count", "Mint Quantity")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const contract: Contract = await getContract("FoundryDrop", taskArguments.address, hre);

    const response = await contract.mint(
      taskArguments.user,
      "0xFFf50b1b9154b0631591DAB746c5Fc8f41Dc44Bd",
      parseInt(taskArguments.count),
      {
        value: hre.ethers.utils.parseEther("0.002"),
      },
    );

    const answer = await response.wait();

    console.log(answer);
  });

task("test:withdraw")
  .addParam("address", "Contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const contract: Contract = await getContract("FoundryDrop", taskArguments.address, hre);

    const response = await contract.withdraw();

    const answer = await response.wait();

    console.log(answer);
  });
