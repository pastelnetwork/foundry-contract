import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import type { Fixture } from "ethereum-waffle";

import type { FoundryDrop } from "../src/types/FoundryDrop";

declare module "mocha" {
  export interface Context {
    drop: FoundryDrop;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
  }
}

export interface Signers {
  admin: SignerWithAddress;
  alice1: SignerWithAddress;
  alice2: SignerWithAddress;
  foundry: SignerWithAddress;
}
