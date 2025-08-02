#!/bin/bash
set -e

ENV=${1:-dev}

printf "\n  Running seed script for $ENV.\n\n"

# Check account balances
printf "\Displaying initial account balances on $ENV network\n\n"

if [ "$ENV" = "dev" ]; then
  npx hardhat accounts  --network localhost
  printf "\n"
  npx hardhat run scripts/seed.js --network localhost
elif [ "$ENV" = "prod" ]; then
  npx hardhat accounts --network sepolia
  printf "\n"
  npx hardhat run scripts/seed.js --network sepolia
else
  printf "\n⚠️ Invalid environment: $ENV. Use 'dev' or 'prod'.\n"
  exit 1
fi
printf "\n👍 Seeding script completed for $ENV environment.\n\n"