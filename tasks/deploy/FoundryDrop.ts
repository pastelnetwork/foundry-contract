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
  .setAction(async function (taskArguments: TaskArguments, { ethers, upgrades }) {
    const dropFactory: FoundryDrop__factory = <FoundryDrop__factory>await ethers.getContractFactory("FoundryDrop");

    const FoundryDrop: FoundryDrop = <FoundryDrop>(
      await upgrades.deployProxy(dropFactory, [
        taskArguments.name,
        taskArguments.symbol,
        parseInt(taskArguments.maxSupply, 10),
        parseInt(taskArguments.royalty, 10),
        taskArguments.baseUri,
      ])
    );

    await FoundryDrop.deployed();
    console.log("FoundryDrop deployed to: ", FoundryDrop.address);
  });

task("test:setGuaranteedMerkleRoot")
  .addParam("address", "Address")
  .addParam("root", "Merkle Tree Root")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const contract: Contract = await getContract("FoundryDrop", taskArguments.address, hre);

    const response = await contract.setGuaranteedMerkleRoot(taskArguments.root);

    const answer = await response.wait();

    console.log(answer);
  });

task("test:setWhiteListMerkleRoot")
  .addParam("address", "Address")
  .addParam("root", "Merkle Tree Root")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const contract: Contract = await getContract("FoundryDrop", taskArguments.address, hre);

    const response = await contract.setWhiteListMerkleRoot(taskArguments.root);

    const answer = await response.wait();

    console.log(answer);
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

task("test:premint")
  .addParam("address", "Contract address")
  .addParam("userAddress", "User Address")
  .addParam("count", "Mint Quantity")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const contract: Contract = await getContract("FoundryDrop", taskArguments.address, hre);

    const response = await contract.pre_mint(taskArguments.userAddress, parseInt(taskArguments.count));

    const answer = await response.wait();

    console.log(answer);
  });
