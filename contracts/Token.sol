// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

contract Token {
    // state variables : 
    // permanently writes values to the Ether blockchain 
    string public name;
    string public symbol;
    uint8  public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    constructor(
        string memory _name, 
        string memory _symbol, 
        uint256 _totalSupply){
            name = _name;
            symbol = _symbol;
            totalSupply = _totalSupply  * (10 ** decimals); // in base units (for Ethereum tokens it is "wei")
            balanceOf[msg.sender] = totalSupply; // msg is a global variable inside Solidity, think of "this", or, "self"
    }

    function transfer(address _to, uint256 _value) public returns (bool success){

        // 0. Check sufficient funds
        require(balanceOf[msg.sender] >= _value, "Token: Insufficient Funds");
        // Someone could accidentally or maliciously do:
        // token.transfer("0x0000000000000000000000000000000000000000", 1000)
        // And the tokens would go to an irretrievable black hole — lost forever !
        require(_to != address(0), "Recipient Token is address 0");

        // 1. Deduct tokens from sender
        balanceOf[msg.sender] -= _value;
        
        // 2. Credit tokens to recipient
        balanceOf[_to] += _value;

        // 3. Emit/Broadcast the transfer event
        emit Transfer(msg.sender, _to, _value);

        return true;
    }
}