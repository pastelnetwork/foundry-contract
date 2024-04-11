import { expect } from "chai";
import { ethers } from "hardhat";

export function shouldBehaveLikeFoundryDrop(): void {
  before(async function () {
    console.log(this.signers.admin, this.signers.alice);
    this.signedDrop = await this.drop.connect(this.signers.admin);
    this.aliceSignedDrop = await this.drop.connect(this.signers.alice);
  });

  context("initialize", async function () {
    it("drop initialization", async function () {
      expect(await this.signedDrop.symbol()).to.equal("FoundrySample");
      expect(await this.signedDrop.baseURI()).to.equal("base_uri");
    });
  });

  context("setAddressList", function () {
    it("should work fine", async function () {
      const _GuaranteedUsers = new Array(1000).fill(0).map((_, index) => index);
      const _WhiteListUsers = new Array(1200).fill(0).map((_, index) => index);
      await this.signedDrop.setGuaranteedSmartmintUsers(_GuaranteedUsers);
      await this.signedDrop.setWhiteListSmartmintUsers(_WhiteListUsers);
    });

    it("returns an error if caller is not an owner", async function () {
      const _GuaranteedUsers = new Array(1200).fill(0).map((_, index) => index);
      const _WhiteListUsers = new Array(1200).fill(0).map((_, index) => index);
      await expect(this.aliceSignedDrop.setGuaranteedSmartmintUsers(_GuaranteedUsers)).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
      await expect(this.aliceSignedDrop.setWhiteListSmartmintUsers(_WhiteListUsers)).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });
  });

  context("mint", function () {
    it("should not work at staging 0", async function () {
      await expect(this.signedDrop.mint(1, 1, { value: ethers.utils.parseEther("0.005") })).to.be.revertedWith(
        "Not started minting yet",
      );
    });

    it("should work fine at staging 1", async function () {
      await this.signedDrop.setStage(1, ethers.utils.parseEther("0.01"));
      await this.signedDrop.mint(1, 1, { value: ethers.utils.parseEther("0.01") });
      expect(await this.signedDrop.totalSupply()).to.equal(1);
    });

    it("should work not work at staging 1 when user is not guaranteed", async function () {
      await expect(this.signedDrop.mint(1001, 1, { value: ethers.utils.parseEther("0.01") })).to.be.revertedWith(
        "You are not a guaranteed user, you are unable to mint during this stage",
      );
    });

    it("should work not work at staging 1 when user tries to mint again", async function () {
      await expect(this.signedDrop.mint(1, 1, { value: ethers.utils.parseEther("0.01") })).to.be.revertedWith(
        "You are not able to purchase those tokens",
      );
    });

    it("should work fine at staging 2", async function () {
      await this.signedDrop.setStage(2, ethers.utils.parseEther("0.01"));
      await this.signedDrop.mint(1001, 1, { value: ethers.utils.parseEther("0.01") });
      expect(await this.signedDrop.totalSupply()).to.equal(2);
    });

    it("should work not work at staging 2 when user is not whitelisted", async function () {
      await expect(this.signedDrop.mint(1300, 1, { value: ethers.utils.parseEther("0.01") })).to.be.revertedWith(
        "You are not a FCFS user, you are unable to mint during this stage",
      );
    });

    it("should work fine at staging 3", async function () {
      await this.signedDrop.setStage(3, ethers.utils.parseEther("0.01"));
      await this.signedDrop.mint(1300, 1, { value: ethers.utils.parseEther("0.01") });
      expect(await this.signedDrop.totalSupply()).to.equal(3);
    });

    it("returns an error with insufficient price", async function () {
      await expect(this.signedDrop.mint(2, 1, { value: ethers.utils.parseEther("0.005") })).to.be.revertedWith(
        "Insufficient price",
      );
    });
  });

  context("setBaseURI", function () {
    it("should work fine", async function () {
      await this.signedDrop.setBaseURI("_updatedBaseURI");
      expect(await this.signedDrop.baseURI()).to.equal("_updatedBaseURI");
    });

    it("returns an error with if caller is not an owner", async function () {
      await expect(this.aliceSignedDrop.setBaseURI("_updatedBaseURI")).to.revertedWith(
        "Ownable: caller is not the owner",
      );
    });
  });

  context("setPrice", function () {
    it("should work fine", async function () {
      await this.signedDrop.setPrice(BigInt(20000000000000000));
      expect(await this.signedDrop.price()).to.equal(BigInt(20000000000000000));
    });

    it("returns an error with if caller is not an owner", async function () {
      await expect(this.aliceSignedDrop.setPrice(BigInt(10000000000000000))).to.revertedWith(
        "Ownable: caller is not the owner",
      );
    });
  });

  context("setPrimaryWallet", function () {
    it("should work fine", async function () {
      await this.signedDrop.setPrimaryWallet("0xFFf50b1b9154b0631591DAB746c5Fc8f41Dc44Bd");
      expect(await this.signedDrop.primaryWallet()).to.equal("0xFFf50b1b9154b0631591DAB746c5Fc8f41Dc44Bd");
    });

    it("returns an error with if caller is not an owner", async function () {
      await expect(this.aliceSignedDrop.setPrimaryWallet("0xFFf50b1b9154b0631591DAB746c5Fc8f41Dc44Bd")).to.revertedWith(
        "Ownable: caller is not the owner",
      );
    });
  });

  context("withdraw", function () {
    it("should work fine", async function () {
      expect(await this.signedDrop.totalBalance()).to.not.equal(0);
      await this.signedDrop.withdraw();
      expect(await this.signedDrop.totalBalance()).to.equal(0);
    });

    it("returns an error if there's no fund", async function () {
      await expect(this.signedDrop.withdraw()).to.be.revertedWith(
        "No funds to withdraw, or invalid wallet address to send.",
      );
    });

    it("returns an error if caller is not an owner", async function () {
      await expect(this.aliceSignedDrop.withdraw()).to.revertedWith("Ownable: caller is not the owner");
    });
  });
}
