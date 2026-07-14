// src/lib/contracts/abis.ts
// ABIs for deployed smart contracts

export const OUTLET_TOKEN_ABI = [
  // ERC20 standard
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 value) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 value) returns (bool)",
  "function transferFrom(address from, address to, uint256 value) returns (bool)",

  // OutletToken specific
  "function treasury() view returns (address)",
  "function campaignEndTime() view returns (uint256)",
  "function status() view returns (uint8)",
  "function poolMetadataCID() view returns (string)",
  "function shares() view returns (uint8 investor, uint8 brand, uint8 operator, uint8 platform)",
  "function accumulatedRevenue() view returns (uint256)",
  "function claimedRevenue(address) view returns (uint256)",
  "function whitelistedWallets(address) view returns (bool)",
  "function getOutstandingTokens() view returns (uint256)",
  "function buyTokens(uint256 amount) payable",
  "function whitelistWallet(address wallet)",
  "function distributeRevenue(uint256 totalAmount)",

  // Events
  "event TokensPurchased(address indexed buyer, uint256 amount, uint256 totalCost, uint256 timestamp)",
  "event RevenueDistributed(uint256 totalAmount, uint256 perTokenAmount, uint256 timestamp)",
  "event RevenueClaimed(address indexed investor, uint256 amount, uint256 timestamp)",
  "event WalletWhitelisted(address indexed wallet, uint256 timestamp)",
] as const;

export const FACTORY_ABI = [
  "function createPool(string poolId, string tokenName, string tokenSymbol, uint256 initialSupply, uint256 campaignDurationDays, string poolMetadataCID, uint8 investorShare, uint8 brandShare, uint8 operatorShare, uint8 platformShare)",
  "function getPoolAddress(string poolId) view returns (address)",
  "function getAllPoolIds() view returns (string[])",
  "function pools(string poolId) view returns (address tokenAddress, string name, uint256 totalSupply, uint256 createdAt)",

  // Events
  "event PoolCreated(string indexed poolId, address indexed tokenAddress, uint256 totalSupply, uint256 timestamp)",
] as const;

export const GOVERNANCE_ABI = [
  "function createProposal(string poolId, string title, string descriptionCID, string[] optionDescriptions, uint256 durationDays)",
  "function vote(uint256 proposalId, uint256 optionId)",
  "function executeProposal(uint256 proposalId)",
  "function nextProposalId() view returns (uint256)",
  "function proposals(uint256 proposalId) view returns (uint256 id, string poolId, string title, string descriptionCID, uint256 votingEndTime, bool executed, uint256 winningOptionId)",
  "function proposalOptions(uint256 proposalId, uint256 optionIndex) view returns (uint256 id, string description, uint256 voteCount)",
  "function hasVoted(uint256 proposalId, address voter) view returns (bool)",
  "function factoryAddress() view returns (address)",

  // Events
  "event ProposalCreated(uint256 indexed proposalId, string poolId, string title, uint256 endTime)",
  "event VoteCast(uint256 indexed proposalId, address indexed voter, uint256 optionId, uint256 weight)",
  "event ProposalExecuted(uint256 indexed proposalId, uint256 winningOptionId)",
] as const;

export const AUDIT_TRAIL_ABI = [
  "function logEvent(string poolId, string eventType, string dataCID)",
  "function getEventLogCount(string poolId) view returns (uint256)",
  "function getEventLog(string poolId, uint256 index) view returns (tuple(string poolId, string eventType, string dataCID, uint256 timestamp, address recorder))",
  "function poolLogs(string poolId, uint256 index) view returns (string poolId, string eventType, string dataCID, uint256 timestamp, address recorder)",

  // Events
  "event LogRecorded(string indexed poolId, string indexed eventType, string dataCID, uint256 timestamp)",
] as const;
