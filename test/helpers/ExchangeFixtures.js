const { ethers } = require("hardhat")


const tokens = (n) => {
    return  ethers.parseUnits(n.toString(), 18)
}

async function deployExchangeFixture(){

      const Exchange = await ethers.getContractFactory("Exchange")
      const Token = await ethers.getContractFactory("Token")

      const token0 = await Token.deploy("Dapp University", "DAPP",  1000000) // fictional Token
      const token1 = await Token.deploy("Mock Dai", "mDAI",  1000000) // fake stable coin

      const accounts = await ethers.getSigners()
      
      const deployer = accounts[0] // same person, different wallet
      const feeAccount = accounts[1] // same person, different wallet
      const user1 = accounts[2]
      const user2 = accounts[3]

      const AMOUNT = ethers.parseUnits("100", 18)

      //transfer 100 tokens to user1
      await (await token0.connect(deployer).transfer(user1.address, AMOUNT)).wait()
      //transfer 100 tokens to user1
      await (await token1.connect(deployer).transfer(user2.address, AMOUNT)).wait()

      const FEE_PERCENT = 10
      const exchange = await Exchange.deploy(feeAccount, FEE_PERCENT)
 
    return {tokens: {token0, token1}, exchange, accounts: {deployer, feeAccount, user1, user2} }
}

async function depositExchangeFixture(){
   const { tokens, exchange, accounts } = await deployExchangeFixture()
   const AMOUNT = ethers.parseUnits("100", 18)

   // approve token0 for user1
   await(await tokens.token0.connect(accounts.user1).approve(await exchange.getAddress(), AMOUNT)).wait()
   
   // deposit token0 for user1
   const transaction = await exchange.connect(accounts.user1).depositToken(await tokens.token0.getAddress(), AMOUNT)
   await transaction.wait()


   // approve token1 for user2
   await(await tokens.token1.connect(accounts.user2).approve(await exchange.getAddress(), AMOUNT)).wait()
   
   // deposit token1 for user2
   await (await exchange.connect(accounts.user2).depositToken(await tokens.token1.getAddress(), AMOUNT)).wait()
   

   return { tokens, exchange, accounts, transaction }
}

async function orderExchangeFixture(){

   const { tokens, exchange, accounts } = await depositExchangeFixture()

   const AMOUNT = ethers.parseUnits("1", 18)

   // Make order
   // We need the transaction variable to test in our unit test
   const transaction = await exchange.connect(accounts.user1).makeOrder(
    await tokens.token1.getAddress(),
    AMOUNT,
    await tokens.token0.getAddress(),
    AMOUNT
   )

   await transaction.wait()

   return  { tokens, exchange, accounts , transaction }

}

module.exports = {
   tokens,
   deployExchangeFixture,
   depositExchangeFixture,
   orderExchangeFixture
}