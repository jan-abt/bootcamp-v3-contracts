
const tokens = (n) => {
    return  ethers.parseUnits(n.toString(), 18)
}

async function deployTokenFixture(){

      const Token = await ethers.getContractFactory("Token")
      const token = await Token.deploy("Dapp University", "DAPP", 1000000)

      // the default signer (i.e., the first account returned by ethers.getSigners())
      // will become msg.sender inside the contract
      const accounts = await ethers.getSigners()   
      const deployer = accounts[0]
      const receiver = accounts[1]
      const exchange = accounts[3]

    return { token, deployer, receiver, exchange}
}

async function transferFromTokenFixture(){
   const { token, deployer, receiver, exchange} = await deployTokenFixture()

   const AMOUNT = ethers.parseUnits("100", 18)

   // We don't need to the transaction for the approve, so
   // we just wrap it in an await, so we can still do .wait()
   await (await token.connect(deployer).approve(exchange.address, AMOUNT)).wait()

   const transaction = await token.connect(exchange).transferFrom(deployer.address, receiver.address, AMOUNT)
   await transaction.wait()

   return {token, deployer, receiver, exchange, transaction}

}

module.exports = {
    tokens,
    deployTokenFixture,
    transferFromTokenFixture
}