


# Decentralized Exchange (DEX) Project

This project is a decentralized exchange (DEX) built with Hardhat for smart contract development and deployment, and a Next.js frontend for user interaction. It includes ERC-20 token contracts (`DAPP`, `mUSDC`, `mLINK`), an `Exchange` contract for trading, and a `FlashLoanUser` contract for flash loans, all deployed via Hardhat Ignition. The frontend integrates with MetaMask for wallet connectivity, uses Redux for state management (e.g., orders, trades), and leverages Ethers.js for blockchain interactions.

## Key Features
- **Smart Contracts**: Deployed to Hardhat Network (chain ID 31337) or Sepolia testnet (chain ID 11155111). Contract addresses are stored in `./ignition/deployments/chain-<chainId>/deployed_addresses.json` and referenced in `globals.js` via environment variables (`.env.local` or `.env.production` for Vercel).
- **Seeding Script**: `seed.js` populates the exchange with tokens, deposits, orders, and flash loans for testing, using Hardhat-generated Externally Owned Accounts (EOAs) pre-funded with ETH.
- **Frontend**: A Next.js trading interface (`page.js`) with order books, market selection, and buy/sell forms, styled with components (`Chart`, `Book`, `Orders`). It connects to contracts via custom hooks (`useProvider.js`, `useExchange.js`, `useTokens.js`).
- **Deployment**: Supports local development (Hardhat) and production deployment on Vercel, with environment variables managing network and contract configurations.

