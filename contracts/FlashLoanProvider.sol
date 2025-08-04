// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Token} from "./Token.sol";

interface IFlashLoanReceiver {
    function receiveFlashLoan(
        address token,
        uint256 amount,
        bytes memory data
    ) external;
}

// Is not supposed to be a stand-alone contract, to be deployed on the  blockchain
// Abstract = non-deployable
abstract contract FlashLoanProvider {
    event FlashLoan(address token, uint256 amount, uint256 timestamp);

    function flashLoan(
        address _token,
        uint256 _amount,
        bytes memory _data
    ) public {
        // Get current token balance
        uint256 tokenBalanceBefore = Token(_token).balanceOf(address(this));

        require(
            tokenBalanceBefore >= _amount,
            "FlashLoanProvider: Insufficient funds to loan"
        );
        // Send funds to msg.sender
        require(
            // typecast: interprets the token address as a token contract instance
            Token(_token).transfer(msg.sender, _amount),
            "FlashLoanProvider: Transfer failed"
        );

        // Ask for the money back
        IFlashLoanReceiver(msg.sender).receiveFlashLoan(_token, _amount, _data);

        // Get token balance after
        uint256 tokenBalanceAfter = Token(_token).balanceOf(address(this));

        // Require this contract to have received back the funds
        require(
            tokenBalanceAfter >= tokenBalanceBefore,
            "FlashLoanProvider: Funds not received"
        );

        // Emit an Event
        emit FlashLoan(_token, _amount, block.timestamp);
    }
}
