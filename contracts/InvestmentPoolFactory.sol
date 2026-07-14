// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./OutletToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract InvestmentPoolFactory is Ownable {
    
    struct PoolInfo {
        address tokenAddress;
        string name;
        uint256 totalSupply;
        uint256 createdAt;
    }
    
    mapping(string => PoolInfo) public pools;
    string[] public poolIds;
    
    event PoolCreated(string indexed poolId, address indexed tokenAddress, uint256 totalSupply, uint256 timestamp);
    
    constructor() Ownable(msg.sender) {}
    
    function createPool(
        string memory poolId,
        string memory tokenName,
        string memory tokenSymbol,
        uint256 initialSupply,
        uint256 campaignDurationDays,
        string memory poolMetadataCID,
        uint8 investorShare,
        uint8 brandShare,
        uint8 operatorShare,
        uint8 platformShare
    ) external onlyOwner {
        require(pools[poolId].tokenAddress == address(0), "Pool already exists");
        
        OutletToken newToken = new OutletToken(
            tokenName,
            tokenSymbol,
            initialSupply,
            msg.sender, // treasury is platform owner for MVP
            campaignDurationDays,
            poolMetadataCID,
            investorShare,
            brandShare,
            operatorShare,
            platformShare
        );
        
        pools[poolId] = PoolInfo({
            tokenAddress: address(newToken),
            name: tokenName,
            totalSupply: initialSupply,
            createdAt: block.timestamp
        });
        
        poolIds.push(poolId);
        
        // Transfer ownership of the token contract back to the factory owner
        newToken.transferOwnership(msg.sender);
        
        emit PoolCreated(poolId, address(newToken), initialSupply, block.timestamp);
    }
    
    function getPoolAddress(string memory poolId) external view returns (address) {
        return pools[poolId].tokenAddress;
    }
    
    function getAllPoolIds() external view returns (string[] memory) {
        return poolIds;
    }
}
