// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");


module.exports = buildModule("TokenModule", (m) => {

  const TOTAL_SUPPLY = 1000000
  const DEPLOYER =  m.getAccount(0)
  
  
  const dApp = m.contract(
    "Token", 
    ["Dapp University", "DAPPU", TOTAL_SUPPLY], 
    {from: DEPLOYER, id: "DAPP"}
  );
  
  const mUsdc = m.contract(
    "Token", 
    ["Mock USDC", "mUSDC", TOTAL_SUPPLY], 
    {from: DEPLOYER, id: "mUSDC"}
  );
  
  const mLink = m.contract(
    "Token", 
    ["Mock Link", "mLINK", TOTAL_SUPPLY], 
    {from: DEPLOYER, id: "mLINK"}
  );

  
return { DAPP: dApp, mLINK: mLink, mUSDC: mUsdc };});
