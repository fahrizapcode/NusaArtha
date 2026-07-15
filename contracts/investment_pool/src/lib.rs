#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, String, Symbol, Vec,
};

// ─── Types ────────────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RevenueShares {
    pub investor: u32,  // basis points out of 100
    pub brand: u32,
    pub operator: u32,
    pub platform: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct InvestmentPool {
    pub pool_id: String,
    pub brand_owner: Address,
    pub name: String,
    pub location: String,
    pub target_funding: i128,    // in stroops (1 XLM = 10_000_000 stroops)
    pub total_supply: i128,      // total token supply
    pub price_per_token: i128,   // in stroops
    pub tokens_sold: i128,
    pub revenue_shares: RevenueShares,
    pub status: String,          // "DRAFT" | "PUBLISHED" | "ACTIVE" | "OPERATING" | "COMPLETED"
    pub disclosure_cid: String,  // IPFS CID for disclosure document
    pub created_at: u64,
    pub published_at: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Investment {
    pub investor: Address,
    pub pool_id: String,
    pub tokens_owned: i128,
    pub invested_at: u64,
    pub tx_hash: String,         // Stellar tx hash for proof
}

const POOLS_KEY: Symbol = symbol_short!("POOLS");
const INVESTMENTS_KEY: Symbol = symbol_short!("INVEST");

// ─── Contract ─────────────────────────────────────────────────────────────────

#[contract]
pub struct InvestmentPoolContract;

#[contractimpl]
impl InvestmentPoolContract {
    /// Admin publishes an investment pool (immutable once published).
    pub fn publish_pool(
        env: Env,
        admin: Address,
        brand_owner: Address,
        pool_id: String,
        name: String,
        location: String,
        target_funding: i128,
        total_supply: i128,
        price_per_token: i128,
        investor_share: u32,
        brand_share: u32,
        operator_share: u32,
        platform_share: u32,
        disclosure_cid: String,
    ) {
        admin.require_auth();

        // Validate shares sum to 100
        let total = investor_share + brand_share + operator_share + platform_share;
        assert!(total == 100, "Revenue shares must sum to 100");

        let pool = InvestmentPool {
            pool_id: pool_id.clone(),
            brand_owner,
            name,
            location,
            target_funding,
            total_supply,
            price_per_token,
            tokens_sold: 0,
            revenue_shares: RevenueShares {
                investor: investor_share,
                brand: brand_share,
                operator: operator_share,
                platform: platform_share,
            },
            status: String::from_str(&env, "PUBLISHED"),
            disclosure_cid,
            created_at: env.ledger().timestamp(),
            published_at: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&pool_id, &pool);

        let mut all: Vec<String> = env
            .storage()
            .persistent()
            .get(&POOLS_KEY)
            .unwrap_or(Vec::new(&env));
        all.push_back(pool_id.clone());
        env.storage().persistent().set(&POOLS_KEY, &all);

        env.events().publish(
            (Symbol::new(&env, "PoolPublished"), admin),
            pool,
        );
    }

    /// Record a token purchase on-chain.
    /// The actual token transfer happens via Stellar native asset payment (server-side).
    /// This records the investment record immutably.
    pub fn record_investment(
        env: Env,
        investor: Address,
        pool_id: String,
        tokens_bought: i128,
        tx_hash: String,
    ) {
        investor.require_auth();

        let mut pool: InvestmentPool = env
            .storage()
            .persistent()
            .get(&pool_id)
            .expect("Pool not found");

        assert!(
            pool.status == String::from_str(&env, "PUBLISHED")
                || pool.status == String::from_str(&env, "ACTIVE"),
            "Pool not accepting investments"
        );

        let available = pool.total_supply - pool.tokens_sold;
        assert!(tokens_bought > 0 && tokens_bought <= available, "Invalid token amount");

        pool.tokens_sold += tokens_bought;
        // Auto-transition to ACTIVE if first investment
        if pool.status == String::from_str(&env, "PUBLISHED") {
            pool.status = String::from_str(&env, "ACTIVE");
        }
        env.storage().persistent().set(&pool_id, &pool);

        let investment = Investment {
            investor: investor.clone(),
            pool_id: pool_id.clone(),
            tokens_owned: tokens_bought,
            invested_at: env.ledger().timestamp(),
            tx_hash: tx_hash.clone(),
        };

        // Store investment record: key = (investor, pool_id)
        let inv_key = (investor.clone(), pool_id.clone());
        env.storage().persistent().set(&inv_key, &investment);

        // Append to global investments list
        let mut all_inv: Vec<Investment> = env
            .storage()
            .persistent()
            .get(&INVESTMENTS_KEY)
            .unwrap_or(Vec::new(&env));
        all_inv.push_back(investment.clone());
        env.storage().persistent().set(&INVESTMENTS_KEY, &all_inv);

        env.events().publish(
            (Symbol::new(&env, "InvestmentMade"), investor, pool_id),
            investment,
        );
    }

    /// Admin transitions pool to OPERATING status.
    pub fn set_operating(env: Env, admin: Address, pool_id: String) {
        admin.require_auth();
        let mut pool: InvestmentPool = env
            .storage()
            .persistent()
            .get(&pool_id)
            .expect("Pool not found");
        pool.status = String::from_str(&env, "OPERATING");
        env.storage().persistent().set(&pool_id, &pool);
        env.events().publish(
            (Symbol::new(&env, "PoolOperating"), admin),
            pool_id,
        );
    }

    /// Get pool info by ID.
    pub fn get_pool(env: Env, pool_id: String) -> Option<InvestmentPool> {
        env.storage().persistent().get(&pool_id)
    }

    /// Get all pool IDs.
    pub fn get_all_pool_ids(env: Env) -> Vec<String> {
        env.storage()
            .persistent()
            .get(&POOLS_KEY)
            .unwrap_or(Vec::new(&env))
    }

    /// Get investment record for an investor in a pool.
    pub fn get_investment(
        env: Env,
        investor: Address,
        pool_id: String,
    ) -> Option<Investment> {
        let key = (investor, pool_id);
        env.storage().persistent().get(&key)
    }

    /// Get all investments across all pools.
    pub fn get_all_investments(env: Env) -> Vec<Investment> {
        env.storage()
            .persistent()
            .get(&INVESTMENTS_KEY)
            .unwrap_or(Vec::new(&env))
    }

    /// Get tokens available in a pool.
    pub fn tokens_available(env: Env, pool_id: String) -> i128 {
        let pool: InvestmentPool = env
            .storage()
            .persistent()
            .get(&pool_id)
            .expect("Pool not found");
        pool.total_supply - pool.tokens_sold
    }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_publish_and_invest() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, InvestmentPoolContract);
        let client = InvestmentPoolContractClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let brand_owner = Address::generate(&env);
        let investor = Address::generate(&env);

        let pool_id = String::from_str(&env, "POOL001");
        let name = String::from_str(&env, "Kopi BSD City");
        let location = String::from_str(&env, "BSD City, Tangerang");

        client.publish_pool(
            &admin,
            &brand_owner,
            &pool_id,
            &name,
            &location,
            &150_000_000i128,   // Rp 150jt in satoshi equiv
            &1000i128,           // 1000 tokens
            &150_000i128,        // Rp 150k per token
            &40u32,              // investor 40%
            &30u32,              // brand 30%
            &20u32,              // operator 20%
            &10u32,              // platform 10%
            &String::from_str(&env, "QmABC123"),
        );

        let pool = client.get_pool(&pool_id).unwrap();
        assert_eq!(pool.total_supply, 1000);
        assert_eq!(pool.tokens_sold, 0);

        client.record_investment(
            &investor,
            &pool_id,
            &100i128,
            &String::from_str(&env, "txhash123"),
        );

        let inv = client.get_investment(&investor, &pool_id).unwrap();
        assert_eq!(inv.tokens_owned, 100);

        let available = client.tokens_available(&pool_id);
        assert_eq!(available, 900);
    }
}
