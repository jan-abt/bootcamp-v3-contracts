require("@nomicfoundation/hardhat-toolbox");

const { vars } = require("hardhat/config");

// Go to https://tenderly.co/ , sign up and create a new API key
// in its dashboard, and add it to the configuration variables
const TENDERLY_API_KEY = vars.get("TENDERLY_API_KEY");
const DELPOYER_PRIVATE_KEY = vars.get("DELPOYER_PRIVATE_KEY");
const COLLECTOR_PRIVATE_KEY = vars.get("COLLECTOR_PRIVATE_KEY");


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
   networks: {
    tenderly: {
      url: `https://virtual.mainnet.rpc.tenderly.co/${TENDERLY_API_KEY}`,
      accounts: [DELPOYER_PRIVATE_KEY, COLLECTOR_PRIVATE_KEY],
    },
  },
};
