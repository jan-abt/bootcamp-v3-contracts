#!/bin/bash

########################################
#  * Run Hardhat Test framework
########################################

# Exit script if any command fails
set -e

# set -x  # print each command before executing (for debugging)

printf "\nRunning Tests .."

npx hardhat test test/Token.js

npx hardhat test test/Exchange.js

npx hardhat test test/FlashLoanProvider.js





