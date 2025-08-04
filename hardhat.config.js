/**
 * Hardhat configuration for the decentralized exchange (DEX) project.
 * Configures Hardhat for compiling, deploying, and testing smart contracts (Token, Exchange, FlashLoanUser).
 * Uses plugins: @nomicfoundation/hardhat-toolbox (testing, compilation, ethers), @nomicfoundation/hardhat-ignition-ethers (contract deployment).
 * Defines two networks:
 * - localhost: Runs on Hardhat Network (chain ID 31337) for local development. Uses `HARDHAT_MNEMONIC` to derive multiple pre-funded accounts 
 *   (e.g., deployer, user1 in seed.js) automatically from a single 12/24-word mnemonic phrase, eliminating the need to list individual private keys.
 * - sepolia: Connects to the Sepolia testnet (chain ID 11155111) via Infura. Requires individual private keys (SEPOLIA_*_PRIVATE_KEY) to be listed explicitly 
 *   for each account (deployer, collector, users) because Sepolia is a live testnet, and explicit keys ensure precise control over real accounts with actual ETH for gas fees.
 * Environment variables (INFURA_API_KEY, HARDHAT_MNEMONIC, SEPOLIA_*_PRIVATE_KEY) are stored securely using Hardhat's vars (npx hardhat vars set <KEY>).
 * The 'accounts' task lists account addresses and ETH balances for the selected network (localhost or sepolia).
 * Used by scripts like seed.js and deploy.sh, and integrates with the Next.js frontend via globals.js for contract addresses (e.g., EXCHANGE_ADDRESS from deployed_addresses.json).
 * For Vercel deployment, ensure Sepolia-related env vars (e.g., NEXT_PUBLIC_RPC_URL_SEPOLIA) are set in .env.production or Vercel’s dashboard.
 */

require("@nomicfoundation/hardhat-ignition-ethers");
require("@nomicfoundation/hardhat-toolbox");

const { vars } = require("hardhat/config");

const INFURA_API_KEY = vars.get("INFURA_API_KEY", ""); // Fallback to empty string
const HARDHAT_MNEMONIC = vars.get("HARDHAT_MNEMONIC", ""); // Fallback to empty string
// In Sepolia, keys are declared individually
const SEPOLIA_DEPLOYER_PRIVATE_KEY = vars.get("SEPOLIA_DEPLOYER_PRIVATE_KEY", "");
const SEPOLIA_COLLECTOR_PRIVATE_KEY = vars.get("SEPOLIA_COLLECTOR_PRIVATE_KEY", "");
const SEPOLIA_USER1_PRIVATE_KEY = vars.get("SEPOLIA_USER1_PRIVATE_KEY", "");
const SEPOLIA_USER2_PRIVATE_KEY = vars.get("SEPOLIA_USER2_PRIVATE_KEY", "");

module.exports = {
  solidity: "0.8.28",
  paths: {
    sources: "./contracts",
    artifacts: "./artifacts",
    cache: "./cache"
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      accounts: HARDHAT_MNEMONIC ? { mnemonic: HARDHAT_MNEMONIC } : undefined,
    },
    sepolia: {
      url: INFURA_API_KEY ? `https://sepolia.infura.io/v3/${INFURA_API_KEY}` : undefined,
      accounts: [
        SEPOLIA_DEPLOYER_PRIVATE_KEY,
        SEPOLIA_COLLECTOR_PRIVATE_KEY,
        SEPOLIA_USER1_PRIVATE_KEY,
        SEPOLIA_USER2_PRIVATE_KEY,
      ].filter(key => key), // Filter out empty keys
      chainId: 11155111,
      gas: 8000000,
      gasPrice: "auto",
      timeout: 30000,
    },
  },
  // etherscan section removed, handled by hardhat-verify
};

// execute with: npx hardhat accounts --network localhost or npx hardhat accounts --network sepolia
task("accounts", "Prints accounts and balances", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  if (!accounts.length) {
    console.log("No accounts available. Check network configuration and environment variables.");
    return;
  }
  for (const account of accounts) {
    const balance = await hre.ethers.provider.getBalance(account.address);
    console.log(` - ${account.address}: ${hre.ethers.formatEther(balance)} ETH`);
  }
});