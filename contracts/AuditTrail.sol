// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AuditTrail is Ownable {
    
    struct LogEntry {
        string poolId;
        string eventType;
        string dataCID; // IPFS CID for full event data
        uint256 timestamp;
        address recorder;
    }
    
    // Mapping from poolId to an array of log entries
    mapping(string => LogEntry[]) public poolLogs;
    
    event LogRecorded(string indexed poolId, string indexed eventType, string dataCID, uint256 timestamp);
    
    constructor() Ownable(msg.sender) {}
    
    function logEvent(
        string memory poolId,
        string memory eventType,
        string memory dataCID
    ) external onlyOwner {
        LogEntry memory newEntry = LogEntry({
            poolId: poolId,
            eventType: eventType,
            dataCID: dataCID,
            timestamp: block.timestamp,
            recorder: msg.sender
        });
        
        poolLogs[poolId].push(newEntry);
        
        emit LogRecorded(poolId, eventType, dataCID, block.timestamp);
    }
    
    function getEventLogCount(string memory poolId) external view returns (uint256) {
        return poolLogs[poolId].length;
    }
    
    function getEventLog(string memory poolId, uint256 index) external view returns (LogEntry memory) {
        require(index < poolLogs[poolId].length, "Index out of bounds");
        return poolLogs[poolId][index];
    }
}
