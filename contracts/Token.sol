// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

contract Token {
    // state variables permanently write values to the Ether blockchain 
    string public name;
    string public symbol;
    uint8  public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    //my address approves others to spend
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(
        address indexed _from, 
        address indexed _to, 
        uint256 _value);

    event Approval(
        address indexed _owner, 
        address indexed _spender, 
        uint256 _value);

    constructor(
        string memory _name, 
        string memory _symbol, 
        uint256 _totalSupply){
            name = _name;
            symbol = _symbol;
            totalSupply = _totalSupply  * (10 ** decimals); // in base units (for Ethereum tokens it is "wei")
            balanceOf[msg.sender] = totalSupply; // msg is a global variable inside Solidity, think of "this", or, "self"
    }

    function transfer(
        address _to, 
        uint256 _value) public returns (bool success){
            
            _transfer(msg.sender, _to, _value);

            return true;
    }


    function _transfer(address _from, address _to, uint256 _value) internal {
        
        // 1. Check sufficient funds
        require(balanceOf[_from] >= _value, "Token: Insufficient Funds");        

        // Someone could accidentally or maliciously do:
        // token.transfer("0x0000000000000000000000000000000000000000", 1000)
        // And the tokens would go to an irretrievable black hole — lost forever !
        require(_to != address(0), "Recipient Token is address 0");

        // 2. Deduct tokens from sender
        balanceOf[_from] -= _value;
        
        // 3. Credit tokens to recipient
        balanceOf[_to] += _value;

        // 4. Emit/Broadcast the transfer event
        emit Transfer(_from, _to, _value);

    }

    function approve(
        address _spender,
        uint256 _value) public returns (bool success){

            require(_spender != address(0), "Token: Spender is address 0");

            // approve another wallet/address to spend on my behalf
            allowance[msg.sender][_spender] = _value;

            emit Approval(msg.sender, _spender, _value);
            return true;

    }

    function transferFrom(
        address _from, 
        address _to, 
        uint256 _value) public returns (bool success){

            require(_value <= balanceOf[_from], "Token: Insufficient Funds");
            require(_value <=  allowance[_from][msg.sender], "Token: Exceeded Allowance");

            allowance[_from][msg.sender] -= _value;

            _transfer(_from, _to, _value);

            return true;

    }

}