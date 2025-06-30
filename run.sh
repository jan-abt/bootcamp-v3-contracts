#!/bin/bash

# Exit script if any command fails
set -e

# set -x  # print each command before executing (for debugging)

# kill any process using port 8545
kill_port_8545() {
  PID=$(lsof -ti tcp:8545)
  if [ -n "$PID" ]; then
    echo "🔓  Port 8545 is in use by PID $PID. Killing it..."
    echo "    (or discover PID manually via lsof -wni tcp:8545)"
    if kill -9 "$PID"; then
      echo "💀 Process $PID has been killed."
    else
      echo "⚠️  Failed to kill PID $PID. Continuing anyway..."
    fi
  else
    echo "Port 8545 is 🆓."
  fi
}

# Check and/or kill process using port 8545
kill_port_8545

printf "\nStarting Hardhat node..."
npx hardhat node > node.log 2>&1 &
echo "Started Hardhat node with PID $!"

printf "\n⏳ Wait for 5 seconds...\n\n"
sleep 5

npx hardhat ignition deploy ignition/modules/Token.js --network localhost

npx hardhat ignition deploy ignition/modules/Exchange.js --network localhost

npx hardhat ignition deploy ignition/modules/FlashLoanUser.js --network localhost

printf "\n⏳ Wait for 5 seconds..."
sleep 5

printf "\n  Running seed script...\n\n"
npx hardhat run scripts/seed.js --network localhost

printf "\n👍 All steps completed successfully.\n"
