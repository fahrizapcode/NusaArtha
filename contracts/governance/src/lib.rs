#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, String, Symbol, Vec,
};

// ─── Types ────────────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ProposalOption {
    pub id: u32,
    pub description: String,
    pub vote_count: i128,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Proposal {
    pub id: u32,
    pub pool_id: String,
    pub title: String,
    pub description_cid: String, // IPFS CID for full description
    pub options: Vec<ProposalOption>,
    pub voting_end_time: u64,    // Unix timestamp
    pub executed: bool,
    pub winning_option_id: u32,
    pub total_votes: i128,
    pub created_by: Address,
    pub created_at: u64,
}

const NEXT_ID_KEY: Symbol = symbol_short!("NEXT_ID");
const PROPOSALS_KEY: Symbol = symbol_short!("PROPS");

// ─── Contract ─────────────────────────────────────────────────────────────────

#[contract]
pub struct GovernanceContract;

#[contractimpl]
impl GovernanceContract {
    /// Create a new governance proposal for a pool.
    /// Only token holders of the pool can vote (verified off-chain via balance check).
    pub fn create_proposal(
        env: Env,
        creator: Address,
        pool_id: String,
        title: String,
        description_cid: String,
        option_descriptions: Vec<String>,
        duration_days: u64,
    ) -> u32 {
        creator.require_auth();

        let proposal_id: u32 = env
            .storage()
            .persistent()
            .get(&NEXT_ID_KEY)
            .unwrap_or(0u32);

        let voting_end_time =
            env.ledger().timestamp() + (duration_days * 86_400);

        let mut options = Vec::new(&env);
        let mut i: u32 = 0;
        while i < option_descriptions.len() {
            let desc = option_descriptions.get(i).unwrap();
            options.push_back(ProposalOption {
                id: i,
                description: desc,
                vote_count: 0,
            });
            i += 1;
        }

        let proposal = Proposal {
            id: proposal_id,
            pool_id: pool_id.clone(),
            title,
            description_cid,
            options,
            voting_end_time,
            executed: false,
            winning_option_id: 0,
            total_votes: 0,
            created_by: creator.clone(),
            created_at: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&proposal_id, &proposal);

        let mut all: Vec<u32> = env
            .storage()
            .persistent()
            .get(&PROPOSALS_KEY)
            .unwrap_or(Vec::new(&env));
        all.push_back(proposal_id);
        env.storage().persistent().set(&PROPOSALS_KEY, &all);

        // Bump next ID
        env.storage()
            .persistent()
            .set(&NEXT_ID_KEY, &(proposal_id + 1));

        env.events().publish(
            (Symbol::new(&env, "ProposalCreated"), creator, pool_id),
            proposal,
        );

        proposal_id
    }

    /// Cast a vote on a proposal.
    /// vote_weight = number of tokens voter holds (passed from frontend).
    /// On-chain we only record the vote; balance is verified off-chain via Horizon.
    pub fn vote(
        env: Env,
        voter: Address,
        proposal_id: u32,
        option_id: u32,
        vote_weight: i128,
    ) {
        voter.require_auth();

        let vote_key = (voter.clone(), proposal_id);
        let already_voted: bool = env
            .storage()
            .persistent()
            .get(&vote_key)
            .unwrap_or(false);
        assert!(!already_voted, "Already voted");

        let mut proposal: Proposal = env
            .storage()
            .persistent()
            .get(&proposal_id)
            .expect("Proposal not found");

        assert!(
            env.ledger().timestamp() < proposal.voting_end_time,
            "Voting period ended"
        );
        assert!(!proposal.executed, "Proposal already executed");
        assert!(vote_weight > 0, "Vote weight must be > 0");

        // Update option vote count
        let mut updated_options = Vec::new(&env);
        let mut i: u32 = 0;
        while i < proposal.options.len() {
            let mut opt = proposal.options.get(i).unwrap();
            if opt.id == option_id {
                opt.vote_count += vote_weight;
            }
            updated_options.push_back(opt);
            i += 1;
        }
        proposal.options = updated_options;
        proposal.total_votes += vote_weight;

        env.storage().persistent().set(&proposal_id, &proposal);

        // Mark voter as voted
        env.storage().persistent().set(&vote_key, &true);

        env.events().publish(
            (Symbol::new(&env, "VoteCast"), voter, proposal_id),
            (option_id, vote_weight),
        );
    }

