const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const ExchangeModule = require("./ExchangeModule");

module.exports = buildModule("FlashLoanUserModule", (m) => {
  // Get the deployer account
  const deployer = m.getAccount(0);

  // Import ExchangeModule and get Exchange contract
  const { Exchange } = m.useModule(ExchangeModule);

  // Deploy FlashLoanUser with the Exchange address as constructor argument
  const flashLoanUser = m.contract("FlashLoanUser", [Exchange], {
    from: deployer,
    // Network-specific gas overrides (only for Sepolia)
    gasPrice: hre.network.name === "sepolia" ? 2000000000 : undefined, // 2 gwei
    gasLimit: hre.network.name === "sepolia" ? 2000000 : undefined
  });

  return { FlashLoanUser: flashLoanUser };
});