

const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")
const { ethers } = require("hardhat")
const { deployExchangeFixture, depositExchangeFixture} = require("./helpers/ExchangeFixtures")

const tokens = (n) => {
    return  ethers.parseUnits(n.toString(), 18)
}

async function flashLoanFixture(){
    const {tokens, exchange, accounts} = await loadFixture(depositExchangeFixture)
    const FlashLoanUser = await ethers.getContractFactory("FlashLoanUser")
    const flashLoanUser = await FlashLoanUser.connect(accounts.user1).deploy(await exchange.getAddress())

    return { tokens, exchange, accounts, flashLoanUser}

}

describe("FlashLoanProvider", () => {

    describe("Calling flashLoan from FlashLoanUser",()=>{

        const AMOUNT = tokens(100)
        
        it("Emits FlashLoan event", async() =>{
            const { tokens: { token0 }, exchange, accounts, flashLoanUser} = await loadFixture(flashLoanFixture)
            const flashLoanTx = await flashLoanUser
                                        .connect(accounts.user1)
                                        .getFlashLoan(
                                                await token0.getAddress(), 
                                                AMOUNT
                                        )
            await expect(flashLoanTx).to.emit(exchange, "FlashLoan")

             
        })
    })

    describe("Test Template", ()=>{

        describe("Success",()=>{
        
            it("Accepts", async() =>{
                
            })
            it("emits an event", async() =>{
                                 
            })
        })    
        describe("Failiure",()=>{
            
            it("Rejects ", async() =>{
             
            })
             
        })
    })

})   