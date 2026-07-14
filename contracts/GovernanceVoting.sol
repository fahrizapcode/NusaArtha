// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./OutletToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GovernanceVoting is Ownable {
    
    struct Proposal {
        uint256 id;
        string poolId;
        string title;
        string descriptionCID; // IPFS CID for detailed description
        uint256 votingEndTime;
        bool executed;
        uint256 winningOptionId;
    }
    
    struct Option {
        uint256 id;
        string description;
        uint256 voteCount;
    }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => Option[]) public proposalOptions;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    uint256 public nextProposalId;
    
    // address of the factory to check tokens
    address public factoryAddress;
    
    event ProposalCreated(uint256 indexed proposalId, string poolId, string title, uint256 endTime);
    event VoteCast(uint256 indexed proposalId, address indexed voter, uint256 optionId, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId, uint256 winningOptionId);
    
    constructor(address _factoryAddress) Ownable(msg.sender) {
        factoryAddress = _factoryAddress;
    }
    
    // Abstracted factory interface call for simplicity
    function _getTokenAddress(string memory poolId) internal view returns (address) {
        (bool success, bytes memory data) = factoryAddress.staticcall(
            abi.encodeWithSignature("getPoolAddress(string)", poolId)
        );
        require(success, "Failed to get pool address");
        return abi.decode(data, (address));
    }
    
    function createProposal(
        string memory poolId,
        string memory title,
        string memory descriptionCID,
        string[] memory optionDescriptions,
        uint256 durationDays
    ) external onlyOwner {
        uint256 proposalId = nextProposalId++;
        
        proposals[proposalId] = Proposal({
            id: proposalId,
            poolId: poolId,
            title: title,
            descriptionCID: descriptionCID,
            votingEndTime: block.timestamp + (durationDays * 1 days),
            executed: false,
            winningOptionId: 0
        });
        
        for (uint256 i = 0; i < optionDescriptions.length; i++) {
            proposalOptions[proposalId].push(Option({
                id: i,
                description: optionDescriptions[i],
                voteCount: 0
            }));
        }
        
        emit ProposalCreated(proposalId, poolId, title, proposals[proposalId].votingEndTime);
    }
    
    function vote(uint256 proposalId, uint256 optionId) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp <= proposal.votingEndTime, "Voting ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");
        require(optionId < proposalOptions[proposalId].length, "Invalid option");
        
        address tokenAddress = _getTokenAddress(proposal.poolId);
        require(tokenAddress != address(0), "Pool not found");
        
        OutletToken token = OutletToken(tokenAddress);
        uint256 voteWeight = token.balanceOf(msg.sender);
        
        require(voteWeight > 0, "No voting power");
        
        hasVoted[proposalId][msg.sender] = true;
        proposalOptions[proposalId][optionId].voteCount += voteWeight;
        
        emit VoteCast(proposalId, msg.sender, optionId, voteWeight);
    }
    
    function executeProposal(uint256 proposalId) external onlyOwner {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp > proposal.votingEndTime, "Voting not yet ended");
        require(!proposal.executed, "Already executed");
        
        uint256 winningVoteCount = 0;
        uint256 winningOptionId = 0;
        
        Option[] storage options = proposalOptions[proposalId];
        for (uint256 i = 0; i < options.length; i++) {
            if (options[i].voteCount > winningVoteCount) {
                winningVoteCount = options[i].voteCount;
                winningOptionId = i;
            }
        }
        
        proposal.executed = true;
        proposal.winningOptionId = winningOptionId;
        
        emit ProposalExecuted(proposalId, winningOptionId);
    }
}