## Prerequisites
- **Node.js**: v16 or higher.
- **Hardhat**: Install dependencies with `npm install`.
- **MetaMask**: For frontend wallet connectivity.
- **Sepolia ETH**: Fund accounts for Sepolia deployment (use faucets like [cloud.google.com](https://cloud.google.com/application/web3/faucet/ethereum/sepolia), [sepoliafaucet.com](https://sepoliafaucet.com/) or [Alchemy](https://www.alchemy.com/faucets/ethereum-sepolia)).
- **Environment Variables**: Create `.env.local` (Hardhat) and `.env.production` (Sepolia/Vercel) with:

  ```plaintext
  NEXT_PUBLIC_CHAIN_ID=<chain-id>>
  NEXT_PUBLIC_DAPP_ADDRESS=<address>
  NEXT_PUBLIC_MUSDC_ADDRESS=<address>
  NEXT_PUBLIC_MLINK_ADDRESS=<address>
  NEXT_PUBLIC_EXCHANGE_ADDRESS=<address>
  NEXT_PUBLIC_FLASHLOAN_USER_ADDRESS=<address>  
  ```
  interact with the local hardhat block chain
  ```plaintext
  NEXT_PUBLIC_RPC_URL_HARDHAT=http://127.0.0.1:8545
  ```
  interact with the Sepolia block chain:
  ```plaintext
  NEXT_PUBLIC_RPC_URL_SEPOLIA=https://sepolia.infura.io/v3/<your_infura_key>
  ```
  
  
  ```

## Setup
1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd bootcamp-v3-contracts
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Compile contracts:
   ```bash
   npx hardhat clean && npx hardhat compile
   ```

## Address Taxonomy
Ethereum addresses are either **Externally Owned Accounts (EOAs)** or **Contract Accounts**:

- **EOAs**:
  - Controlled by private keys (e.g., MetaMask, Hardhat test accounts).
  - Hold ETH (e.g., ~10,000 ETH for Hardhat accounts like `0x...`).
  - Initiate transactions (e.g., deploy contracts, approve tokens, sign transactions, trade in `seed.js`).
  - Hardhat's `npx hardhat node` generates 20 pre-funded EOAs, listed with balances on startup.
  - In this project, EOAs like `deployer`, `user1`, and `user2` in `seed.js` simulate users.

- **Contract Addresses**:
  - Represent deployed contracts (e.g., `Token`, `Exchange`, `FlashLoanUser`).
  - Store code and state (e.g., token balances, order book) but cannot approve tokens, initiate or sign transactions independently.
  - Generated via `npx hardhat ignition deploy` and stored in `./ignition/deployments/chain-<chainId>/deployed_addresses.json`.
  - Referenced in `globals.js` (e.g., `DAPP_ADDRESS`, `EXCHANGE_ADDRESS`) for frontend integration.
  - Example: `Exchange` at `0x...` handles trades and flash loans.

## Commands

### Development
- **Start Hardhat Node**:
  ```bash
  npx hardhat node
  ```
  - Launches a local Ethereum blockchain (chain ID 31337) at `http://localhost:8545`.
  - Provides 20 pre-funded EOAs for testing.
  - Stop with `Ctrl+C` or:
    ```bash
    lsof -ti tcp:8545
    kill -9 <pid>
    ```

- **Compile Contracts**:
  ```bash
  npx hardhat clean && npx hardhat compile
  ```
  - Cleans and recompiles contracts, generating artifacts in `./artifacts`.

- **Deploy Contracts**:
  ```bash
  ./deploy.sh dev
  ```
  - Deploys to Hardhat Network, updating `./ignition/deployments/chain-31337/deployed_addresses.json`.
  ```bash
  ./deploy.sh prod
  ```
  - Deploys to Sepolia testnet, updating `./ignition/deployments/chain-11155111/deployed_addresses.json`.

- **Configure environment variables**:
  - Copy addresses from the respective `deployed_addresses.json` into`.env.local` and `.env.production`
  - Fill in the respective `RPC_URL` ([SEPOLIA](https://developer.metamask.io/) or [HARDHAT](http://127.0.0.1:8545)).


- **Seed Exchange**:
  ```bash
  npx hardhat run scripts/seed.js --network localhost
  ```
  - Populates the exchange with tokens, deposits, orders, and flash loans on Hardhat.
  ```bash
  ./seed.sh dev
  ```
  - Runs `seed.js` on Hardhat Network.
  ```bash
  ./seed.sh prod
  ```
  - Runs `seed.js` on Sepolia testnet (requires funded accounts).

- **Clear Deployment State**:
  ```bash
  rm -rf ./ignition/deployments/chain-*
  ```
  - Removes deployment artifacts for fresh deployments.

- **Interactive Console**:
  ```bash
  npx hardhat console --network localhost
  ```
  - Opens a JavaScript REPL for interacting with the Hardhat blockchain.

### Testing
- **Run Tests**:
  ```bash
  npx hardhat test
  ```
  - Executes tests in the `/test` directory (e.g., `test/FlashLoanUser.test.js`).
- **Gas Reporting**:
  ```bash
  REPORT_GAS=true npx hardhat test
  ```
  - Measures and displays gas usage for each test transaction.

### Hardhat Variables
- **List Variables**:
  ```bash
  npx hardhat vars list
  ```
  - Lists variables stored in `vars.json` (e.g., API keys, private keys).
- **Set Variable**:
  ```bash
  npx hardhat vars set MY_KEY
  ```
  - Stores a key (e.g., `PRIVATE_KEY`, `ETHERSCAN_API_KEY`) in `vars.json`.
  - Example usage in Hardhat config:
    ```javascript
    const { vars } = require("hardhat/config");
    const myKey = vars.get("MY_KEY", "");
    ```
- **Variable Storage**:
  - macOS: `~/Library/Preferences/hardhat-nodejs/vars.json`
  - Windows: `%APPDATA%\hardhat-nodejs\vars.json`
  - Linux: `~/.config/hardhat-nodejs/vars.json`

### Verification
- **Verify Contracts on Sepolia**:
  ```bash
  npx hardhat verify --network sepolia <contract_address> <constructor_args>
  ```
  - Example:
    ```bash
    npx hardhat verify --network sepolia 0x... 0x...
    ```

## Additional Resources
- [Hardhat Tutorial: Deploying to a Live Network](https://hardhat.org/tutorial/deploying-to-a-live-network)
- [Hardhat Ignition Documentation](https://hardhat.org/ignition)
- [Ethers.js Documentation](https://docs.ethers.org/v6/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel](https://vercel.com/jan-abts-projects/bootcamp-v3-interface/deployments)
- [Sepolia ETH Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)
- [Metamask Developer API-Keys](https://developer.metamask.io/)