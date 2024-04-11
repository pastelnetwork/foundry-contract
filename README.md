# Foundry Smart Mint Contracts

All contracts have been built as upgradable contracts using UUPS proxy pattern.
Check [UUPSUpgradable](https://docs.openzeppelin.com/contracts/4.x/api/proxy#UUPSUpgradeable) on openzeppelin.

## Contracts

### FoundryDrop

Proxiable **ERC721** collection contract. It provide `mint` function to allow minting for any user.
By default minting price is **0.01 ETH** and owner can call `setPrice` to set new price.

## Deploy scripts

**Deploy scripts**

```
// deploy sample drop contract
yarn deloy:drop-sample --network <network_name>
```

## Tech stacks

- [Hardhat](https://github.com/nomiclabs/hardhat): compile and run the smart contracts on a local development network
- [TypeChain](https://github.com/ethereum-ts/TypeChain): generate TypeScript types for smart contracts
- [Ethers](https://github.com/ethers-io/ethers.js/): renowned Ethereum library and wallet implementation
- [Waffle](https://github.com/EthWorks/Waffle): tooling for writing comprehensive smart contract tests
- [Solhint](https://github.com/protofire/solhint): linter
- [Solcover](https://github.com/sc-forks/solidity-coverage): code coverage
- [Prettier Plugin Solidity](https://github.com/prettier-solidity/prettier-plugin-solidity): code formatter

This is a GitHub template, which means you can reuse it as many times as you want. You can do that by clicking the "Use this
template" button at the top of the page.

## Usage

### Pre Requisites

Before running any command, you need to create a `.env` file and set a BIP-39 compatible mnemonic as an environment
variable. Follow the example in `.env.example`. If you don't already have a mnemonic, use this [website](https://iancoleman.io/bip39/) to generate one.

Then, proceed with installing dependencies:

```sh
yarn install
```

### Compile

Compile the smart contracts with Hardhat:

```sh
$ yarn compile
```

### TypeChain

Compile the smart contracts and generate TypeChain artifacts:

```sh
$ yarn typechain
```

### Lint Solidity

Lint the Solidity code:

```sh
$ yarn lint:sol
```

### Lint TypeScript

Lint the TypeScript code:

```sh
$ yarn lint:ts
```

### Test

Run the Mocha tests:

```sh
$ yarn test
```

### Coverage

Generate the code coverage report:

```sh
$ yarn coverage
```

### Report Gas

See the gas usage per unit test and average gas per method call:

```sh
$ REPORT_GAS=true yarn test
```

### Clean

Delete the smart contract artifacts, the coverage reports and the Hardhat cache:

```sh
$ yarn clean
```

### Deploy

Deploy the contracts to Hardhat Network:

```sh
$ yarn deploy --greeting "Bonjour, le monde!"
```

## Syntax Highlighting

If you use VSCode, you can enjoy syntax highlighting for your Solidity code via the
[vscode-solidity](https://github.com/juanfranblanco/vscode-solidity) extension. The recommended approach to set the
compiler version is to add the following fields to your VSCode user settings:

```json
{
  "solidity.compileUsingRemoteVersion": "v0.8.4+commit.c7e474f2",
  "solidity.defaultCompiler": "remote"
}
```

Where of course `v0.8.4+commit.c7e474f2` can be replaced with any other version.

## How to use smart contracts in SmartMint

- Deploy smart contracts on chains(Polygon, Ethereum)
- Copy deployed address of the smart contracts
- Paste them to frontend(amplify), and backend(elastic beanstalk) as environment variables.

```frontend
REACT_APP_ETHEREUM_COLLECTION_FACTORY_CONTRACT_ADDRESS=
REACT_APP_ETHEREUM_DROP_FACTORY_CONTRACT_ADDRESS=
REACT_APP_POLYGON_COLLECTION_FACTORY_CONTRACT_ADDRESS=
REACT_APP_POLYGON_DROP_FACTORY_CONTRACT_ADDRESS=
```

```backend
ETHEREUM_COLLECTION_ADDRESS=
ETHEREUM_DROP_ADDRESS=
POLYGON_COLLECTION_ADDRESS=
POLYGON_DROP_ADDRESS=
```