    /// Execute a proposal after voting ends. Determines winning option.
    pub fn execute_proposal(env: Env, executor: Address, proposal_id: u32) {
        executor.require_auth();

        let mut proposal: Proposal = env
            .storage()
            .persistent()
            .get(&proposal_id)
            .expect("Proposal not found");

        assert!(
            env.ledger().timestamp() >= proposal.voting_end_time,
            "Voting still active"
        );
        assert!(!proposal.executed, "Already executed");

        // Find winning option
        let mut winning_id: u32 = 0;
        let mut max_votes: i128 = -1;
        let mut i: u32 = 0;
        while i < proposal.options.len() {
            let opt = proposal.options.get(i).unwrap();
            if opt.vote_count > max_votes {
                max_votes = opt.vote_count;
                winning_id = opt.id;
            }
            i += 1;
        }

        proposal.executed = true;
        proposal.winning_option_id = winning_id;
        env.storage().persistent().set(&proposal_id, &proposal);

        env.events().publish(
            (Symbol::new(&env, "ProposalExecuted"), executor),
            (proposal_id, winning_id),
        );
    }

    /// Get proposal by ID.
    pub fn get_proposal(env: Env, proposal_id: u32) -> Option<Proposal> {
        env.storage().persistent().get(&proposal_id)
    }

    /// Get all proposals for a specific pool.
    pub fn get_proposals_by_pool(env: Env, pool_id: String) -> Vec<Proposal> {
        let all_ids: Vec<u32> = env
            .storage()
            .persistent()
            .get(&PROPOSALS_KEY)
            .unwrap_or(Vec::new(&env));

        let mut result = Vec::new(&env);
        let mut i: u32 = 0;
        while i < all_ids.len() {
            let pid = all_ids.get(i).unwrap();
            if let Some(p) = env.storage().persistent().get::<u32, Proposal>(&pid) {
                if p.pool_id == pool_id {
                    result.push_back(p);
                }
            }
            i += 1;
        }
        result
    }

    /// Check if an address has voted on a proposal.
    pub fn has_voted(env: Env, voter: Address, proposal_id: u32) -> bool {
        let vote_key = (voter, proposal_id);
        env.storage()
            .persistent()
            .get(&vote_key)
            .unwrap_or(false)
    }

    /// Get total number of proposals created.
    pub fn proposal_count(env: Env) -> u32 {
        env.storage()
            .persistent()
            .get(&NEXT_ID_KEY)
            .unwrap_or(0u32)
    }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_create_and_vote() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, GovernanceContract);
        let client = GovernanceContractClient::new(&env, &contract_id);

        let creator = Address::generate(&env);
        let voter = Address::generate(&env);
        let pool_id = String::from_str(&env, "POOL001");

        let mut options = Vec::new(&env);
        options.push_back(String::from_str(&env, "Setuju"));
        options.push_back(String::from_str(&env, "Tidak Setuju"));

        let pid = client.create_proposal(
            &creator,
            &pool_id,
            &String::from_str(&env, "Gunakan Dana Cadangan"),
            &String::from_str(&env, "QmIPFS123"),
            &options,
            &7u64, // 7 days
        );
        assert_eq!(pid, 0);

        client.vote(&voter, &pid, &0u32, &100i128);

        let proposal = client.get_proposal(&pid).unwrap();
        assert_eq!(proposal.total_votes, 100);
        assert!(client.has_voted(&voter, &pid));

        // Can't vote twice
        let result = std::panic::catch_unwind(|| {
            client.vote(&voter, &pid, &0u32, &50i128);
        });
        assert!(result.is_err());
    }
}
