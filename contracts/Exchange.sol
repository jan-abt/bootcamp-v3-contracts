// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import {Token} from "./Token.sol";
import {FlashLoanProvider} from "./FlashLoanProvider.sol";

contract Exchange is FlashLoanProvider {
    // state variables
    address public feeAccount;
    uint256 public feePercent;
    uint256 public orderCount;

    // Mappings
    mapping(uint256 => Order) public orders;
    mapping(uint256 => bool) public isOrderCancelled;
    mapping(uint256 => bool) public isOrderFilled;

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

    event OrderCancelled(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );

    event OrderFilled(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        address creator,
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
    // DEPOSIT & WITHDRAW TOKENS

    function depositToken(address _token, uint256 _amount) public {
        
         // Interact with an existing Token contract at address _token
        require(
            // Token(_token): treats the address _token as a contract of type Token. 
            //                This allows us to call functions on it.
            // msg.sender: refers to the user who called this function, depositToken
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

    function totalBalanceOf( address _token, address _user) public view returns (uint256) {
        return userTotalTokenBalance[_token][_user];
    }

    function activeBalanceOf( address _token, address _user ) public view returns (uint256) {
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

    function makeOrder( address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive ) public {
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

    function cancelOrder(uint256 _orderId) public {

        // Fetch the order
        Order storage order = orders[_orderId];

        // Order must exist
        require(order.id == _orderId, "Exchange: Order does not exist");

        // Ensure that the caller of the function is the owner of the order
        require(address(order.user) == msg.sender, "Exchange: Not the owner");

        // Cancel the order
        isOrderCancelled[_orderId] = true;

        // Update the user's active balance
        userActiveTokenBalance[order.tokenGive][order.user] -= order.amountGive;

         // Emit the event
        emit OrderCancelled(
            order.id,
            msg.sender,
            order.tokenGet,
            order.amountGet,
            order.tokenGive,
            order.amountGive,
            block.timestamp
        );


    }

    // ---------------------
    // EXECUTING ORDERS

    function fillOrder(uint256 _orderId) public {

        //  Order must exist
        require(_orderId > 0  && _orderId <= orderCount, "Exchange: Order does not exist");
        
        // Order can not be filled
        require(!isOrderFilled[_orderId], "Exchange: Order has already been filled");
        
        // Order can not be cancelled
        require(!isOrderCancelled[_orderId], "Exchange: Order has been cancelled");

        // Fetch order
        Order storage order = orders[_orderId];

        // Prevent filling if msg.sender already has their token listed
        require(
            totalBalanceOf(order.tokenGet, msg.sender) >=
                activeBalanceOf(order.tokenGet, msg.sender) + order.amountGet, 
            "Exchange: Insufficient balance"
        );

        // Execute the trade
        _trade(
            order.id,
            order.user,
            order.tokenGet,
            order.amountGet,
            order.tokenGive,
            order.amountGive
        );

    }

    function _trade( uint256 _orderId, address _user, address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive ) internal {

        // Fee is paid by the user who filled the order (msg.sender)
        // Fee is deducted from _amountGet 
        uint256 _feeAmount = (_amountGet * feePercent) / 100;

        // Let the user who created the oder get their tokens
        userTotalTokenBalance[_tokenGet][msg.sender] -= _amountGet + _feeAmount;
        userTotalTokenBalance[_tokenGet][_user] += _amountGet;

        // Charge fees
        userTotalTokenBalance[_tokenGet][feeAccount] += _feeAmount;

        // Give the requested token to msg.sender and minus token balance from
        // the user who created the order
        userTotalTokenBalance[_tokenGive][_user] -= _amountGive;
        userTotalTokenBalance[_tokenGive][msg.sender] += _amountGive;


        // Update user's active token balance
        userActiveTokenBalance[_tokenGive][_user] -= _amountGive;


        // Emit Trade event
        emit OrderFilled(
            _orderId,
            msg.sender, // user who is filling the order
            _tokenGet,
            _amountGet,
            _tokenGive,
            _amountGive,
            _user, // iser who created the order
            block.timestamp
        );

        // Mark order as filled
        isOrderFilled[_orderId] = true;
    }


}
