#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, String, Symbol, Vec,
};

// ─── Types ────────────────────────────────────────────────────────────────────

/// Supported event types (mirrors AuditEventType in TypeScript)
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum AuditEventType {
    BrandApproved,
    BrandRejected,
    PoolPublished,
    InvestmentMade,
    RevenueDistributed,
    GovernanceVote,
    GovernanceExecuted,
    OutletStatusChanged,
    KycVerified,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct AuditLog {
    pub pool_id: String,
    pub event_type: AuditEventType,
    pub data_cid: String,   // IPFS CID for full event data
    pub timestamp: u64,
    pub recorder: Address,
}

const LOGS_KEY: Symbol = symbol_short!("LOGS");

// ─── Contract ─────────────────────────────────────────────────────────────────

#[contract]
pub struct AuditTrailContract;

#[contractimpl]
impl AuditTrailContract {
    /// Record an audit event on-chain.
    /// Called server-side by platform using the platform keypair.
    pub fn log_event(
        env: Env,
        recorder: Address,
        pool_id: String,
        event_type: AuditEventType,
        data_cid: String,
    ) {
        recorder.require_auth();

        let entry = AuditLog {
            pool_id: pool_id.clone(),
            event_type,
            data_cid,
            timestamp: env.ledger().timestamp(),
            recorder: recorder.clone(),
        };

        let log_key = pool_id.clone();
        let mut pool_logs: Vec<AuditLog> = env
            .storage()
            .persistent()
            .get(&log_key)
            .unwrap_or(Vec::new(&env));
        pool_logs.push_back(entry.clone());
        env.storage().persistent().set(&log_key, &pool_logs);

        // Also append to global log list
        let mut all_logs: Vec<AuditLog> = env
            .storage()
            .persistent()
            .get(&LOGS_KEY)
            .unwrap_or(Vec::new(&env));
        all_logs.push_back(entry.clone());
        env.storage().persistent().set(&LOGS_KEY, &all_logs);

        env.events().publish(
            (Symbol::new(&env, "AuditLogged"), recorder, pool_id),
            entry,
        );
    }

    /// Get all audit logs for a specific pool.
    pub fn get_logs(env: Env, pool_id: String) -> Vec<AuditLog> {
        env.storage()
            .persistent()
            .get(&pool_id)
            .unwrap_or(Vec::new(&env))
    }

    /// Get all audit logs across all pools.
    pub fn get_all_logs(env: Env) -> Vec<AuditLog> {
        env.storage()
            .persistent()
            .get(&LOGS_KEY)
            .unwrap_or(Vec::new(&env))
    }

    /// Get the count of logs for a pool.
    pub fn get_log_count(env: Env, pool_id: String) -> u32 {
        let logs: Vec<AuditLog> = env
            .storage()
            .persistent()
            .get(&pool_id)
            .unwrap_or(Vec::new(&env));
        logs.len()
    }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_log_and_retrieve() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, AuditTrailContract);
        let client = AuditTrailContractClient::new(&env, &contract_id);

        let recorder = Address::generate(&env);
        let pool_id = String::from_str(&env, "POOL001");
        let cid = String::from_str(&env, "QmAuditCID123");

        client.log_event(
            &recorder,
            &pool_id,
            &AuditEventType::InvestmentMade,
            &cid,
        );

        let logs = client.get_logs(&pool_id);
        assert_eq!(logs.len(), 1);
        assert_eq!(client.get_log_count(&pool_id), 1);

        let log = logs.get(0).unwrap();
        assert_eq!(log.data_cid, cid);
    }
}
