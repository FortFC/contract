pragma solidity ^0.4.18;

//Standart full ECR20 contract interface
contract ERC20
{
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    
    function ERC20(string _name, string _symbol) public 
    {
        name = _name;
        symbol = _symbol;
    }
    
    function totalSupply() public view returns (uint256);
    function balanceOf(address who) public view returns (uint256);
    function transfer(address to, uint256 value) public returns (bool);
    event Transfer(address indexed from, address indexed to, uint256 value);
    
    function allowance(address owner, address spender) public view returns (uint256);
    function transferFrom(address from, address to, uint256 value) public returns (bool);
    function approve(address spender, uint256 value) public returns (bool);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
}

//Contract for check ownership
contract Ownable
{
    address internal owner;
        
    function Ownable() public 
    {
        owner = msg.sender;
    }
    
    modifier onlyOwner() 
    {
        require(msg.sender == owner);
        _;
    }
    
    modifier onlyNotOwner()
    {
        require(msg.sender != owner);
        _;
    }
}

//Contract for check Issuers
contract Issuable is Ownable
{
    mapping (address => bool) internal issuers;
    bool internal issueEnable;
    
    event IssuerAdd(address);
    event IssuerRemoved(address);
    
    function addIssuer(address who) onlyOwner public
    {
        require(!issuers[who]);
        issuers[who] = true;
        IssuerAdd(who);
    }
    
    function removeIssuer(address who) onlyOwner public
    {
        require(issuers[who]);
        issuers[who] = false;
        IssuerRemoved(who);
    }
    
    modifier onlyIssuer()
    {
        require(issueEnable);
        require(issuers[msg.sender]);
        _;
    }
}

//Contract for check time limits of ICO
contract TimeLimit
{
    uint256 internal ICOStart;
    uint256 internal ICOEnd;
    uint256 internal TransferStart;
    
    bool internal ICOEnable;
    bool internal TransferEnable;
    
    event ICOStarted(uint256 blockNumber);
    event ICOEnded(uint256 blockNumber);
    event TrasferEnabled(uint256 blockNumber);
    
    function TimeLimit(uint256 start, uint256 end, uint256 trans) public //Local unix time
    {
        require(start >= now);
        require(end > now);
        require(trans > now);
        require(start < end);
        require(trans >= end);
        ICOStart = start;
        ICOEnd = end;
        TransferStart = trans;
    }
    
    modifier onlyInIco()
    {
        require(now > ICOStart);
        require(now <= TransferStart); //We need time to issue last transactions in other money
        if (!ICOEnable && now <= ICOEnd)
        {
            ICOStarted(block.number);
            ICOEnable = true;
        }
        if (ICOEnable && now > ICOEnd)
        {
            ICOEnded(block.number);
            ICOEnable = false;
        }
        _;
    }
    
    modifier transferEnable()
    {
        require(now > TransferStart);
        if (!TransferEnable)
        {
            TrasferEnabled(block.number);
            TransferEnable = true;
        }
        _;
    }
    
    modifier closeCheckICO()
    {
        if (now > TransferStart) 
        {
            closeICO();
            return;
        }
        _;
    }
    
    function closeICO() internal;
}

//Debug contract
contract TimeLimitImp is TimeLimit //TODO! Delete in release
{
    uint256 internal counter;
    function TimeLimitImp(
        uint256 _ICOstart, uint256 _ICOend, uint256 _transferStart
        ) public TimeLimit(_ICOstart, _ICOend, _transferStart)
    {
    }
    
    function closeICO() internal
    {
        counter++;
    }
}


//Main contract
contract OurContract is ERC20, Issuable, TimeLimit
{
    //Contract constants
    uint256 public constant ICO_START_CONTS = 1521198000; //UnixTime  local 16.03 14:00
    uint256 public constant ICO_END_CONTS = 1521208800; //UnixTime local 16.03 17:00
    uint256 public constant TRANSFER_START_CONTS = 1521212400; //UnixTime local 16.03 18:00
    uint256 internal constant TOTAL_SUPPLY_TOKENS_CONTS = 1000000000000000000000000000; //With 18 zeros at end //1 000 000 000 000000000000000000;
    
    event cause(address to, uint256 val, uint8 _type, string message);
    
    //Public token user functions
    function transfer(
        address to, uint256 value
        ) transferEnable public returns (bool)
    {
        return _transfer(msg.sender, to, value);
    }
    
    function transferFrom(
        address from, address to, uint256 value
        ) transferEnable public returns (bool) 
    {
        require(value <= allowances[from][msg.sender]);
        _transfer(from, to, value);
        allowances[from][msg.sender] = allowances[from][msg.sender] - value;
        return true;
    }
    
    function approve(
        address spender, uint256 value
        ) public onlyNotOwner returns (bool)
    {
        allowances[msg.sender][spender] = value;
        Approval(msg.sender, spender, value);
        return true;
    }
    
    //Public views
    function totalSupply() public view returns (uint256) 
    {
        return totalSupply_;
    }
    
    function balanceOf(address owner) public view returns (uint256 balance) 
    {
        return balances[owner];
    }
    
    function allowance(
        address owner, address spender
        ) public view returns (uint256) 
    {
        return allowances[owner][spender];
    }
    
    //Public issuers function
    function issue(
        address to, uint256 value, uint8 _type, string message
        ) onlyIssuer onlyInIco closeCheckICO public
    {
        _transfer(owner, to, value);
        cause(to, value, _type, message);
    }
    
    //Public owner functions
    //Constructor
//    function OurContract(
//        uint256 _totalSupply, uint256 _ICOstart, uint256 _ICOend,
//        uint256 _transferStart, string _name, string _symbol
//        ) public TimeLimit(_ICOstart, _ICOend, _transferStart)
//        ERC20(_name, _symbol)
//    {
//        totalSupply_ = _totalSupply;
//        balances[msg.sender] = totalSupply_;
//        issueEnable = true;
//    }
    function OurContract(
        string _name, string _symbol
        ) public TimeLimit(ICO_START_CONTS, ICO_END_CONTS, TRANSFER_START_CONTS)
        ERC20(_name, _symbol)
    {
        totalSupply_ = TOTAL_SUPPLY_TOKENS_CONTS;
        balances[msg.sender] = totalSupply_;
        issueEnable = true;
    }
    
    function endICO() onlyOwner closeCheckICO public returns(bool)
    {
        return (now > ICOEnd);
    }
    
    //addIssuer from Issuable
    //removeIssuer from Issuable
    
    //Internal variables
    uint256 internal totalSupply_;
    mapping (address => uint256) internal balances;
    mapping (address => mapping (address => uint256)) internal allowances;
    
    //Internal functions
    function _transfer(
        address from, address to, uint256 value
        ) onlyNotOwner internal returns (bool) 
    {
        require(to != address(0));
        require(value <= balances[from]);
        require(value + balances[to] > balances[to]);

        balances[from] = balances[from] - value;
        balances[to] = balances[to] + value;
        Transfer(from, to, value);
        return true;
    }
    
    function closeICO() internal
    {
        totalSupply_ -= balances[owner];
        balances[owner] = 0;
        owner = 0;
    }
    
}