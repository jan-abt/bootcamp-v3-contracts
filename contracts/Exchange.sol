// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

// TODO: On the Exchange 
// 1. Depoist Tokens 
// 2. Withdraw Tokens
// 3. Check Balances
// 4. Make Orders
// 5. Cancel Orders
// 6. Fill Orders
// 7. Charge Fees
// 8. Track Fee Accounts ☑️

contract Exchange {
    address public  feeAccount;
    uint256 public feePercent;

    constructor( address _feeAccount, uint256 _feePercent ){
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

}