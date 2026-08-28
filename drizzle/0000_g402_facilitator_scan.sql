CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`target` text,
	`metadata_json` text DEFAULT '{}' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `audit_log_created_idx` ON `audit_log` (`created_at`);--> statement-breakpoint
CREATE TABLE `chain_events` (
	`id` text PRIMARY KEY NOT NULL,
	`tx_hash` text NOT NULL,
	`network` text NOT NULL,
	`height` integer NOT NULL,
	`event_type` text NOT NULL,
	`attributes_json` text NOT NULL,
	`canonical` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `chain_events_tx_idx` ON `chain_events` (`tx_hash`);--> statement-breakpoint
CREATE INDEX `chain_events_height_idx` ON `chain_events` (`network`,`height`);--> statement-breakpoint
CREATE TABLE `chain_transactions` (
	`tx_hash` text PRIMARY KEY NOT NULL,
	`network` text NOT NULL,
	`height` integer NOT NULL,
	`tx_index` integer NOT NULL,
	`block_hash` text NOT NULL,
	`block_time` text,
	`code` integer DEFAULT 0 NOT NULL,
	`log` text,
	`memo` text,
	`signer` text,
	`recipient` text,
	`asset` text,
	`amount` text,
	`kind` text,
	`payment_id` text,
	`nonce` text,
	`resource_hash` text,
	`canonical` integer DEFAULT true NOT NULL,
	`indexed_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `chain_transactions_height_idx` ON `chain_transactions` (`network`,`height`);--> statement-breakpoint
CREATE INDEX `chain_transactions_payment_idx` ON `chain_transactions` (`payment_id`);--> statement-breakpoint
CREATE INDEX `chain_transactions_signer_idx` ON `chain_transactions` (`signer`);--> statement-breakpoint
CREATE INDEX `chain_transactions_recipient_idx` ON `chain_transactions` (`recipient`);--> statement-breakpoint
CREATE TABLE `indexed_blocks` (
	`network` text NOT NULL,
	`height` integer NOT NULL,
	`block_hash` text NOT NULL,
	`parent_hash` text,
	`block_time` text,
	`canonical` integer DEFAULT true NOT NULL,
	`tx_count` integer DEFAULT 0 NOT NULL,
	`indexed_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `indexed_blocks_fork_unique` ON `indexed_blocks` (`network`,`height`,`block_hash`);--> statement-breakpoint
CREATE INDEX `indexed_blocks_canonical_height_idx` ON `indexed_blocks` (`network`,`canonical`,`height`);--> statement-breakpoint
CREATE INDEX `indexed_blocks_hash_idx` ON `indexed_blocks` (`block_hash`);--> statement-breakpoint
CREATE TABLE `indexer_checkpoints` (
	`network` text PRIMARY KEY NOT NULL,
	`height` integer NOT NULL,
	`block_hash` text NOT NULL,
	`parent_hash` text,
	`chain_height` integer DEFAULT 0 NOT NULL,
	`last_error` text,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `payment_challenges` (
	`nonce` text PRIMARY KEY NOT NULL,
	`resource` text NOT NULL,
	`resource_hash` text NOT NULL,
	`method` text NOT NULL,
	`network` text NOT NULL,
	`chain_id` text NOT NULL,
	`asset` text NOT NULL,
	`denom` text NOT NULL,
	`amount` text NOT NULL,
	`pay_to` text NOT NULL,
	`payment_mode` text NOT NULL,
	`contract_path` text,
	`extra_json` text DEFAULT '{}' NOT NULL,
	`expires_at` integer NOT NULL,
	`consumed_by` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `payment_challenges_expiry_idx` ON `payment_challenges` (`expires_at`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`payment_id` text NOT NULL,
	`fingerprint` text NOT NULL,
	`nonce` text NOT NULL,
	`tx_hash` text,
	`network` text NOT NULL,
	`payer` text NOT NULL,
	`pay_to` text NOT NULL,
	`asset` text NOT NULL,
	`amount` text NOT NULL,
	`status` text NOT NULL,
	`error` text,
	`resource_hash` text,
	`source` text DEFAULT 'facilitator' NOT NULL,
	`block_height` integer,
	`block_hash` text,
	`confirmations` integer DEFAULT 0 NOT NULL,
	`merchant_id` text,
	`agent_id` text,
	`policy_id` text,
	`service_quote_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payments_payment_id_unique` ON `payments` (`payment_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `payments_fingerprint_unique` ON `payments` (`fingerprint`);--> statement-breakpoint
CREATE UNIQUE INDEX `payments_nonce_unique` ON `payments` (`network`,`payer`,`nonce`);--> statement-breakpoint
CREATE INDEX `payments_tx_hash_idx` ON `payments` (`tx_hash`);--> statement-breakpoint
CREATE INDEX `payments_created_at_idx` ON `payments` (`created_at`);--> statement-breakpoint
CREATE TABLE `rate_limit_buckets` (
	`key_hash` text NOT NULL,
	`window_start` integer NOT NULL,
	`count` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rate_limit_bucket_unique` ON `rate_limit_buckets` (`key_hash`,`window_start`);