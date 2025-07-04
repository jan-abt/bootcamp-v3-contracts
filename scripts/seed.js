const hre = require("hardhat")

const tokens = (n) => {
    return ethers.parseUnits(n.toString(), 18)
}

function wait(seconds){
    const milliseconds = seconds * 1000
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function main() {

    const DAPP_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    const mUSDC_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
    const mLINK_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
    const EXCHANGE_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
    const FLASH_LOAN_USER_ADDRESS = "0x663F3ad617193148711d28f5334eE4Ed07016602"

    // Fetch contracts into memory so javascript can transact with them
    const dapp = await hre.ethers.getContractAt("Token", DAPP_ADDRESS)
    console.log(`          Token contract fetched: ${await dapp.getAddress()}`)

    const mUSDC = await hre.ethers.getContractAt("Token", mUSDC_ADDRESS)
    console.log(`          Token contract fetched: ${await mUSDC.getAddress()}`)

    const mLINK = await hre.ethers.getContractAt("Token", mLINK_ADDRESS)
    console.log(`          Token contract fetched: ${await mLINK.getAddress()}`)

    const exchange = await hre.ethers.getContractAt("Exchange", EXCHANGE_ADDRESS)
    console.log(`       Exchange contract fetched: ${await exchange.getAddress()}`)

    const flashLoanUser = await hre.ethers.getContractAt("FlashLoanUser", FLASH_LOAN_USER_ADDRESS)
    console.log(`Flash loan user contract fetched: ${await flashLoanUser.getAddress()}\n`)

    // Load up accounts from wallet - these are unlocked
    const accounts = await hre.ethers.getSigners()

    // This is the main account who deploys
    const deployer = accounts[0] 

    // This is who collects fees from the exchange
    const collector = accounts[1]
    
    // These represent regular users
    const user1 = accounts[2]
    const user2 = accounts[3]


    // Distribute tokens to users
    const AMOUNT = 100000
    let transation

    // Deployer gets the entire balance, will transfer to other people

    // Deployer transfers 100,000 DAPP to user1
    transaction = await dapp.connect(deployer).transfer(user1.address, tokens(AMOUNT))
    await transaction.wait()
    console.log(`Transferred ${AMOUNT} tokens from ${deployer.address} to ${user1.address}`)
    
    // Deployer transfers 100,000 mUSDC to user2
    transaction = await mUSDC.connect(deployer).transfer(user2.address, tokens(AMOUNT))
    await transaction.wait()
    console.log(`Transferred ${AMOUNT} tokens from ${deployer.address} to ${user2.address}`)
    
    // Users deposit their tokens into the exchange
    // user1 approves 100,000 DAPP to be deposited in the exchange
    transaction = await dapp.connect(user1).approve(await exchange.getAddress(), tokens(AMOUNT))
    await transaction.wait()
    console.log(`\nApproved ${AMOUNT} DAPP from ${user1.address}`)
    
    // user1 deposits 100,000 DAPP in the exchange
    transaction = await exchange.connect(user1).depositToken(DAPP_ADDRESS, tokens(AMOUNT))
    await transaction.wait()
    console.log(`Deposited ${AMOUNT} DAPP from ${user1.address}`)
    
    // user2 approves 100,000 mUSDC to be deposited in the exchange
    transaction = await mUSDC.connect(user2).approve(await exchange.getAddress(), tokens(AMOUNT))
    await transaction.wait()
    console.log(`\nApproved ${AMOUNT} mUSDC from ${user2.address}`)
    
    // user2 deposits 100,000 mUSDC in the exchange
    transaction = await exchange.connect(user2).depositToken(mUSDC_ADDRESS, tokens(AMOUNT))
    await transaction.wait()
    console.log(`Deposited ${AMOUNT} mUSDC from ${user2.address}\n`)

    // Seed a cancelled order
    // user1 makes an order to get 1 token
    let orderId
    transaction = await exchange.connect(user1).makeOrder(mUSDC_ADDRESS, tokens(1), DAPP_ADDRESS, tokens(1))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}`)

    // Get order id from the event logs
    orderId = result.logs[0].args.id
    
    // user1 cancels his order
    transaction = await exchange.connect(user1).cancelOrder(orderId)
    result = await transaction.wait()
    console.log(`Cancelled order from ${user1.address}\n`)

    // wait 1 second
    await wait(1)
    
    // Fill some orders
    for(let i = 1; i <=3; i++){

        // user1 makes an order to get tokens
        transaction = await exchange.connect(user1).makeOrder(mUSDC_ADDRESS, tokens(10), DAPP_ADDRESS, tokens(10 *i))
        result = await transaction.wait()
        console.log(`Made order from ${user1.address}`)

        // Get order id from the event logs
        orderId = result.logs[0].args.id
        
        // user2 fills order
        transaction = await exchange.connect(user2).fillOrder(orderId)
        result = await transaction.wait()
        console.log(`Filled order from ${user2.address}\n`)

        // wait 1 second
        await wait(1)
    }
    
    //user1 makes 5 orders, selling DAPP for mUSDC
    for(let i = 1; i <=5; i++){

        transaction = await exchange.connect(user1).makeOrder(mUSDC_ADDRESS, tokens(10*i), DAPP_ADDRESS, tokens(10))
        result = await transaction.wait()
        console.log(`Made order from ${user1.address}`)

        // wait 1 second
        await wait(1)
    }

    console.log(``)


    //user2 makes 5 orders, buying DAPP for mUSDC
    for(let i = 1; i <=5; i++){

        transaction = await exchange.connect(user2).makeOrder(DAPP_ADDRESS, tokens(10), mUSDC_ADDRESS, tokens(10*i))
        result = await transaction.wait()
        console.log(`Made order from ${user2.address}`)

        // wait 1 second
        await wait(1)
    }

    console.log(``)

    // Perform some flash loans
    for(let i = 1; i <3; i++){

        transaction = await flashLoanUser.connect(user1).getFlashLoan(DAPP_ADDRESS, tokens(1000))
        result = await transaction.wait()
        console.log(`Flash loan executed from ${user1.address}`)

        // wait 1 second
        await wait(1)
    }


}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})