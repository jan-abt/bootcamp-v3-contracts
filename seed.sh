#!/bin/bash

########################################
#  * Seed data
########################################


# Exit script if any command fails
set -e

# set -x  # print each command before executing (for debugging)

printf "\n  Running seed script...\n\n"
npx hardhat run scripts/seed.js --network localhost

printf "\n👍 Seed script ran successfully.\n"
