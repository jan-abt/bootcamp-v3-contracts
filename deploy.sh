#!/bin/bash
# deploy.sh
set -e
ENV=${1:-dev}
printf "\nDeployment environment: $ENV\n"

if [ "$ENV" = "dev" ]; then
    printf "\nStarting Hardhat node..."
    PID=$(lsof -ti tcp:8545 || true)
    if [ -n "$PID" ]; then
        printf "\n🔓  Port 8545 is in use by PID $PID."
        printf "\n Killing it ..."
        kill -9 "$PID" && printf "\n 💀 Process $PID has been killed.\n" || printf "\n⚠️  Failed to kill PID $PID.\n"
    fi
    npx hardhat node > node.log 2>&1 &
    printf "\nStarted Hardhat node with PID $!\n"
    printf "\n⏳ Waiting for 5 seconds...\n\n"
    sleep 5
  # npx hardhat ignition deploy ./ignition/modules/MainModule.js --network localhost | tee deploy.log
    npx hardhat ignition deploy ./ignition/modules/TokenModule.js --network localhost | tee deploy.log
    npx hardhat ignition deploy ./ignition/modules/ExchangeModule.js --network localhost | tee -a deploy.log
    npx hardhat ignition deploy ./ignition/modules/FlashLoanUserModule.js --network localhost | tee -a deploy.log
elif [ "$ENV" = "prod" ]; then
  # npx hardhat ignition deploy ./ignition/modules/MainModule.js --network sepolia | tee deploy.log
    npx hardhat ignition deploy ./ignition/modules/TokenModule.js --network sepolia | tee deploy.log
    npx hardhat ignition deploy ./ignition/modules/ExchangeModule.js --network sepolia | tee -a deploy.log
    npx hardhat ignition deploy ./ignition/modules/FlashLoanUserModule.js --network sepolia | tee -a deploy.log
else
    printf "\n⚠️  Invalid environment: $ENV. Use 'dev' or 'prod'.\n"
    exit 1
fi
printf "\n👍 Deployment completed for $ENV environment.\n\n"