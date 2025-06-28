const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers")
const { expect } = require("chai")
const { ethers } = require("hardhat")
const { tokens, deployTokenFixture, transferFromTokenFixture } = require("./helpers/TokenFixtures")


describe("Token", () => {

    describe("Deployment",()=>{
        const NAME = "Dapp University"
        const SYMBOL = "DAPP"
        const DECIMALS = 18
        const TOTAL_SUPPLY = tokens(1000000)

        it("has correct name", async() =>{

            const { token } = await loadFixture(deployTokenFixture)
            expect(await token.name()).to.equal(NAME)
        })

        it("has correct symbol", async() =>{

            const { token } = await loadFixture(deployTokenFixture)
            expect(await token.symbol()).to.equal(SYMBOL)
        })

        it("has correct decimals", async() =>{

            const { token } = await loadFixture(deployTokenFixture)
            expect(await token.decimals()).to.equal(DECIMALS)
        })

        it("has correct totalSupply", async() =>{

            const { token } = await loadFixture(deployTokenFixture)        
            expect(await token.totalSupply()).to.equal(TOTAL_SUPPLY)
        })

        it("assigns totalSupply to deployer", async() =>{

            const { token, deployer } = await loadFixture(deployTokenFixture)   
            
            const deployerBalance = await token.balanceOf(deployer.address)
            expect(deployerBalance).to.equal(TOTAL_SUPPLY)
        })
    })
     
    describe("Sending Tokens", ()=>{

        const AMOUNT =  tokens(100)
        
        describe("Success", ()=>{
            it("transfers token balances", async() =>{

                const { token, deployer, receiver } = await loadFixture(deployTokenFixture)   
                
                // calling the function costs gas - its going to take some ther out of the sender's wallet
                // gas fee occurs because we are manipulating the block chain by updating its state.
                // with "transaction", we are createing a record which will be included in a block (of transactions),
                // which is then linked into the blockchain.
                const transaction = await token.connect(deployer).transfer(receiver.address, AMOUNT)
                // Ensure the transaction is confirmed (mined) before we check the results.
                await transaction.wait()

                expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))
                expect(await token.balanceOf(receiver.address)).to.equal(AMOUNT)

            })
                
            it("emits transfer event", async() =>{

                const { token, deployer, receiver } = await loadFixture(deployTokenFixture)   
                const transaction = await token.connect(deployer).transfer(receiver.address, AMOUNT)
                // Ensure the transaction is confirmed (mined) so that the Transfer event is available
                await transaction.wait()

                //  even though the transaction is already mined (wait() is done),
                //  the expect(...).to.emit(...) still has to:
                //  * Access the logs in the receipt
                //  * Decode the ABI-encoded event data
                //  * Compare to expected values

                await expect(transaction).to.emit(token, "Transfer")
                    .withArgs(deployer.address, receiver.address, AMOUNT)

                
            })
        })

        describe("Failiure", ()=>{
            it("rejects insufficient balances", async() =>{

                const { token, deployer, receiver } = await loadFixture(deployTokenFixture)   
                
                const INVALID_AMOUNT = tokens(100000000) // 100 Million tokens
                const ERROR = "Token: Insufficient Funds"

                // Events and errors run inside the transaction life cyle, therefore we put the "await" infront the "expect"
                await expect(token.connect(deployer).transfer(receiver.address, INVALID_AMOUNT))
                .to.be.revertedWith(ERROR)
                
            })
                
            it("rejects invalid recipient", async() =>{

                const { token, deployer, receiver } = await loadFixture(deployTokenFixture)   
                
                const INVALID_RECIPIENT_ADDRESS = "0x0000000000000000000000000000000000000000"
                const ERROR = "Recipient Token is address 0"
                
                await expect(token.connect(deployer).transfer(INVALID_RECIPIENT_ADDRESS, AMOUNT))
                .to.be.revertedWith(ERROR)
                
            })

        })

    })

    describe("Approving Tokens", ()=>{
         const AMOUNT = tokens(100)
         
         describe("Success", ()=>{
             it("allows for delegated token spending", async() =>{

                const { token, deployer, exchange } = await loadFixture(deployTokenFixture)   

                const transaction = await token.connect(deployer).approve(exchange.address, AMOUNT)
                // Ensure the transaction is confirmed (mined) before we check the results.
                await transaction.wait()

                expect(await token.allowance(deployer.address, exchange.address)).to.equal(AMOUNT)                

            })
            it("emits approval event", async() =>{

                const { token, deployer, exchange } = await loadFixture(deployTokenFixture)   

                const transaction = await token.connect(deployer).approve(exchange.address, AMOUNT)
                // Ensure the transaction is confirmed (mined) before we check the results.
                await transaction.wait()

                await expect(transaction).to.emit(token, "Approval")
                        .withArgs(deployer.address, exchange.address, AMOUNT)
                

            })
            
         })
         
         describe("Failiure", ()=>{
            it("rejects invalid spender", async() =>{

                const { token, deployer } = await loadFixture(deployTokenFixture)   
                
                const INVALID_SPENDER_ADDRESS = "0x0000000000000000000000000000000000000000"
                const ERROR = "Token: Spender is address 0"
                
                await expect(token.connect(deployer).approve(INVALID_SPENDER_ADDRESS, AMOUNT))
                .to.be.revertedWith(ERROR)
                
            })
         })

    })

    describe("Delegated Token Transfers", ()=>{
        const AMOUNT = tokens(100)
        
        describe("Success", ()=>{
            it("transfer token balances", async() =>{
                const { token, deployer, receiver } = await loadFixture(transferFromTokenFixture)
                expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))
                expect(await token.balanceOf(receiver.address)).to.equal(AMOUNT)
             })
             it("resets the allowance", async() =>{
                const { token, deployer, exchange } = await loadFixture(transferFromTokenFixture)
                expect(await token.allowance(deployer.address, exchange.address)).to.equal(tokens(0))                
             })
             it("emits transfer event", async() =>{
                const { token, deployer, receiver, transaction } = await loadFixture(transferFromTokenFixture)   
                await expect(transaction).to.emit(token, "Transfer")
                        .withArgs(deployer.address, receiver.address, AMOUNT)                
            })
        })
                        
        describe("Failiure", ()=>{
            it("rejects insufficient amounts", async() =>{

                const { token, deployer, receiver, exchange } = await loadFixture(transferFromTokenFixture)   
                
                const INVALID_AMOUNT = tokens(100000000) // 100 Million tokens
                const ERROR = "Token: Insufficient Funds"
                
               // await (await token.connect(deployer).approve(exchange.address, INVALID_AMOUNT)).wait()
                await expect(token.connect(exchange).transferFrom(deployer.address, receiver.address, INVALID_AMOUNT))
                .to.be.revertedWith(ERROR)
                
            })
            it("Rejects insufficient allowance", async() =>{

                const { token, deployer, receiver, exchange } = await loadFixture(deployTokenFixture)   
                
                const ALLOWANCE_AMOUNT = tokens(100)
                const EXCEEDED_AMOUNT = tokens(101) 
                const ERROR = "Token: Exceeded Allowance"
                
                await (await token.connect(deployer).approve(exchange.address, ALLOWANCE_AMOUNT)).wait()
                await expect(token.connect(exchange).transferFrom(deployer.address, receiver.address, EXCEEDED_AMOUNT))
                .to.be.revertedWith(ERROR)
                
            })
        })
    })


})