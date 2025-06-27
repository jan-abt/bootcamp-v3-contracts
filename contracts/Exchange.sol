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
    address public feeAccount;
    uint256 public feePercent;
    uint256 public orderCount;

    // Mappings
    mapping(uint256 => Order) public orders;

    // total tokens belonging to a user
    // (token address mapping -> user address mapping)
    mapping(address => mapping(address => uint256))
        private userTotalTokenBalance;

    // total tokens on an active order
    // (token address mapping -> user address mapping)
    mapping(address => mapping(address => uint256))
        private userActiveTokenBalance;

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

    event OrderCreated(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );

    struct Order {
        uint256 id; // unique identifier for an order
        address user; // user who made the order
        address tokenGet; // address of the token they receive
        uint256 amountGet; // amount they receive
        address tokenGive; // address of the token they give
        uint256 amountGive; // amount they give
        uint256 timestamp; // when the order was created
    }

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    // --------------
    // DEPOSIT & WITHDRWA TOKENS

    function depositToken(address _token, uint256 _amount) public {
        // take token out of user's wallet
        require(
            Token(_token).transferFrom(msg.sender, address(this), _amount),
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
        address _user
    ) public view returns (uint256) {
        return userTotalTokenBalance[_token][_user];
    }

    function activeBalanceOf(
        address _token,
        address _user
    ) public view returns (uint256) {
        return userActiveTokenBalance[_token][_user];
    }


    function withdrawToken(address _token, uint256 _amount) public {
        require(
            totalBalanceOf(_token, msg.sender) - activeBalanceOf(_token, msg.sender) >= _amount,
            "Exchange: Insufficient balance"
        );
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
        require(
            Token(_token).transfer(msg.sender, _amount),
            "Exchange: Token transfer failed"
        );
    }

    // ---------------------
    // MAKE & CANCEL ORDERS

    function makeOrder(
        address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive
    ) public {
        require(
            totalBalanceOf(_tokenGive, msg.sender) >=  activeBalanceOf(_tokenGive, msg.sender) + _amountGive,
            "Exchange: Insufficient balance"
        );

        orderCount++;

        // instantiate a new order
        orders[orderCount] = Order(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );

        // update user's active balance
        userActiveTokenBalance[_tokenGive][msg.sender] += _amountGive;

        // emit the event
        emit OrderCreated(
            orderCount,
            msg.sender,
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            block.timestamp
        );
    }
}
