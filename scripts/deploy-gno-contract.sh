#!/usr/bin/env bash
set -euo pipefail

: "${GNO_DEPLOYER_ADDRESS:?GNO_DEPLOYER_ADDRESS is required}"
: "${GNO_KEY_NAME:?GNO_KEY_NAME is required}"

if [[ ! "$GNO_DEPLOYER_ADDRESS" =~ ^g1[023456789acdefghjklmnpqrstuvwxyz]{38}$ ]]; then
  echo "invalid GNO_DEPLOYER_ADDRESS" >&2
  exit 2
fi

GNO_CHAIN_ID="${GNO_CHAIN_ID:-staging}"
GNO_RPC_URL="${GNO_RPC_URL:-https://rpc.staging.gno.land:443}"
if [[ "$GNO_CHAIN_ID" != "staging" && "$GNO_CHAIN_ID" != "pearl-1" ]]; then
  echo "only staging and pearl-1 contract deployment are allowed" >&2
  exit 3
fi
if ! command -v gnokey >/dev/null 2>&1 || ! command -v gno >/dev/null 2>&1; then
  echo "gno and gnokey are required; install official binaries matching the target chain release" >&2
  exit 4
fi

contract_dir="$(cd "$(dirname "$0")/../contracts/gno/g402pay" && pwd)"
stage_dir="$(mktemp -d)"
trap 'rm -rf "$stage_dir"' EXIT
cp "$contract_dir"/*.gno "$stage_dir"/
printf 'module = "gno.land/r/%s/g402pay"\ngno = "0.9"\n' "$GNO_DEPLOYER_ADDRESS" > "$stage_dir/gnomod.toml"

gno test "$stage_dir"
gnokey maketx addpkg \
  -pkgpath "gno.land/r/${GNO_DEPLOYER_ADDRESS}/g402pay" \
  -pkgdir "$stage_dir" \
  -gas-fee "${GNO_DEPLOY_GAS_FEE:-1000000ugnot}" \
  -gas-wanted "${GNO_DEPLOY_GAS_WANTED:-20000000}" \
  -chainid "$GNO_CHAIN_ID" \
  -remote "$GNO_RPC_URL" \
  "$GNO_KEY_NAME"
