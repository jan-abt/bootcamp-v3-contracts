// SPDX-License-Identifier: UNLICENSED

// contracts/FlashLoanUser.sol
pragma solidity ^0.8.28;

interface IERC20 {
    function transfer(address, uint256) external returns (bool);
    function approve(address, uint256) external returns (bool);
    function balanceOf(address) external view returns (uint256);
    function allowance(address, address) external view returns (uint256);
}

contract FlashLoanUser {
    address public immutable exchange;
    event FlashLoanReceived(address token, uint256 amount);

    error NotExchange();
    error TransferFailed();
    error InsufficientBalance();
    error InsufficientAllowance();

    constructor(address _exchange) {
        if (_exchange == address(0)) revert NotExchange();
        exchange = _exchange;
    }

    modifier onlyExchange() {
        if (msg.sender != exchange) revert NotExchange();
        _;
    }

    function getFlashLoan(address _token, uint256 _amount) external {
        (bool success, ) = exchange.call(
            abi.encodeWithSignature(
                "flashLoan(address,uint256,bytes)",
                _token,
                _amount,
                abi.encodePacked(this.receiveFlashLoan.selector)
            )
        );
        if (!success) revert TransferFailed();
    }

    function approveToken(
        address _token,
        address _spender,
        uint256 _amount
    ) external {
        // Add access control if needed, e.g., onlyOwner
        IERC20(_token).approve(_spender, _amount);
    }

    function receiveFlashLoan(
        address _token,
        uint256 _amount,
        bytes calldata
    ) external onlyExchange {
        emit FlashLoanReceived(_token, _amount);
        uint256 fee = (_amount * 9) / 10000; // 0.09%
        uint256 total = _amount + fee;
        IERC20 token = IERC20(_token);
        if (token.balanceOf(address(this)) < total)
            revert InsufficientBalance();
        if (token.allowance(address(this), exchange) < total)
            revert InsufficientAllowance();
        bool success = token.transfer(exchange, total);
        if (!success) revert TransferFailed();
    }

}
