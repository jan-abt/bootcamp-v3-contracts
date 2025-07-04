#!/bin/bash

########################################
#  * Start Hardhat (in-memory blockchain) 
#  * Deploy Contracts
########################################


# Exit script if any command fails
set -e

# set -x  # print each command before executing (for debugging)

printf "\nStarting Hardhat node..."

# Check and/or kill process using port 8545
# get PID using port 8545 (don't fail if empty)
PID=$(lsof -ti tcp:8545 || true)
if [ -n "$PID" ]; then
  printf "\n🔓  Port 8545 is in use by PID $PID."
  printf "\n    (Find PID manually via lsof -wni tcp:8545)"
  printf "\n Killing it ..."
  if kill -9 "$PID"; then
    printf "\n 💀 Process $PID has been killed.\n"
  else
    printf "\n⚠️  Failed to kill PID $PID. Continuing anyway..."
  fi
fi

npx hardhat node > node.log 2>&1 &
printf "\nStarted Hardhat node with PID $!\n"

printf "\n⏳ Waiting for 5 seconds...\n\n"
sleep 5

npx hardhat ignition deploy ignition/modules/Token.js --network localhost

npx hardhat ignition deploy ignition/modules/Exchange.js --network localhost

npx hardhat ignition deploy ignition/modules/FlashLoanUser.js --network localhost

printf "\n👍 Run script completed successfully.\n"

