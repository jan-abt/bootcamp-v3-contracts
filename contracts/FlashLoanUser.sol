// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Token} from "./Token.sol";
import {Exchange} from "./Exchange.sol";
import {IFlashLoanReceiver} from "./FlashLoanProvider.sol";

contract FlashLoanUser is IFlashLoanReceiver{

    address exchange;
    event FlashLoanReceived(address token, uint256 amount);

    constructor(address _exchange){
        exchange = _exchange;
    }

    function getFlashLoan(address _token, uint256 _amount) external{
        // Call the exchange for the flash loan
        Exchange(exchange).flashLoan(_token, _amount, "");

    }

    function receiveFlashLoan(
        address _token,
        uint256 _amount, 
        bytes memory /* _data*/
    ) external {

        require(msg.sender == exchange, "FlashLoanUser: Not Exchange contract");

        // Do something with our loan
        emit FlashLoanReceived(_token, Token(_token).balanceOf(address(this)));

        // Pay back the loan       
        require(
            // typecast: interprets the token address as a token contract instance
            Token(_token).transfer(exchange, _amount),
            "FlashLoanUser: Transfer failed"
        );

    }

}