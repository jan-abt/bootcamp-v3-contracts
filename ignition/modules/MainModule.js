const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const TokenModule = require("./TokenModule");
const ExchangeModule = require("./ExchangeModule");
const FlashLoanUserModule = require("./FlashLoanUserModule");

module.exports = buildModule("MainModule", (m) => {
  const { DAPP, mLINK, mUSDC } = m.useModule(TokenModule);
  const { Exchange } = m.useModule(ExchangeModule);
  const { FlashLoanUser } = m.useModule(FlashLoanUserModule);
  return { DAPP, mLINK, mUSDC, Exchange, FlashLoanUser };
});