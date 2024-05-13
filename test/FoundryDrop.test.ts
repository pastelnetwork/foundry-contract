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
    this.signers.alice1 = signers[1];
    this.signers.alice2 = signers[2];
    this.signers.foundry = signers[3];

    const dropFactory: FoundryDrop__factory = <FoundryDrop__factory>await ethers.getContractFactory("FoundryDrop");

    this.drop = <FoundryDrop>(
      await upgrades.deployProxy(dropFactory, ["FoundrySample", "FoundrySample", 302, 5, "base_uri"])
    );
    await this.drop.deployed();
  });

  shouldBehaveLikeFoundryDrop();
});
