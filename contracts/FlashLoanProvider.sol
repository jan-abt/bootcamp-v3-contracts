// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Token} from "./Token.sol";


// Is not supposed to be a stand-alone contract, to be deployed on the  blockchain
// Abstract = non-deployable
abstract contract FlashLoanProvider {

    event FlashLoan(address token, uint256 amount, uint256 timestamp);

    function flashLoan(address _token, uint256 _amount, bytes memory _data) public {
        // Send the money
        Token(_token).transfer(msg.sender, _amount);

        // Ask for the money back

        // Ensure that money was paid back

        // Emit an Event
        emit FlashLoan(_token,  _amount, block.timestamp);
    }

}