// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OutletToken is ERC20, Ownable {
    uint8 private _decimals;
    address public treasury;
    uint256 public campaignEndTime;
    
    enum CampaignStatus { Active, Funded, Operating, Completed, Paused }
    CampaignStatus public status;
    
    mapping(address => bool) public whitelistedWallets;
    string public poolMetadataCID;
    
    struct RevenueShares {
        uint8 investor;
        uint8 brand;
        uint8 operator;
        uint8 platform;
    }
    RevenueShares public shares;
    
    uint256 public accumulatedRevenue;
    mapping(address => uint256) public claimedRevenue;
    
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 totalCost, uint256 timestamp);
    event RevenueDistributed(uint256 totalAmount, uint256 perTokenAmount, uint256 timestamp);
    event RevenueClaimed(address indexed investor, uint256 amount, uint256 timestamp);
    event WalletWhitelisted(address indexed wallet, uint256 timestamp);
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address _treasury,
        uint256 _campaignDurationDays,
        string memory _poolMetadataCID,
        uint8 _investorShare,
        uint8 _brandShare,
        uint8 _operatorShare,
        uint8 _platformShare
    ) ERC20(name, symbol) Ownable(msg.sender) {
        require(_investorShare + _brandShare + _operatorShare + _platformShare == 100, "Shares must equal 100%");
        _decimals = 2; // e.g. minimum 0.01 lot
        treasury = _treasury;
        poolMetadataCID = _poolMetadataCID;
        shares = RevenueShares(_investorShare, _brandShare, _operatorShare, _platformShare);
        campaignEndTime = block.timestamp + (_campaignDurationDays * 1 days);
        status = CampaignStatus.Active;
        
        _mint(treasury, initialSupply * (10 ** uint256(_decimals)));
    }
    
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    function whitelistWallet(address wallet) external onlyOwner {
        whitelistedWallets[wallet] = true;
        emit WalletWhitelisted(wallet, block.timestamp);
    }
    
    function buyTokens(uint256 amount) external payable {
        require(status == CampaignStatus.Active, "Campaign not active");
        require(whitelistedWallets[msg.sender], "Wallet not whitelisted");
        require(block.timestamp <= campaignEndTime, "Campaign ended");
        
        // Transfer tokens from treasury to buyer
        _transfer(treasury, msg.sender, amount);
        
        emit TokensPurchased(msg.sender, amount, msg.value, block.timestamp);
    }
    
    // Override transfer to enforce whitelist
    function transfer(address to, uint256 value) public virtual override returns (bool) {
        require(whitelistedWallets[msg.sender] || msg.sender == treasury, "Sender not whitelisted");
        require(whitelistedWallets[to] || to == treasury, "Receiver not whitelisted");
        return super.transfer(to, value);
    }
    
    function transferFrom(address from, address to, uint256 value) public virtual override returns (bool) {
        require(whitelistedWallets[from] || from == treasury, "Sender not whitelisted");
        require(whitelistedWallets[to] || to == treasury, "Receiver not whitelisted");
        return super.transferFrom(from, to, value);
    }
    
    function getOutstandingTokens() public view returns (uint256) {
        return totalSupply() - balanceOf(treasury);
    }
    
    // Placeholder for distribution logic
    function distributeRevenue(uint256 totalAmount) external onlyOwner {
        require(status == CampaignStatus.Operating, "Not in operating status");
        accumulatedRevenue += totalAmount;
        emit RevenueDistributed(totalAmount, totalAmount / getOutstandingTokens(), block.timestamp);
    }
}
