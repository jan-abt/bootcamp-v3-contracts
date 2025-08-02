# DEX Project

This project is a decentralized exchange (DEX) built with Hardhat for smart contract development and deployment, and a Next.js frontend for user interaction.<br>
It includes smart contracts for ERC-20 tokens (`DAPP`, `mUSDC`, `mLINK`), an `Exchange` contract for trading, and a `FlashLoanUser` contract for flash loans, <br>
all deployed via Hardhat Ignition. The frontend, powered by Next.js, integrates with MetaMask for wallet connectivity, uses Redux for state management (e.g., orders, trades), <br> 
and leverages Ethers.js for blockchain interactions. Key features include:

- **Smart Contracts**: Deployed to a local Hardhat network (chain ID 31337) or Sepolia testnet (chain ID 11155111), <br>
  with addresses stored in `ignition/deployments/chain-<chainId>/deployed_addresses.json` and referenced in `globals.js` <br>
  via environment variables (`.env.local` or `.env.production` for Vercel).
- **Seeding Script**: `seed.js` populates the exchange with tokens, deposits, orders, and flash loans for testing, <br>
  using Hardhat-generated Externally Owned Accounts (EOAs) pre-funded with ETH.
- **Frontend**: A trading interface (`page.js`) with order books, market selection, and buy/sell forms, styled with components like `Chart`, `Book`, and `Orders`. <br>
  It connects to contracts via custom hooks (`useProvider.js`, `useExchange.js`, `useTokens.js`).
- **Deployment**: Supports local development (Hardhat node) and production deployment on Vercel, with environment variables managing network and contract configurations.

The project demonstrates a full-stack Web3 application, combining Ethereum smart contracts with a reactive frontend for decentralized trading.
# Taxonomy Of Addresses

In Ethereum, addresses represent either **`Externally Owned Accounts (EOAs)`** or **`Contract Accounts`**.

- **Externally Owned Accounts (EOAs)**:
  - Controlled by private keys (e.g., via MetaMask or Hardhat's test accounts).
  - Hold ETH balances <br>
    (e.g., `9999.991 ETH` for `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`).
  - Used to initiate transactions, such as deploying contracts or interacting with the DEX <br>
    (e.g., transferring tokens in `seed.js`).
  - Hardhat's `npx hardhat node` generates 20 pre-funded EOAs for testing <br>
    (e.g., `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`, `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`). <br>
    These are listed with balances when the node starts.
  - In this project, EOAs like `deployer`, `user1`, and `user2` in `seed.js` simulate users trading on the exchange.

- **Contract Addresses**:
  - Represent deployed smart contracts (e.g., `Token`, `Exchange`, `FlashLoanUser`).
  - Store executable code and state (e.g., token balances, order book data) but can't initiate transactions independently.
  - Generated when deploying contracts via `npx hardhat ignition deploy`.<br>
    Stored in `./ignition/deployments/chain-31337/deployed_addresses.json`, (e.g., `TokenModule#DAPP: 0x5FbDB2315678afecb367f032d93F642f64180aa3`).
  - Used in `globals.js` (e.g., `DAPP_ADDRESS`, `EXCHANGE_ADDRESS`) to connect the frontend to contracts.
  - Example: The `Exchange` contract at `0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9` handles trades and flash loans.

- **Project Context**:
  - EOAs (from Hardhat or imported to MetaMask) are used to send transactions (e.g., `makeOrder` in `page.js`).
  - Contract addresses from `deployed_addresses.json` are mirrored in `.env.local` (or `.env.production` for Vercel) <br>
    and accessed via `globals.js` for consistent frontend-backend interaction.
  - Run `npx hardhat node` to see EOA addresses and balances provided by default and <br>
    check `deployed_addresses.json` for contract addresses after deployment.

#### `npx hardhat node`

* Launches a standalone instance of Hardhat Network, which is a local, in-memory Ethereum blockchain node, designed for development and testing.
* Simulates the Ethereum Virtual Machine (EVM), allowing developers to deploy and interact with smart contracts in a controlled, <br>
  private environment without needing to connect to a live Ethereum network, like mainnet.
* Starts an HTTP and WebSocket JSON-RPC server, typically at `http://localhost:8545`, so that external clients, such as wallets (MetaMask), <br>
  decentralized application front-ends (DApp), or scripts can connect to the local blockchain.
* Generates a set of predefined Ethereum accounts, each pre-funded with a large amount of ETH (typically 10,000 ETH per account) for testing purposes.
* Use `Ctrl C` or `npx kill-port 8545` to shut down.
* Use `lsof -ti tcp:8545` to search for the process id, and  `kill -9 <pid>` to shut it down manually, if needed.

#### `npx hardhat ignition deploy ignition/modules/<my-token-contract-module>.js --network localhost`
* Recompiles the contract(s).
* Deploys contract(s) to the blockchain (Hardhat Network in this case).
* Recreates `.ignition/deployments/chain-31337` directory and populates it with new artifacts, including `deployed_addresses.json`, <br>
  which contains contract addresses, used in `globals.js`.

#### `npx hardhat run scripts/seed.js --network localhost`
* Funds the exchange and user accounts using the deployed contracts.

#### `npx hardhat clean && npx hardhat compile`
* Cleans up and recompiles contracts.

#### `npx hardhat console --network localhost`
* launches an interactive JavaScript REPL (Read-Eval-Print Loop) console within the Hardhat project


 Miscelaneous
* `npx hardhat console --network localhost`<br>
   launches an interactive JavaScript REPL (Read-Eval-Print Loop) console within the Hardhat project
* `npx hardhat vars list` <br>
   list the varialbes stored in `vars.json`
* `npx hardhat test`<br>
   run tests under `/test`
* `REPORT_GAS=true npx hardhat test` <br>
   instruct the Hardhat test runner to measure and display gas used by each transaction of each test
* `npx hardhat vars set MY_KEY` <br>
   Command to store api keys, private keys or any other keys as config variables to be referenced in the code, e.g.,
   ```js 
    const { vars } = require("hardhat/config");
    const myKey = vars.get("MY_KEY", "");
   ```
* `~/Library/Preferences/hardhat-nodejs/vars.json` <br>
   Default location wher Hardhat variables are stored



<br>
<br>

More: [hardhat-tutorial](https://hardhat.org/tutorial/deploying-to-a-live-network)


