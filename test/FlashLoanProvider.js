const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FlashLoanProvider", function () {
    let token, exchange, flashLoanUser, deployer, lender;
    let loanAmount = ethers.parseUnits("1", 18); // 1 token
    let feeAmount = ethers.parseUnits("0.001", 18); // Slightly more than 0.09% fee

    beforeEach(async function () {
        [deployer, lender] = await ethers.getSigners();
        const Token = await ethers.getContractFactory("Token");
        token = await Token.deploy("Test Token", "TEST", 1000000);
        const Exchange = await ethers.getContractFactory("Exchange");
        exchange = await Exchange.deploy(deployer.address, 10);
        const FlashLoanUser = await ethers.getContractFactory("FlashLoanUser");
        flashLoanUser = await FlashLoanUser.deploy(exchange.target);

        // Provide liquidity: Transfer and deposit to exchange
        await token.transfer(lender.address, ethers.parseUnits("100", 18));
        await token.connect(lender).approve(exchange.target, ethers.parseUnits("100", 18));
        await exchange.connect(lender).depositToken(token.target, ethers.parseUnits("100", 18));

        // Provide fee tokens to FlashLoanUser
        await token.transfer(flashLoanUser.target, feeAmount);
        // If keeping approveToken (optional after fix #1): await flashLoanUser.approveToken(token.target, exchange.target, feeAmount);
    });

    it("Emits FlashLoanReceived event", async function () {
        await expect(flashLoanUser.getFlashLoan(token.target, loanAmount))
            .to.emit(flashLoanUser, "FlashLoanReceived")
            .withArgs(token.target, loanAmount);
    });
    it("Emits FlashLoan event", async function () {
        // Do NOT fetch timestamp here; it would be too early

        // Send the transaction without awaiting in expect
        const tx = await flashLoanUser.getFlashLoan(token.target, loanAmount);

        // Wait for receipt to get block details
        const receipt = await tx.wait();

        // Fetch the exact block where the event was emitted
        const block = await ethers.provider.getBlock(receipt.blockNumber);

        // Now assert the event with the correct timestamp
        await expect(tx)
            .to.emit(exchange, "FlashLoan")
            .withArgs(token.target, loanAmount, block.timestamp);
    });

});