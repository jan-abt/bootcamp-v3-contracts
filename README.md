# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.


#### `npx hardhat node`

* launches a standalone instance of Hardhat Network, which is a local, in-memory Ethereum blockchain node, designed for development and testing.
* simulates the Ethereum Virtual Machine (EVM), allowing developers to deploy and interact with smart contracts in a controlled, <br>
  private environment without needing to connect to a live Ethereum network, like mainnet.
* starts an HTTP and WebSocket JSON-RPC server, typically at `http://localhost:8545` so that external clients, <br>
  such as wallets (MetaMask), decentralized application front-ends (DApp) or scripts can connect to the local blockchain.
* generates a set of predefined Ethereum accounts, each pre-funded with a large amount of ETH (typically 10,000 ETH per account) for testing purposes.
* use `Ctrl C`  or `npx kill-port 8545` to shut down.

#### `npx hardhat ignition deploy ignition/modules/<my-token-contract-module>.js --network localhost`
* Recompiles the contract(s)
* deploys contract(s) to the blockchain (Hardhat Network in this case)
* recreates `.ignition/deployments/chain-31337` directory and populates it with new artifacts, including `deployed_addresses.json`. <br>
  deployed_addresses.json has contract addresses, which you will likely reference in your scripts.

#### `npx hardhat run scripts/seed.js --network localhost`
* fund the exchange and user accounts using the deployed contracts

#### `npx hardhat clean && npx hardhat compile`
* cleanup & recompile

#### `./deploy.sh` and `./seed.sh`
* run those scripts to start a local hardhat blockchain node, deploy contracts on it and fund accounts

<br>

--- 


##### Other
Store api keys or private keys in config variables to be used in hardhat configuration files<br>
* `npx hardhat vars set MY_KEY`

Variables are stored under <br>
* `~/Library/Preferences/hardhat-nodejs/vars.json`

List Key names <br>
* `npx hardhat vars list`

 Miscelaneous
* `npx hardhat test`
* `REPORT_GAS=true npx hardhat test` <br>
   _<small style="font-size: 0.65em"> REPORT_GAS is a HardHat environment variable instructing the Hardhat test runner to measure and display the gas used by each transaction in the tests</small>_
* `npx hardhat ignition deploy ./ignition/modules/Lock.js`<br>
 _<small style="font-size: 0.65em">Lock.js contains deployment logic for one or more smart contracts, typically including Contract instantiation, Constructor arguments, Dependencies </small>_
* `npx hardhat help`


<br>
<br>

More: [hardhat-tutorial](https://hardhat.org/tutorial/deploying-to-a-live-network)


