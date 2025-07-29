require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ignition-ethers");

const { vars } = require("hardhat/config");

const INFURA_API_KEY = vars.get("INFURA_API_KEY");
const HARDHAT_MNEMONIC = vars.get("HARDHAT_MNEMONIC");
const SEPOLIA_DEPLOYER_PRIVATE_KEY = vars.get("SEPOLIA_DEPLOYER_PRIVATE_KEY");
const SEPOLIA_COLLECTOR_PRIVATE_KEY = vars.get("SEPOLIA_COLLECTOR_PRIVATE_KEY");
const SEPOLIA_USER1_PRIVATE_KEY = vars.get("SEPOLIA_USER1_PRIVATE_KEY");
const SEPOLIA_USER2_PRIVATE_KEY = vars.get("SEPOLIA_USER2_PRIVATE_KEY");

module.exports = {
  solidity: "0.8.28",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
      accounts: {
        mnemonic: HARDHAT_MNEMONIC,
      },
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [
        SEPOLIA_DEPLOYER_PRIVATE_KEY,
        SEPOLIA_COLLECTOR_PRIVATE_KEY,
        SEPOLIA_USER1_PRIVATE_KEY,
        SEPOLIA_USER2_PRIVATE_KEY
      ],
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
  for (const account of accounts) {
    const balance = await hre.ethers.provider.getBalance(account.address);
    console.log(` - ${account.address}: ${hre.ethers.formatEther(balance)} ETH`);
  }
});