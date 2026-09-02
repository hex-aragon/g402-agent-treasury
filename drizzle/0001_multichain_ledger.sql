CREATE UNIQUE INDEX `payments_facilitator_challenge_unique` ON `payments` (`nonce`) WHERE "payments"."source" = 'facilitator';--> statement-breakpoint
CREATE UNIQUE INDEX `payments_facilitator_network_tx_unique` ON `payments` (`network`,`tx_hash`) WHERE "payments"."source" = 'facilitator' AND "payments"."tx_hash" IS NOT NULL;--> statement-breakpoint
CREATE INDEX `payments_network_tx_idx` ON `payments` (`network`,`tx_hash`);--> statement-breakpoint
CREATE INDEX `payments_network_asset_created_idx` ON `payments` (`network`,`asset`,`created_at`);