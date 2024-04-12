import { expect } from "chai";
import { ethers } from "hardhat";

export function shouldBehaveLikeFoundryDrop(): void {
  before(async function () {
    this.signedDrop = await this.drop.connect(this.signers.admin);
    this.aliceSignedDrop1 = await this.drop.connect(this.signers.alice1);
    this.aliceSignedDrop2 = await this.drop.connect(this.signers.alice2);
  });

  context("initialize", async function () {
    it("drop initialization", async function () {
      expect(await this.signedDrop.symbol()).to.equal("FoundrySample");
      expect(await this.signedDrop.baseURI()).to.equal("base_uri");
    });
  });

  context("setAddressList", function () {
    it("should work fine", async function () {
      const _GuaranteedAddresses = [
        "0x185b3F6618A50122C70FD100C7Aac729621B8a25",
        "0xFD2b3c9DF1c8e3493540dfd05EA951d584aB34c4",
        this.signers.admin.address,
      ];
      const _WhiteListAddresses = [
        "0x185b3F6618A50122C70FD100C7Aac729621B8a25",
        "0xFD2b3c9DF1c8e3493540dfd05EA951d584aB34c4",
        this.signers.admin.address,
        this.signers.alice1.address,
      ];
      await this.signedDrop.setGuaranteedAddresses(_GuaranteedAddresses);
      await this.signedDrop.setWhiteListAddresses(_WhiteListAddresses);
    });

    it("returns an error if caller is not an owner", async function () {
      const _GuaranteedAddresses = [
        "0x185b3F6618A50122C70FD100C7Aac729621B8a25",
        "0xFD2b3c9DF1c8e3493540dfd05EA951d584aB34c4",
      ];
      const _WhiteListAddresses = [
        "0x185b3F6618A50122C70FD100C7Aac729621B8a25",
        "0xFD2b3c9DF1c8e3493540dfd05EA951d584aB34c4",
      ];
      await expect(this.aliceSignedDrop1.setGuaranteedAddresses(_GuaranteedAddresses)).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
      await expect(this.aliceSignedDrop1.setWhiteListAddresses(_WhiteListAddresses)).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });
  });

  context("mint", function () {
    it("should not work at staging 0", async function () {
      await expect(this.signedDrop.mint({ value: ethers.utils.parseEther("0.005") })).to.be.revertedWith(
        "Not started minting yet",
      );
    });

    it("should pre-mint not work if caller is not owner", async function () {
      await expect(
        this.aliceSignedDrop1.pre_mint("0xCE9d85110a662b2bd7bE0A08165Dd60C8A7B93a7", 300),
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should pre-mint work at staging 0", async function () {
      await this.signedDrop.pre_mint("0xCE9d85110a662b2bd7bE0A08165Dd60C8A7B93a7", 300);
      expect(await this.signedDrop.totalSupply()).to.equal(300);
    });

    it("should work fine at staging 1", async function () {
      await this.signedDrop.setStage(1, ethers.utils.parseEther("0.01"));
      await this.signedDrop.mint({ value: ethers.utils.parseEther("0.01") });
      expect(await this.signedDrop.totalSupply()).to.equal(301);
    });

    it("should pre-mint not work at staging 1", async function () {
      await expect(this.signedDrop.pre_mint("0xCE9d85110a662b2bd7bE0A08165Dd60C8A7B93a7", 300)).to.be.revertedWith(
        "Can only pre-mint when minting is not started",
      );
    });

    it("should work not work at staging 1 when user is not guaranteed", async function () {
      await expect(this.aliceSignedDrop1.mint({ value: ethers.utils.parseEther("0.01") })).to.be.revertedWith(
        "You are not a guaranteed user, you are unable to mint during this stage",
      );
    });

    it("should work not work at staging 1 when user tries to mint again", async function () {
      await expect(this.signedDrop.mint({ value: ethers.utils.parseEther("0.01") })).to.be.revertedWith(
        "You are not able to purchase those tokens",
      );
    });

    it("should work not work at staging 2 when user is not whitelisted", async function () {
      await this.signedDrop.setStage(2, ethers.utils.parseEther("0.01"));
      await expect(this.aliceSignedDrop2.mint({ value: ethers.utils.parseEther("0.01") })).to.be.revertedWith(
        "You are not a FCFS or guaranteed user, you are unable to mint during this stage",
      );
    });

    it("should work fine at staging 2", async function () {
      await this.aliceSignedDrop1.mint({ value: ethers.utils.parseEther("0.01") });
      expect(await this.signedDrop.totalSupply()).to.equal(302);
    });

    it("should not work if max supply sold out", async function () {
      await this.signedDrop.setStage(3, ethers.utils.parseEther("0.01"));
      await expect(this.aliceSignedDrop2.mint({ value: ethers.utils.parseEther("0.01") })).to.be.revertedWith(
        "No available tokens",
      );
    });

    it("returns an error with insufficient price", async function () {
      await expect(this.aliceSignedDrop2.mint({ value: ethers.utils.parseEther("0.005") })).to.be.revertedWith(
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
      await expect(this.aliceSignedDrop1.setBaseURI("_updatedBaseURI")).to.revertedWith(
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
      await expect(this.aliceSignedDrop1.setPrice(BigInt(10000000000000000))).to.revertedWith(
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
      await expect(
        this.aliceSignedDrop1.setPrimaryWallet("0xFFf50b1b9154b0631591DAB746c5Fc8f41Dc44Bd"),
      ).to.revertedWith("Ownable: caller is not the owner");
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
      await expect(this.aliceSignedDrop1.withdraw()).to.revertedWith("Ownable: caller is not the owner");
    });
  });
}
