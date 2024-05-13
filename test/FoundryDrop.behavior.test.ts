import { expect } from "chai";
import { ethers } from "hardhat";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import fs from "fs";

// Function to generate Merkle root and proof
function generateMerkleTree(whitelist: string[]) {
  const tree = StandardMerkleTree.of(
    whitelist.map(add => [add]),
    ["address"],
  );

  fs.writeFileSync("tree.json", JSON.stringify(tree.dump()));
  return tree.root;
}

function generateMerkleProof(whitelist: string[], address: string) {
  const tree = StandardMerkleTree.of(
    whitelist.map(add => [add]),
    ["address"],
  );
  for (const [i, v] of tree.entries()) {
    if (v[0] === address) {
      console.log(i);
      return tree.getProof(i);
    }
  }
  return ["0x0000000000000000000000000000000000000000000000000000000000000000"];
}

let _GuaranteedAddresses: string[] = [];
let _WhiteListAddresses: string[] = [];

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
      _GuaranteedAddresses = [
        "0x185b3F6618A50122C70FD100C7Aac729621B8a25",
        "0xFD2b3c9DF1c8e3493540dfd05EA951d584aB34c4",
        this.signers.admin.address,
      ];
      _WhiteListAddresses = [
        "0x185b3F6618A50122C70FD100C7Aac729621B8a25",
        "0xFD2b3c9DF1c8e3493540dfd05EA951d584aB34c4",
        this.signers.admin.address,
        this.signers.alice1.address,
      ];
      await this.signedDrop.setGuaranteedMerkleRoot(generateMerkleTree(_GuaranteedAddresses));
      await this.signedDrop.setWhiteListMerkleRoot(generateMerkleTree(_WhiteListAddresses));
    });

    it("returns an error if caller is not an owner", async function () {
      await expect(
        this.aliceSignedDrop1.setGuaranteedMerkleRoot(generateMerkleTree(_GuaranteedAddresses)),
      ).to.be.revertedWith("Ownable: caller is not the owner");
      await expect(
        this.aliceSignedDrop1.setWhiteListMerkleRoot(generateMerkleTree(_WhiteListAddresses)),
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  context("mint", function () {
    it("should not work at staging 0", async function () {
      await expect(
        this.signedDrop.mint(generateMerkleProof(_GuaranteedAddresses, this.signers.admin.address), {
          value: ethers.utils.parseEther("0.005"),
        }),
      ).to.be.revertedWith("Not started minting yet");
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
      await this.signedDrop.mint(generateMerkleProof(_GuaranteedAddresses, this.signers.admin.address), {
        value: ethers.utils.parseEther("0.01"),
      });
      expect(await this.signedDrop.totalSupply()).to.equal(301);
    });

    it("should pre-mint not work at staging 1", async function () {
      await expect(this.signedDrop.pre_mint("0xCE9d85110a662b2bd7bE0A08165Dd60C8A7B93a7", 300)).to.be.revertedWith(
        "Can only pre-mint when minting is not started",
      );
    });

    it("should work not work at staging 1 when user is not guaranteed", async function () {
      await expect(
        this.aliceSignedDrop1.mint(generateMerkleProof(_GuaranteedAddresses, this.signers.alice1.address), {
          value: ethers.utils.parseEther("0.01"),
        }),
      ).to.be.revertedWith("You are not a guaranteed user, you are unable to mint during this stage");
    });

    it("should work not work at staging 1 when user tries to mint again", async function () {
      await expect(
        this.signedDrop.mint(generateMerkleProof(_GuaranteedAddresses, this.signers.admin.address), {
          value: ethers.utils.parseEther("0.01"),
        }),
      ).to.be.revertedWith("You are not able to purchase those tokens");
    });

    it("should work not work at staging 2 when user is not whitelisted", async function () {
      await this.signedDrop.setStage(2, ethers.utils.parseEther("0.01"));
      await expect(
        this.aliceSignedDrop2.mint(generateMerkleProof(_WhiteListAddresses, this.signers.alice2.address), {
          value: ethers.utils.parseEther("0.01"),
        }),
      ).to.be.revertedWith("You are not a FCFS or guaranteed user, you are unable to mint during this stage");
    });

    it("should work fine at staging 2", async function () {
      await this.aliceSignedDrop1.mint(generateMerkleProof(_WhiteListAddresses, this.signers.alice1.address), {
        value: ethers.utils.parseEther("0.01"),
      });
      expect(await this.signedDrop.totalSupply()).to.equal(302);
    });

    it("should not work if max supply sold out", async function () {
      await this.signedDrop.setStage(3, ethers.utils.parseEther("0.01"));
      await expect(
        this.aliceSignedDrop2.mint(generateMerkleProof(_WhiteListAddresses, this.signers.alice2.address), {
          value: ethers.utils.parseEther("0.01"),
        }),
      ).to.be.revertedWith("No available tokens");
    });

    it("returns an error with insufficient price", async function () {
      await expect(
        this.aliceSignedDrop2.mint(generateMerkleProof(_GuaranteedAddresses, this.signers.alice2.address), {
          value: ethers.utils.parseEther("0.005"),
        }),
      ).to.be.revertedWith("Insufficient price");
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
}
