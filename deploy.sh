#!/bin/bash
set -e

ENV=${1:-localhost}

printf "\nDeployment environment: $ENV\n"

if [ "$ENV" = "localhost" ]; then
  printf "\nStarting Hardhat node..."
  PID=$(lsof -ti tcp:8545 || true)
  if [ -n "$PID" ]; then
    printf "\n🔓 Port 8545 is in use by PID $PID."
    printf "\n Killing it ..."
    if kill -9 "$PID"; then
      printf "\n 💀 Process $PID has been killed.\n"
    else
      printf "\n⚠️ Failed to kill PID $PID. Continuing anyway..."
    fi
  fi
  npx hardhat node > node.log 2>&1 &
  printf "\nStarted Hardhat node with PID $!\n"
  printf "\n⏳ Waiting for 5 seconds...\n\n"
  sleep 5
  npx hardhat ignition deploy ./ignition/modules/MainModule.js --network localhost
elif [ "$ENV" = "sepolia" ]; then
  npx hardhat ignition deploy ./ignition/modules/MainModule.js --network sepolia --reset
else
  printf "\n⚠️ Invalid environment: $ENV. Use 'localhost' or 'sepolia'.\n"
  exit 1
fi

printf "\n👍 Deployment completed for $ENV environment.\n\n"