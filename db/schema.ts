import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const paymentChallenges = sqliteTable("payment_challenges", {
  nonce: text("nonce").primaryKey(),
  resource: text("resource").notNull(),
  resourceHash: text("resource_hash").notNull(),
  method: text("method").notNull(),
  network: text("network").notNull(),
  chainId: text("chain_id").notNull(),
  asset: text("asset").notNull(),
  denom: text("denom").notNull(),
  amount: text("amount").notNull(),
  payTo: text("pay_to").notNull(),
  paymentMode: text("payment_mode").notNull(),
  contractPath: text("contract_path"),
  extraJson: text("extra_json").notNull().default("{}"),
  expiresAt: integer("expires_at").notNull(),
  consumedBy: text("consumed_by"),
  createdAt: text("created_at").notNull(),
}, (table) => [index("payment_challenges_expiry_idx").on(table.expiresAt)]);

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey(),
  paymentId: text("payment_id").notNull(),
  fingerprint: text("fingerprint").notNull(),
  nonce: text("nonce").notNull(),
  txHash: text("tx_hash"),
  network: text("network").notNull(),
  payer: text("payer").notNull(),
  payTo: text("pay_to").notNull(),
  asset: text("asset").notNull(),
  amount: text("amount").notNull(),
  status: text("status").notNull(),
  error: text("error"),
  resourceHash: text("resource_hash"),
  source: text("source").notNull().default("facilitator"),
  blockHeight: integer("block_height"),
  blockHash: text("block_hash"),
  confirmations: integer("confirmations").notNull().default(0),
  merchantId: text("merchant_id"),
  agentId: text("agent_id"),
  policyId: text("policy_id"),
  serviceQuoteId: text("service_quote_id"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  uniqueIndex("payments_payment_id_unique").on(table.paymentId),
  uniqueIndex("payments_fingerprint_unique").on(table.fingerprint),
  uniqueIndex("payments_nonce_unique").on(table.network, table.payer, table.nonce),
  index("payments_tx_hash_idx").on(table.txHash),
  index("payments_created_at_idx").on(table.createdAt),
]);

export const indexedBlocks = sqliteTable("indexed_blocks", {
  network: text("network").notNull(),
  height: integer("height").notNull(),
  blockHash: text("block_hash").notNull(),
  parentHash: text("parent_hash"),
  blockTime: text("block_time"),
  canonical: integer("canonical", { mode: "boolean" }).notNull().default(true),
  txCount: integer("tx_count").notNull().default(0),
  indexedAt: text("indexed_at").notNull(),
}, (table) => [
  uniqueIndex("indexed_blocks_fork_unique").on(table.network, table.height, table.blockHash),
  index("indexed_blocks_canonical_height_idx").on(table.network, table.canonical, table.height),
  index("indexed_blocks_hash_idx").on(table.blockHash),
]);

export const indexerCheckpoints = sqliteTable("indexer_checkpoints", {
  network: text("network").primaryKey(),
  height: integer("height").notNull(),
  blockHash: text("block_hash").notNull(),
  parentHash: text("parent_hash"),
  chainHeight: integer("chain_height").notNull().default(0),
  lastError: text("last_error"),
  updatedAt: text("updated_at").notNull(),
});

export const chainTransactions = sqliteTable("chain_transactions", {
  txHash: text("tx_hash").primaryKey(),
  network: text("network").notNull(),
  height: integer("height").notNull(),
  txIndex: integer("tx_index").notNull(),
  blockHash: text("block_hash").notNull(),
  blockTime: text("block_time"),
  code: integer("code").notNull().default(0),
  log: text("log"),
  memo: text("memo"),
  signer: text("signer"),
  recipient: text("recipient"),
  asset: text("asset"),
  amount: text("amount"),
  kind: text("kind"),
  paymentId: text("payment_id"),
  nonce: text("nonce"),
  resourceHash: text("resource_hash"),
  canonical: integer("canonical", { mode: "boolean" }).notNull().default(true),
  indexedAt: text("indexed_at").notNull(),
}, (table) => [
  index("chain_transactions_height_idx").on(table.network, table.height),
  index("chain_transactions_payment_idx").on(table.paymentId),
  index("chain_transactions_signer_idx").on(table.signer),
  index("chain_transactions_recipient_idx").on(table.recipient),
]);

export const chainEvents = sqliteTable("chain_events", {
  id: text("id").primaryKey(),
  txHash: text("tx_hash").notNull(),
  network: text("network").notNull(),
  height: integer("height").notNull(),
  eventType: text("event_type").notNull(),
  attributesJson: text("attributes_json").notNull(),
  canonical: integer("canonical", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
}, (table) => [index("chain_events_tx_idx").on(table.txHash), index("chain_events_height_idx").on(table.network, table.height)]);

export const auditLog = sqliteTable("audit_log", {
  id: text("id").primaryKey(),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  target: text("target"),
  metadataJson: text("metadata_json").notNull().default("{}"),
  createdAt: text("created_at").notNull(),
}, (table) => [index("audit_log_created_idx").on(table.createdAt)]);

export const rateLimitBuckets = sqliteTable("rate_limit_buckets", {
  keyHash: text("key_hash").notNull(),
  windowStart: integer("window_start").notNull(),
  count: integer("count").notNull(),
}, (table) => [uniqueIndex("rate_limit_bucket_unique").on(table.keyHash, table.windowStart)]);
