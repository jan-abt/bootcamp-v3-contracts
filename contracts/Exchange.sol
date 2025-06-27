// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Token} from "./Token.sol";

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
    // state variables
    address public  feeAccount;
    uint256 public feePercent;

    // total tokens belonging to a user
    // token address     
    mapping( address => 
        // user address
        mapping(address => uint256)) 
            private userTotalTokenBalance;

    event TokensDeposited(
        address token, 
        address user, 
        uint256 amount, 
        uint256 balance
    );
    event TokensWithdrawn(
        address token, 
        address user, 
        uint256 amount, 
        uint256 balance
    );

    constructor( address _feeAccount, uint256 _feePercent ){
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    // --------------
    // DEPOSIT & WITHDRWA TOKENS

    function depositToken(address _token, uint256 _amount) public{
        
        // take token out of user's wallet
        require(
            Token (_token).transferFrom(msg.sender, address(this), _amount),
            "Exchange Token transfer failed"
        );

        //  update user's balance
        userTotalTokenBalance[_token][msg.sender] += _amount;

        //  emit event
        emit TokensDeposited(
            _token, 
            msg.sender, 
            _amount, 
            userTotalTokenBalance[_token][msg.sender]
        );
    }

    function totalBalanceOf(
        address _token, 
        address _user) public view returns (uint256){
            return userTotalTokenBalance[_token][_user];

    }

    function withdrawToken(address _token, uint256 _amount) public {

        require(totalBalanceOf(_token, msg.sender) >= _amount, "Exchange: Insufficient balance");
        // update user balance
        userTotalTokenBalance[_token][msg.sender] -= _amount;

        // emit the event
        emit TokensWithdrawn(
            _token,
            msg.sender, 
            _amount, 
            userTotalTokenBalance[_token][msg.sender]
        );

        // transfer tokens back to user
        require(Token(_token).transfer(msg.sender, _amount), "Exchange: Token transfer failed") ;

    }

}