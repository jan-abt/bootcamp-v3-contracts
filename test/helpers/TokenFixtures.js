
async function deployTokenFixture(){

      const Token = await ethers.getContractFactory("Token")
      const token = await Token.deploy("Dapp University", "DAPP", 1000000)

      // the default signer (i.e., the first account returned by ethers.getSigners())
      // will become msg.sender inside the contract
      const accounts = await ethers.getSigners()   
      const deployer = accounts[0]
      const receiver = accounts[1]

    return { token, deployer, receiver}
}

module.exports = {
    deployTokenFixture
}