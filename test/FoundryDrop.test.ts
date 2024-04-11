import { ethers, upgrades } from "hardhat";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import type { FoundryDrop } from "../src/types/FoundryDrop";
import type { FoundryDrop__factory } from "../src/types/factories/FoundryDrop__factory";

import { Signers } from "./types";

import { shouldBehaveLikeFoundryDrop } from "./FoundryDrop.behavior.test";

describe("FoundryDrop", function () {
  before(async function () {
    this.signers = {} as Signers;

    const signers: SignerWithAddress[] = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.alice = signers[1];
    this.signers.foundry = signers[2];

    const dropFactory: FoundryDrop__factory = <FoundryDrop__factory>await ethers.getContractFactory("FoundryDrop");

    this.drop = <FoundryDrop>(
      await upgrades.deployProxy(dropFactory, [
        "FoundrySample",
        "FoundrySample",
        1000,
        1,
        5,
        "base_uri",
        "0xFFf50b1b9154b0631591DAB746c5Fc8f41Dc44Bd",
      ])
    );
    await this.drop.deployed();
  });

  shouldBehaveLikeFoundryDrop();
});
