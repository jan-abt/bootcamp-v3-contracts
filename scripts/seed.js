const fs = require('fs').promises;
const hre = require("hardhat");

const ethers = hre.ethers;

// Helper to convert to wei (18 decimals for ERC-20 tokens)
const tokens = (n) => {
  return ethers.parseUnits(n.toString(), 18);
};

// Async delay for pacing transactions (longer on Sepolia)
function wait(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

// Safe transaction execution with revert reason logging
async function safeExecute(description, txPromise, iface) {
  try {
    const tx = await txPromise;
    const receipt = await tx.wait();
    console.log(`${description} succeeded (tx: ${tx.hash})`);
    return receipt;
  } catch (error) {
    console.error(`${description} failed:`, error);
    if (error.reason) console.log("Revert reason:", error.reason);
    let revertData = error.data;
    if (error.data && error.data.data) revertData = error.data.data; // Nested in ProviderError
    if (revertData && iface) {
      console.log("Revert data:", revertData);
      try {
        const decoded = iface.parseError(revertData);
        console.log("Decoded error:", decoded.name, decoded.args);
      } catch (decodeError) {
        console.error("Could not decode error:", decodeError);
      }
    }
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
}

async function main() {
  // Determine chain ID and network
  const chainId = hre.network.config.chainId || (hre.network.name === "sepolia" ? 11155111 : hre.network.name === "localhost" ? 31337 : hre.network.name);
  console.log("Network ID:", chainId, "Network Name:", hre.network.name);

  // Define delay early
  const delay = chainId === 11155111 ? 15 : 1;

  // Load deployed addresses
  const chainFolder = `chain-${chainId}`;
  console.log("Using chainFolder:", chainFolder);
  let addresses;
  try {
    addresses = JSON.parse(await fs.readFile(`./ignition/deployments/${chainFolder}/deployed_addresses.json`, 'utf8'));
  } catch (error) {
    console.error("Failed to read deployed_addresses.json:", error);
    process.exit(1);
  }

  // Contract addresses
  const DAPP_ADDRESS = addresses["TokenModule#DAPP"];
  const mUSDC_ADDRESS = addresses["TokenModule#mUSDC"];
  const mLINK_ADDRESS = addresses["TokenModule#mLINK"];
  const EXCHANGE_ADDRESS = addresses["ExchangeModule#Exchange"];
  const FLASH_LOAN_USER_ADDRESS = addresses["FlashLoanUserModule#FlashLoanUser"];

  // Load ABIs explicitly
  let TokenABI, ExchangeABI, FlashLoanUserABI;
  try {
    TokenABI = require("../artifacts/contracts/Token.sol/Token.json").abi;
    ExchangeABI = require("../artifacts/contracts/Exchange.sol/Exchange.json").abi;
    FlashLoanUserABI = require("../artifacts/contracts/FlashLoanUser.sol/FlashLoanUser.json").abi;
  } catch (error) {
    console.error("Failed to load ABIs. Run 'npx hardhat clean && npx hardhat compile':", error);
    process.exit(1);
  }

  // Validate ABIs
  if (!TokenABI.length || !ExchangeABI.length || !FlashLoanUserABI.length) {
    console.error("One or more ABIs are empty. Recompile contracts.");
    process.exit(1);
  }
  if (!FlashLoanUserABI.find(f => f.name === "getFlashLoan")) {
    console.error("getFlashLoan not found in FlashLoanUser ABI. Check FlashLoanUser.sol.");
    process.exit(1);
  }

  // Error interface for decoding reverts
  const errorIface = new ethers.Interface([
    "error NotExchange()",
    "error TransferFailed()",
    "error InsufficientBalance()",
    "error InsufficientAllowance()",
    // Common ERC-20 errors
    "error InsufficientBalance(address sender, uint256 balance, uint256 needed)",
    "error InsufficientAllowance(address sender, uint256 allowance, uint256 needed)"
  ]);

  // Load accounts early
  const accounts = await ethers.getSigners();
  const deployer = accounts[0];
  const collector = accounts[1];
  const user1 = accounts[2];
  const user2 = accounts[3];

  // Instantiate contracts with deployer as signer (for sending transactions)
  const dapp = new ethers.Contract(DAPP_ADDRESS, TokenABI, deployer);
  console.log(`Token contract fetched: ${await dapp.getAddress()}`);

  const mUSDC = new ethers.Contract(mUSDC_ADDRESS, TokenABI, deployer);
  console.log(`Token contract fetched: ${await mUSDC.getAddress()}`);

  const mLINK = new ethers.Contract(mLINK_ADDRESS, TokenABI, deployer);
  console.log(`Token contract fetched: ${await mLINK.getAddress()}`);

  const exchange = new ethers.Contract(EXCHANGE_ADDRESS, ExchangeABI, deployer);
  console.log(`Exchange contract fetched: ${await exchange.getAddress()}`);

  const flashLoanUser = new ethers.Contract(FLASH_LOAN_USER_ADDRESS, FlashLoanUserABI, deployer);
  console.log(`Flash loan user contract fetched: ${await flashLoanUser.getAddress()}\n`);

  // Debug contract instance
  console.log("Ethers version:", ethers.version);
  const functionNames = [];
  flashLoanUser.interface.forEachFunction((func) => functionNames.push(func.format()));
  console.log("FlashLoanUser ABI functions:", functionNames);
  console.log("Interface properties:", Object.keys(flashLoanUser.interface));
  console.log("Contract instance properties:", Object.keys(flashLoanUser));

  // Verify bytecode
  const code = await ethers.provider.getCode(FLASH_LOAN_USER_ADDRESS);
  if (code === "0x") {
    console.error(`No contract deployed at ${FLASH_LOAN_USER_ADDRESS}. Redeploy.`);
    process.exit(1);
  }
  console.log("Bytecode present at FlashLoanUser address.");

  // Validate exchange address
  let exchangeAddr;
  try {
    exchangeAddr = await flashLoanUser.exchange();
    console.log("Exchange address from contract:", exchangeAddr);
  } catch (e) {
    console.warn("Failed to fetch exchange address; trying exchange():", e.message);
    try {
      exchangeAddr = await flashLoanUser.exchange();
      console.log("Exchange address from getExchange:", exchangeAddr);
    } catch (e2) {
      console.warn("getExchange failed; using EXCHANGE_ADDRESS:", EXCHANGE_ADDRESS);
      exchangeAddr = EXCHANGE_ADDRESS;
    }
  }
  if (exchangeAddr.toLowerCase() !== EXCHANGE_ADDRESS.toLowerCase()) {
    console.warn(`Exchange address mismatch. Expected: ${EXCHANGE_ADDRESS}, Got: ${exchangeAddr}. Continuing with fallback.`);
  }

  // Check ETH balances on Sepolia
  const minEth = ethers.parseEther("0.01");
  if (chainId === 11155111) {
    const user1Balance = await ethers.provider.getBalance(user1.address);
    if (user1Balance < minEth) {
      console.error(`User1 ETH balance too low: ${ethers.formatEther(user1Balance)} ETH. Fund account.`);
      process.exit(1);
    }
    console.log(`User1 ETH balance: ${ethers.formatEther(user1Balance)} ETH`);
    console.log(`Deployer ETH balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`);
  }

  // Pre-check token balances
  const deployerDappBalance = await dapp.balanceOf(deployer.address);
  const user1DappBalance = await dapp.balanceOf(user1.address);
  const user2MusdcBalance = await mUSDC.balanceOf(user2.address);
  const exchangeDappBalance = await dapp.balanceOf(EXCHANGE_ADDRESS);
  console.log("Deployer DAPP balance:", ethers.formatUnits(deployerDappBalance, 18));
  console.log("User1 DAPP balance:", ethers.formatUnits(user1DappBalance, 18));
  console.log("User2 mUSDC balance:", ethers.formatUnits(user2MusdcBalance, 18));
  console.log("Exchange DAPP balance:", ethers.formatUnits(exchangeDappBalance, 18));

  // Validate sufficient balance for transfers
  const AMOUNT = 100000;
  if (deployerDappBalance < tokens(AMOUNT)) {
    console.error(`Deployer DAPP balance too low: ${ethers.formatUnits(deployerDappBalance, 18)} < ${AMOUNT}`);
    process.exit(1);
  }
  if (await mUSDC.balanceOf(deployer.address) < tokens(AMOUNT)) {
    console.error(`Deployer mUSDC balance too low: ${ethers.formatUnits(await mUSDC.balanceOf(deployer.address), 18)} < ${AMOUNT}`);
    process.exit(1);
  }

  // Distribute tokens
  await safeExecute(`Transfer ${AMOUNT} DAPP to ${user1.address}`, dapp.transfer(user1.address, tokens(AMOUNT)), errorIface);
  await safeExecute(`Transfer ${AMOUNT} mUSDC to ${user2.address}`, mUSDC.transfer(user2.address, tokens(AMOUNT)), errorIface);

  // Approvals and deposits
  await safeExecute(`Approve ${AMOUNT} DAPP for exchange from ${user1.address}`, dapp.connect(user1).approve(EXCHANGE_ADDRESS, tokens(AMOUNT)), errorIface);
  await safeExecute(`Deposit ${AMOUNT} DAPP from ${user1.address}`, exchange.connect(user1).depositToken(DAPP_ADDRESS, tokens(AMOUNT)), errorIface);
  await safeExecute(`Approve ${AMOUNT} mUSDC for exchange from ${user2.address}`, mUSDC.connect(user2).approve(EXCHANGE_ADDRESS, tokens(AMOUNT)), errorIface);
  await safeExecute(`Deposit ${AMOUNT} mUSDC from ${user2.address}`, exchange.connect(user2).depositToken(mUSDC_ADDRESS, tokens(AMOUNT)), errorIface);

  // Seed a cancelled order
  let transaction = await exchange.connect(user1).makeOrder(mUSDC_ADDRESS, tokens(1), DAPP_ADDRESS, tokens(1));
  let receipt = await safeExecute("Make order for cancellation", transaction, errorIface);
  const orderCreatedLogs = receipt.logs.filter(log => exchange.interface.parseLog(log)?.name === "OrderCreated");
  if (orderCreatedLogs.length === 0) {
    console.error("No OrderCreated event found.");
    process.exit(1);
  }
  let orderId = orderCreatedLogs[0].args.id;
  console.log("Extracted orderId:", orderId);
  await safeExecute(`Cancel order ${orderId} from ${user1.address}`, exchange.connect(user1).cancelOrder(orderId), errorIface);
  await wait(delay);

  // Fill orders
  for (let i = 1; i <= 3; i++) {
    transaction = await exchange.connect(user1).makeOrder(mUSDC_ADDRESS, tokens(10), DAPP_ADDRESS, tokens(10 * i));
    receipt = await safeExecute(`Make order ${i} from ${user1.address}`, transaction, errorIface);
    orderId = receipt.logs.filter(log => exchange.interface.parseLog(log)?.name === "OrderCreated")[0].args.id;
    await safeExecute(`Fill order ${orderId} from ${user2.address}`, exchange.connect(user2).fillOrder(orderId), errorIface);
    await wait(delay);
  }

  // User1 makes 5 sell orders
  for (let i = 1; i <= 5; i++) {
    await safeExecute(`Make sell order ${i} from ${user1.address}`, exchange.connect(user1).makeOrder(mUSDC_ADDRESS, tokens(10 * i), DAPP_ADDRESS, tokens(10)), errorIface);
    await wait(delay);
  }

  // User2 makes 5 buy orders
  for (let i = 1; i <= 5; i++) {
    await safeExecute(`Make buy order ${i} from ${user2.address}`, exchange.connect(user2).makeOrder(DAPP_ADDRESS, tokens(10), mUSDC_ADDRESS, tokens(10 * i)), errorIface);
    await wait(delay);
  }

  // Pre-fund FlashLoanUser for fees (0.9% = 0.0009 DAPP for 1 DAPP loan)
  await safeExecute("Transfer 2 DAPP to FlashLoanUser for fees", dapp.transfer(FLASH_LOAN_USER_ADDRESS, tokens(2)), errorIface);
  console.log("FlashLoanUser DAPP balance:", ethers.formatUnits(await dapp.balanceOf(FLASH_LOAN_USER_ADDRESS), 18));

  
  await safeExecute("Approve Exchange to spend 2 DAPP for FlashLoanUser", flashLoanUser.approveToken(DAPP_ADDRESS, EXCHANGE_ADDRESS, tokens(2)), errorIface);
  console.log("FlashLoanUser DAPP allowance for Exchange:", ethers.formatUnits(await dapp.allowance(FLASH_LOAN_USER_ADDRESS, EXCHANGE_ADDRESS), 18));

  // Flash loans
  for (let i = 1; i < 3; i++) {
    console.log(`Attempting flash loan ${i} with ${user1.address}, token: ${DAPP_ADDRESS}, amount: ${tokens(1).toString()}`);
    console.log("Exchange DAPP balance:", ethers.formatUnits(await dapp.balanceOf(EXCHANGE_ADDRESS), 18));
    // Pre-check liquidity (loan + 0.9% fee)
    const loanAmount = tokens(1);
    const fee = loanAmount * 9n / 10000n; // 0.09%
    const total = loanAmount + fee;
    const exchangeBalance = await dapp.balanceOf(EXCHANGE_ADDRESS);
    if (exchangeBalance < total) {
      console.error(`Insufficient liquidity in Exchange: ${ethers.formatUnits(exchangeBalance, 18)} DAPP < ${ethers.formatUnits(total, 18)} DAPP`);
      process.exit(1);
    }
    console.log("Liquidity check passed.");

    // Execute with gas overrides on Sepolia
    const txOptions = chainId === 11155111 ? { gasLimit: 1000000, gasPrice: ethers.parseUnits("2", "gwei") } : {};
    await safeExecute(`Execute flash loan ${i} from ${user1.address}`, flashLoanUser.connect(user1).getFlashLoan(DAPP_ADDRESS, loanAmount, txOptions), errorIface);
    await wait(delay);
  }

  console.log("Seeding completed successfully.");
}

main().catch((error) => {
  console.error("Seeding failed:", error);
  console.error("Stack trace:", error.stack);
  process.exitCode = 1;
});