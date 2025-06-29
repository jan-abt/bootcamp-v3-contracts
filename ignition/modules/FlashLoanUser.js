// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("UserModule", (m) => {

  const USER = m.getAccount(2)
  const EXCHANGE_ADDRESS =  "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
  
  
  const flashLoanUser = m.contract(
    "FlashLoanUser", 
    [EXCHANGE_ADDRESS], 
    {from: USER}
  );
  
  
  return { flashLoanUser};
});
