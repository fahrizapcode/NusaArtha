#!/bin/bash
# deploy.sh — Build and deploy all NusaArtha Soroban contracts to Stellar Testnet
#
# Prerequisites:
#   rustup target add wasm32-unknown-unknown
#   cargo install --locked stellar-cli --features opt
#
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh

set -e

NETWORK="testnet"
DEPLOYER="nusaartha-admin"

echo "=== NusaArtha Soroban Deploy Script ==="
echo ""

# ── Fund / generate admin keypair if not exists ──────────────────────────────
if ! stellar keys show $DEPLOYER &>/dev/null; then
  echo "[1] Generating admin keypair..."
  stellar keys generate $DEPLOYER --network $NETWORK
  stellar keys fund $DEPLOYER --network $NETWORK
fi

echo "[1] Admin keypair: $(stellar keys show $DEPLOYER)"
echo ""

# ── Build all contracts ───────────────────────────────────────────────────────
echo "[2] Building contracts..."

contracts=("brand_registry" "investment_pool" "governance" "audit_trail")

for contract in "${contracts[@]}"; do
  echo "  Building $contract..."
  cargo build \
    --manifest-path "$contract/Cargo.toml" \
    --target wasm32-unknown-unknown \
    --release 2>/dev/null
  echo "  ✓ $contract built"
done

echo ""

# ── Deploy each contract ─────────────────────────────────────────────────────
echo "[3] Deploying contracts..."

deploy_contract() {
  local name=$1
  local wasm_name=$2

  local wasm_path="target/wasm32-unknown-unknown/release/${wasm_name}.wasm"

  # Optimize WASM
  stellar contract optimize --wasm "$wasm_path" 2>/dev/null || true

  local optimized="${wasm_path%.wasm}.optimized.wasm"
  local deploy_wasm="$wasm_path"
  if [ -f "$optimized" ]; then
    deploy_wasm="$optimized"
  fi

  echo "  Deploying $name..."
  local contract_id
  contract_id=$(stellar contract deploy \
    --wasm "$deploy_wasm" \
    --source $DEPLOYER \
    --network $NETWORK)

  echo "  ✓ $name deployed: $contract_id"
  echo "  Explorer: https://stellar.expert/explorer/testnet/contract/$contract_id"
  echo ""

  # Export to .env.local
  echo "$contract_id"
}

BRAND_REGISTRY_ID=$(deploy_contract "brand_registry" "nusaartha_brand_registry")
INVESTMENT_POOL_ID=$(deploy_contract "investment_pool" "nusaartha_investment_pool")
GOVERNANCE_ID=$(deploy_contract "governance" "nusaartha_governance")
AUDIT_TRAIL_ID=$(deploy_contract "audit_trail" "nusaartha_audit_trail")

# ── Write contract IDs to .env.local ─────────────────────────────────────────
echo "[4] Writing contract IDs to ../.env.local..."

ENV_FILE="../.env.local"

# Update or append each contract ID
update_env() {
  local key=$1
  local value=$2
  if grep -q "^$key=" "$ENV_FILE" 2>/dev/null; then
    sed -i "s|^$key=.*|$key=$value|" "$ENV_FILE"
  else
    echo "$key=$value" >> "$ENV_FILE"
  fi
}

update_env "NEXT_PUBLIC_BRAND_REGISTRY_CONTRACT_ID" "$BRAND_REGISTRY_ID"
update_env "NEXT_PUBLIC_FACTORY_CONTRACT_ID" "$INVESTMENT_POOL_ID"
update_env "NEXT_PUBLIC_GOVERNANCE_CONTRACT_ID" "$GOVERNANCE_ID"
update_env "NEXT_PUBLIC_AUDIT_CONTRACT_ID" "$AUDIT_TRAIL_ID"

echo ""
echo "=== Deploy Complete ==="
echo ""
echo "Contract IDs:"
echo "  Brand Registry:   $BRAND_REGISTRY_ID"
echo "  Investment Pool:  $INVESTMENT_POOL_ID"
echo "  Governance:       $GOVERNANCE_ID"
echo "  Audit Trail:      $AUDIT_TRAIL_ID"
echo ""
echo "Contracts IDs have been written to $ENV_FILE"
echo "Restart your Next.js dev server to pick up the new env vars."
