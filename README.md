# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```


##### House Keeping
Store api keys, private keys, etc., in config variables to be used in hardhat configuration files<br>
* `npx hardhat vars set MY_KEY`

Variables are stored under <br>
* `~/Library/Preferences/hardhat-nodejs/vars.json`

List Key names <br>
* `npx hardhat vars list`

For more, see [hardhat-tutorial](https://hardhat.org/tutorial/deploying-to-a-live-network)


