#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    Address, Env, String, Symbol, Vec,
};

// ─── Types ────────────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Brand {
    pub owner: Address,
    pub name: String,
    pub business_type: String,
    pub timestamp: u64,
    pub status: String,       // "Pending" | "Approved" | "Rejected"
    pub readiness_score: u32, // 0–100
    pub risk_level: String,   // "EMERGING" | "MEZZANINE" | "MATURE" | "HIGH_RISK"
    pub verified: bool,
    pub approved_at: u64,
    pub approver: Address,
}

const BRANDS_KEY: Symbol = symbol_short!("BRANDS");

// ─── Contract ─────────────────────────────────────────────────────────────────

#[contract]
pub struct BrandRegistry;

#[contractimpl]
impl BrandRegistry {
    /// Register a new brand on-chain. Status starts as "Pending".
    /// Called by the brand owner after completing off-chain profile.
    pub fn register_brand(
        env: Env,
        owner: Address,
        name: String,
        business_type: String,
    ) {
        owner.require_auth();

        let brand = Brand {
            owner: owner.clone(),
            name: name.clone(),
            business_type,
            timestamp: env.ledger().timestamp(),
            status: String::from_str(&env, "Pending"),
            readiness_score: 0,
            risk_level: String::from_str(&env, "PENDING"),
            verified: false,
            approved_at: 0,
            // placeholder until approved
            approver: owner.clone(),
        };

        // Store by (owner, name) key
        let key = (owner.clone(), name.clone());
        env.storage().persistent().set(&key, &brand);

        // Append to global list (or update if re-registering)
        let mut all: Vec<Brand> = env
            .storage()
            .persistent()
            .get(&BRANDS_KEY)
            .unwrap_or(Vec::new(&env));

        let mut found = false;
        let mut i: u32 = 0;
        while i < all.len() {
            let b = all.get(i).unwrap();
            if b.owner == owner && b.name == name {
                all.set(i, brand.clone());
                found = true;
                break;
            }
            i += 1;
        }
        if !found {
            all.push_back(brand.clone());
        }
        env.storage().persistent().set(&BRANDS_KEY, &all);

        // Emit event
        env.events().publish(
            (Symbol::new(&env, "BrandRegistered"), owner),
            brand,
        );
    }

    /// Admin approves a brand after off-chain due diligence.
    /// Sets readiness_score, risk_level, status = "Approved".
    pub fn approve_brand(
        env: Env,
        admin: Address,
        owner: Address,
        name: String,
        readiness_score: u32,
        risk_level: String,
    ) {
        admin.require_auth();

        let key = (owner.clone(), name.clone());
        let mut brand: Brand = env
            .storage()
            .persistent()
            .get(&key)
            .expect("Brand not found");

        brand.status = String::from_str(&env, "Approved");
        brand.readiness_score = readiness_score;
        brand.risk_level = risk_level;
        brand.verified = true;
        brand.approved_at = env.ledger().timestamp();
        brand.approver = admin.clone();

        env.storage().persistent().set(&key, &brand);

        let mut all: Vec<Brand> = env
            .storage()
            .persistent()
            .get(&BRANDS_KEY)
            .unwrap_or(Vec::new(&env));
        let mut i: u32 = 0;
        while i < all.len() {
            let b = all.get(i).unwrap();
            if b.owner == owner && b.name == name {
                all.set(i, brand.clone());
                break;
            }
            i += 1;
        }
        env.storage().persistent().set(&BRANDS_KEY, &all);

        env.events().publish(
            (Symbol::new(&env, "BrandApproved"), admin, owner),
            brand,
        );
    }

    /// Admin rejects a brand.
    pub fn reject_brand(env: Env, admin: Address, owner: Address, name: String) {
        admin.require_auth();

        let key = (owner.clone(), name.clone());
        let mut brand: Brand = env
            .storage()
            .persistent()
            .get(&key)
            .expect("Brand not found");

        brand.status = String::from_str(&env, "Rejected");
        brand.approver = admin.clone();
        brand.approved_at = env.ledger().timestamp();

        env.storage().persistent().set(&key, &brand);

        let mut all: Vec<Brand> = env
            .storage()
            .persistent()
            .get(&BRANDS_KEY)
            .unwrap_or(Vec::new(&env));
        let mut i: u32 = 0;
        while i < all.len() {
            let b = all.get(i).unwrap();
            if b.owner == owner && b.name == name {
                all.set(i, brand.clone());
                break;
            }
            i += 1;
        }
        env.storage().persistent().set(&BRANDS_KEY, &all);

        env.events().publish(
            (Symbol::new(&env, "BrandRejected"), admin, owner),
            name,
        );
    }

    /// Get a single brand by owner address and name.
    pub fn get_brand(env: Env, owner: Address, name: String) -> Option<Brand> {
        let key = (owner, name);
        env.storage().persistent().get(&key)
    }

    /// Get all registered brands.
    pub fn get_all_brands(env: Env) -> Vec<Brand> {
        env.storage()
            .persistent()
            .get(&BRANDS_KEY)
            .unwrap_or(Vec::new(&env))
    }

    /// Get brands filtered by status.
    pub fn get_brands_by_status(env: Env, status: String) -> Vec<Brand> {
        let all: Vec<Brand> = env
            .storage()
            .persistent()
            .get(&BRANDS_KEY)
            .unwrap_or(Vec::new(&env));

        let mut result = Vec::new(&env);
        let mut i: u32 = 0;
        while i < all.len() {
            let b = all.get(i).unwrap();
            if b.status == status {
                result.push_back(b);
            }
            i += 1;
        }
        result
    }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_register_and_approve() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, BrandRegistry);
        let client = BrandRegistryClient::new(&env, &contract_id);

        let owner = Address::generate(&env);
        let admin = Address::generate(&env);
        let name = String::from_str(&env, "Kopi Nusantara");
        let btype = String::from_str(&env, "F&B");

        // Register
        client.register_brand(&owner, &name, &btype);
        let brand = client.get_brand(&owner, &name).unwrap();
        assert_eq!(brand.status, String::from_str(&env, "Pending"));
        assert!(!brand.verified);

        // Approve
        client.approve_brand(
            &admin,
            &owner,
            &name,
            &80u32,
            &String::from_str(&env, "EMERGING"),
        );
        let approved = client.get_brand(&owner, &name).unwrap();
        assert_eq!(approved.status, String::from_str(&env, "Approved"));
        assert!(approved.verified);
        assert_eq!(approved.readiness_score, 80);

        // List
        let all = client.get_all_brands();
        assert_eq!(all.len(), 1);
    }
}
