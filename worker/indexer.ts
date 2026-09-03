import { createHash, randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type postgres from "postgres";
import { closePostgres, getPostgres } from "../db/postgres.ts";
import { GnoRpcClient } from "../lib/gno.ts";
import {
  decodeChainTransaction,
  extractG402Payments,
  txHash,
  type DecodedChainTransaction,
  type RpcEvent,
} from "../lib/indexer.ts";
import { alertOps, metrics } from "../lib/observability.ts";

type LogLevel = "info" | "warn" | "error";
type Checkpoint = {
  height: number;
  hash: string;
  parentHash: string;
  chainHeight: number;
  lastError: string | null;
  updatedAt: string | null;
};
type TickResult = {
  chainHeight: number;
  targetHeight: number;
  indexedHeight: number;
  processed: number;
  reorgs: number;
};

export type IndexerTickResult = TickResult & {
  acquired: boolean;
  handledReindexJob: boolean;
};

function boundedInteger(
  name: string,
  fallback: number,
  minimum: number,
  maximum: number,
) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, Math.trunc(parsed)));
}

const intervalMs = boundedInteger("INDEXER_INTERVAL_MS", 4_000, 1_000, 60_000);
const bootstrapDepth = boundedInteger(
  "INDEXER_BOOTSTRAP_DEPTH",
  100,
  1,
  100_000,
);
const batchSize = boundedInteger("INDEXER_BATCH_SIZE", 20, 1, 100);
const maxReorgDepth = boundedInteger(
  "INDEXER_MAX_REORG_DEPTH",
  100,
  5,
  1_000,
);
const confirmations = boundedInteger("INDEXER_CONFIRMATIONS", 2, 1, 100);
const maxTickMs = boundedInteger(
  "INDEXER_TICK_MAX_MS",
  45_000,
  5_000,
  300_000,
);
const leaseSeconds = Math.max(
  60,
  Math.ceil(intervalMs / 1_000) * 3,
  Math.ceil(maxTickMs / 1_000) + 15,
  boundedInteger("INDEXER_LEASE_SECONDS", 60, 30, 300),
);
const network = process.env.GNO_NETWORK_ID || "gno:pearl-1";
const chainId = process.env.GNO_CHAIN_ID || "pearl-1";
const configuredPaymentMode = process.env.G402_PAYMENT_MODE || "direct";
const paymentMode = configuredPaymentMode === "realm" ? "realm" : "direct";
const indexerMode =
  process.env.INDEXER_MODE === "scheduled" ? "scheduled" : "persistent";
const contractPath = process.env.G402_CONTRACT_PATH || "";
const workerId = randomUUID();
const leaseName = `g402-indexer:${network}`;
const rpc = new GnoRpcClient();
const stopController = new AbortController();

let sqlClient: ReturnType<typeof getPostgres> | null = null;
let ownsLease = false;
let lastObservedChainHeight = 0;
let lastProgressLogAt = 0;
let lastAlertAt = 0;
let lastAlertMessage = "";
let activeOneShot: Promise<IndexerTickResult> | null = null;

function database() {
  return (sqlClient ??= getPostgres());
}

function log(level: LogLevel, event: string, fields: Record<string, unknown> = {}) {
  const line = JSON.stringify({
    level,
    event,
    service: "g402-indexer",
    network,
    workerId,
    ...fields,
    at: new Date().toISOString(),
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

function paymentFingerprint(transactionHash: string) {
  return createHash("sha256")
    .update(`chain:${transactionHash}`)
    .digest("hex");
}

function errorMessage(error: unknown) {
  return (error instanceof Error ? error.message : String(error)).slice(0, 500);
}

function assertRuntimeSafety() {
  if (network.length > 80 || !/^gno:[a-z0-9-]{2,76}$/.test(network))
    throw new Error("invalid_gno_network_id");
  if (!chainId || chainId.length > 80) throw new Error("invalid_gno_chain_id");
  if (configuredPaymentMode !== "direct" && configuredPaymentMode !== "realm")
    throw new Error("invalid_g402_payment_mode");
  if (paymentMode === "realm" && !contractPath)
    throw new Error("G402_CONTRACT_PATH is required in realm mode");

  const mainnet = network === "gno:mainnet" || chainId === "mainnet";
  if (mainnet && process.env.G402_ALLOW_MAINNET !== "true")
    throw new Error("gno_mainnet_locked");
  if (mainnet)
    log("warn", "mainnet_indexing_enabled", {
      allowMainnet: true,
      chainId,
    });
}

function assertBlock(
  block: Awaited<ReturnType<GnoRpcClient["block"]>>,
  expectedHeight: number,
) {
  if (block.block.header.chain_id !== chainId)
    throw new Error("block_chain_id_mismatch");
  if (Number(block.block.header.height) !== expectedHeight)
    throw new Error("block_height_mismatch");
  if (!block.block_id.hash) throw new Error("block_hash_missing");
}

async function acquireLease() {
  const sql = database();
  const rows = await sql`
    insert into worker_leases(name, owner_id, expires_at, heartbeat_at)
    values(
      ${leaseName},
      ${workerId},
      now() + (${leaseSeconds} * interval '1 second'),
      now()
    )
    on conflict(name) do update set
      owner_id = excluded.owner_id,
      expires_at = excluded.expires_at,
      heartbeat_at = now()
    where worker_leases.expires_at <= now()
       or worker_leases.owner_id = ${workerId}
    returning owner_id
  `;
  const acquired =
    rows.length === 1 && String(rows[0].owner_id) === workerId;
  if (acquired && !ownsLease) log("info", "lease_acquired", { leaseSeconds });
  if (!acquired && ownsLease) log("warn", "lease_lost");
  ownsLease = acquired;
  return acquired;
}

async function renewLease() {
  const sql = database();
  const rows = await sql`
    update worker_leases
    set expires_at = now() + (${leaseSeconds} * interval '1 second'),
        heartbeat_at = now()
    where name = ${leaseName} and owner_id = ${workerId}
    returning owner_id
  `;
  if (rows.length !== 1) {
    ownsLease = false;
    throw new Error("indexer_lease_lost");
  }
}

async function fenceLease(tx: postgres.TransactionSql) {
  const rows = await tx`
    update worker_leases
    set expires_at = clock_timestamp() + (${leaseSeconds} * interval '1 second'),
        heartbeat_at = clock_timestamp()
    where name = ${leaseName} and owner_id = ${workerId}
    returning owner_id
  `;
  if (rows.length !== 1) {
    ownsLease = false;
    throw new Error("indexer_lease_lost");
  }
}

async function releaseLease() {
  if (!ownsLease) return;
  try {
    const sql = database();
    await sql`
      delete from worker_leases
      where name = ${leaseName} and owner_id = ${workerId}
    `;
    log("info", "lease_released");
  } catch (error) {
    log("warn", "lease_release_failed", { message: errorMessage(error) });
  } finally {
    ownsLease = false;
  }
}

async function checkpoint(): Promise<Checkpoint | null> {
  const sql = database();
  const rows = await sql`
    select height, block_hash, parent_hash, chain_height, last_error, updated_at
    from indexer_checkpoints
    where network = ${network}
    limit 1
  `;
  const row = rows[0];
  if (!row) return null;
  return {
    height: Number(row.height),
    hash: String(row.block_hash || ""),
    parentHash: String(row.parent_hash || ""),
    chainHeight: Number(row.chain_height || 0),
    lastError: row.last_error == null ? null : String(row.last_error),
    updatedAt:
      row.updated_at == null
        ? null
        : new Date(row.updated_at as Date).toISOString(),
  };
}

async function chainStatus() {
  const status = await rpc.status();
  if (status.node_info.network !== chainId)
    throw new Error("rpc_chain_id_mismatch");
  const height = Number(status.sync_info.latest_block_height);
  if (!Number.isSafeInteger(height) || height < 0)
    throw new Error("rpc_height_invalid");
  lastObservedChainHeight = height;
  return { height, catchingUp: Boolean(status.sync_info.catching_up) };
}

async function initializeCheckpoint(chainHeight: number, targetHeight: number) {
  const existing = await checkpoint();
  if (existing) return existing;

  const firstHeight = Math.max(1, targetHeight - bootstrapDepth + 1);
  const anchorHeight = firstHeight - 1;
  let anchorHash = "";
  let anchorParentHash = "";
  let anchorTime: string | null = null;
  let anchorTxCount = 0;

  if (anchorHeight > 0) {
    await renewLease();
    const anchor = await rpc.block(anchorHeight);
    assertBlock(anchor, anchorHeight);
    anchorHash = anchor.block_id.hash;
    anchorParentHash = anchor.block.header.last_block_id?.hash || "";
    anchorTime = anchor.block.header.time || null;
    anchorTxCount = anchor.block.data.txs?.length || 0;
  }

  const sql = database();
  await sql.begin(async (tx) => {
    await fenceLease(tx);
    if (anchorHeight > 0) {
      await tx`
        update indexed_blocks
        set canonical = false
        where network = ${network}
          and height = ${anchorHeight}
          and block_hash <> ${anchorHash}
          and canonical = true
      `;
      await tx`
        insert into indexed_blocks(
          network, height, block_hash, parent_hash, block_time,
          canonical, tx_count, indexed_at
        ) values(
          ${network}, ${anchorHeight}, ${anchorHash},
          ${anchorParentHash || null}, ${anchorTime}, true, ${anchorTxCount}, now()
        )
        on conflict(network, height, block_hash) do update set
          parent_hash = excluded.parent_hash,
          block_time = excluded.block_time,
          canonical = true,
          tx_count = excluded.tx_count,
          indexed_at = now()
      `;
    }
    await tx`
      insert into indexer_checkpoints(
        network, height, block_hash, parent_hash, chain_height, last_error, updated_at
      ) values(
        ${network}, ${anchorHeight}, ${anchorHash}, ${anchorParentHash || null},
        ${chainHeight}, null, now()
      )
      on conflict(network) do nothing
    `;
  });

  const initialized = await checkpoint();
  if (!initialized) throw new Error("checkpoint_initialization_failed");
  log("info", "checkpoint_bootstrapped", {
    anchorHeight,
    firstHeight,
    targetHeight,
    bootstrapDepth,
  });
  return initialized;
}

async function maybeReanchorScheduledCheckpoint(
  current: Checkpoint,
  chainHeight: number,
  targetHeight: number,
) {
  if (indexerMode !== "scheduled") return current;

  const lag = Math.max(0, targetHeight - current.height);
  if (lag <= bootstrapDepth) return current;

  // A daily serverless invocation cannot drain an arbitrarily old checkpoint.
  // Preserve all existing history and add a verifiable anchor for the recent window.
  const anchorHeight = Math.min(
    targetHeight,
    Math.max(current.height, targetHeight - bootstrapDepth),
  );
  if (anchorHeight <= current.height) return current;

  await renewLease();
  const anchor = await rpc.block(anchorHeight);
  assertBlock(anchor, anchorHeight);
  const anchorHash = anchor.block_id.hash;
  const anchorParentHash = anchor.block.header.last_block_id?.hash || "";
  const anchorTime = anchor.block.header.time || null;
  const anchorTxCount = anchor.block.data.txs?.length || 0;
  const sql = database();
  const rows = await sql.begin(async (tx) => {
    await fenceLease(tx);
    const canonical = await tx`
      select block_hash
      from indexed_blocks
      where network = ${network} and height = ${anchorHeight} and canonical = true
      for update
    `;
    if (
      canonical[0] &&
      String(canonical[0].block_hash) !== anchorHash
    )
      throw new Error("scheduled_reanchor_canonical_conflict");

    await tx`
      insert into indexed_blocks(
        network, height, block_hash, parent_hash, block_time,
        canonical, tx_count, indexed_at
      ) values(
        ${network}, ${anchorHeight}, ${anchorHash}, ${anchorParentHash || null},
        ${anchorTime}, true, ${anchorTxCount}, now()
      )
      on conflict(network, height, block_hash) do update set
        parent_hash = excluded.parent_hash,
        block_time = excluded.block_time,
        canonical = true,
        tx_count = excluded.tx_count,
        indexed_at = now()
    `;
    return tx`
      update indexer_checkpoints
      set height = ${anchorHeight},
          block_hash = ${anchorHash},
          parent_hash = ${anchorParentHash || null},
          chain_height = ${chainHeight},
          last_error = null,
          updated_at = now()
      where network = ${network} and height = ${current.height}
      returning height, block_hash, parent_hash, chain_height, last_error, updated_at
    `;
  });
  if (!rows[0]) {
    const latest = await checkpoint();
    if (!latest) throw new Error("scheduled_reanchor_checkpoint_missing");
    return latest;
  }

  const reanchored: Checkpoint = {
    height: Number(rows[0].height),
    hash: String(rows[0].block_hash || ""),
    parentHash: String(rows[0].parent_hash || ""),
    chainHeight: Number(rows[0].chain_height || 0),
    lastError:
      rows[0].last_error == null ? null : String(rows[0].last_error),
    updatedAt:
      rows[0].updated_at instanceof Date
        ? rows[0].updated_at.toISOString()
        : String(rows[0].updated_at),
  };
  log("warn", "checkpoint_scheduled_reanchored", {
    previousHeight: current.height,
    anchorHeight: reanchored.height,
    skippedFromHeight: current.height + 1,
    skippedToHeight: reanchored.height - 1,
    skippedBlocks: Math.max(0, reanchored.height - current.height - 1),
    chainHeight,
    targetHeight,
    previousLag: lag,
    bootstrapDepth,
  });
  metrics.inc("g402_scheduled_reanchors", { network });
  return reanchored;
}

async function commonAncestor(startHeight: number) {
  const lowerBound = Math.max(1, startHeight - maxReorgDepth);
  const sql = database();
  for (let height = startHeight; height >= lowerBound; height--) {
    await renewLease();
    const rows = await sql`
      select block_hash
      from indexed_blocks
      where network = ${network} and height = ${height} and canonical = true
      limit 1
    `;
    if (!rows[0]) continue;
    const block = await rpc.block(height);
    assertBlock(block, height);
    if (block.block_id.hash === String(rows[0].block_hash)) return height;
  }
  throw new Error("reorg_exceeds_max_depth");
}

async function rewindTo(height: number, chainHeight: number) {
  await renewLease();
  const sql = database();
  await sql.begin(async (tx) => {
    await fenceLease(tx);
    const rows =
      height > 0
        ? await tx`
            select block_hash, parent_hash
            from indexed_blocks
            where network = ${network} and height = ${height} and canonical = true
            limit 1
          `
        : [];
    const hash = String(rows[0]?.block_hash || "");
    const parentHash = String(rows[0]?.parent_hash || "");

    await tx`
      update indexed_blocks
      set canonical = false
      where network = ${network} and height > ${height} and canonical = true
    `;
    await tx`
      update chain_transactions
      set canonical = false
      where network = ${network} and height > ${height} and canonical = true
    `;
    await tx`
      update chain_events
      set canonical = false
      where network = ${network} and height > ${height} and canonical = true
    `;
    await tx`
      update payments
      set status = 'reverted', confirmations = 0, updated_at = now()
      where network = ${network}
        and block_height > ${height}
        and status = 'settled'
    `;
    await tx`
      insert into indexer_checkpoints(
        network, height, block_hash, parent_hash, chain_height, last_error, updated_at
      ) values(
        ${network}, ${height}, ${hash}, ${parentHash || null},
        ${chainHeight}, null, now()
      )
      on conflict(network) do update set
        height = excluded.height,
        block_hash = excluded.block_hash,
        parent_hash = excluded.parent_hash,
        chain_height = excluded.chain_height,
        last_error = null,
        updated_at = now()
    `;
  });
}

function authenticPayment(
  decoded: DecodedChainTransaction,
  code: number,
  txIndex: number,
  realmEvents: ReturnType<typeof extractG402Payments>,
) {
  if (
    code !== 0 ||
    !decoded.paymentId ||
    !decoded.nonce ||
    !decoded.resourceHash ||
    !decoded.signer ||
    !decoded.recipient ||
    !decoded.amount ||
    !decoded.asset ||
    !/^[1-9][0-9]*$/.test(decoded.amount)
  )
    return false;

  if (paymentMode === "direct")
    return decoded.kind === "native" || decoded.kind === "grc20";

  if (decoded.kind !== "realm" || decoded.contractPath !== contractPath)
    return false;
  return realmEvents.some(
    (event) =>
      event.txIndex === txIndex &&
      event.paymentId === decoded.paymentId &&
      event.nonce === decoded.nonce &&
      event.resourceHash === decoded.resourceHash &&
      event.payer === decoded.signer &&
      event.recipient === decoded.recipient &&
      event.amount === decoded.amount,
  );
}

async function persistBlock(
  block: Awaited<ReturnType<GnoRpcClient["block"]>>,
  results: Awaited<ReturnType<GnoRpcClient["blockResults"]>>,
  chainHeight: number,
) {
  const height = Number(block.block.header.height);
  const blockHash = block.block_id.hash;
  const parentHash = block.block.header.last_block_id?.hash || "";
  const blockTime = block.block.header.time || null;
  const txs = block.block.data.txs || [];
  const resultRows = results.txs_results || [];
  const realmEvents = extractG402Payments(results, contractPath);
  const blockConfirmations = Math.min(
    confirmations,
    Math.max(1, chainHeight - height + 1),
  );
  const sql = database();

  await sql.begin(async (tx) => {
    await fenceLease(tx);
    await tx`
      update indexed_blocks
      set canonical = false
      where network = ${network}
        and height = ${height}
        and block_hash <> ${blockHash}
        and canonical = true
    `;
    await tx`
      update chain_transactions
      set canonical = false
      where network = ${network}
        and height = ${height}
        and block_hash <> ${blockHash}
        and canonical = true
    `;
    await tx`
      update chain_events
      set canonical = false
      where network = ${network} and height = ${height} and canonical = true
    `;
    await tx`
      insert into indexed_blocks(
        network, height, block_hash, parent_hash, block_time,
        canonical, tx_count, indexed_at
      ) values(
        ${network}, ${height}, ${blockHash}, ${parentHash || null}, ${blockTime},
        true, ${txs.length}, now()
      )
      on conflict(network, height, block_hash) do update set
        parent_hash = excluded.parent_hash,
        block_time = excluded.block_time,
        canonical = true,
        tx_count = excluded.tx_count,
        indexed_at = now()
    `;

    for (let txIndex = 0; txIndex < txs.length; txIndex++) {
      const encoded = txs[txIndex];
      const hash = txHash(encoded);
      const decoded = decodeChainTransaction(encoded);
      const result = resultRows[txIndex];
      const code = Number(result?.code ?? 1);
      const events = (result?.events || []) as RpcEvent[];

      await tx`
        insert into chain_transactions(
          tx_hash, network, height, tx_index, block_hash, block_time,
          code, log, memo, signer, recipient, asset, amount, kind,
          payment_id, nonce, resource_hash, canonical, indexed_at
        ) values(
          ${hash}, ${network}, ${height}, ${txIndex}, ${blockHash}, ${blockTime},
          ${code}, ${result?.log || null}, ${decoded.memo || null},
          ${decoded.signer || null}, ${decoded.recipient || null},
          ${decoded.asset || null}, ${decoded.amount || null}, ${decoded.kind},
          ${decoded.paymentId || null}, ${decoded.nonce || null},
          ${decoded.resourceHash || null}, true, now()
        )
        on conflict(tx_hash) do update set
          network = excluded.network,
          height = excluded.height,
          tx_index = excluded.tx_index,
          block_hash = excluded.block_hash,
          block_time = excluded.block_time,
          code = excluded.code,
          log = excluded.log,
          memo = excluded.memo,
          signer = excluded.signer,
          recipient = excluded.recipient,
          asset = excluded.asset,
          amount = excluded.amount,
          kind = excluded.kind,
          payment_id = excluded.payment_id,
          nonce = excluded.nonce,
          resource_hash = excluded.resource_hash,
          canonical = true,
          indexed_at = now()
      `;

      for (let eventIndex = 0; eventIndex < events.length; eventIndex++) {
        const event = events[eventIndex];
        const eventType = `${event.pkg_path || ""}:${event.type}`.slice(0, 300);
        const attributes = Object.fromEntries(
          event.attributes.map((attribute) => [attribute.key, attribute.value]),
        );
        await tx`
          insert into chain_events(
            id, tx_hash, network, height, event_type, attributes, canonical, created_at
          ) values(
            ${`${hash}:${eventIndex}`}, ${hash}, ${network}, ${height},
            ${eventType},
            ${JSON.stringify(attributes)}::jsonb, true, now()
          )
          on conflict(id) do update set
            tx_hash = excluded.tx_hash,
            network = excluded.network,
            height = excluded.height,
            event_type = excluded.event_type,
            attributes = excluded.attributes,
            canonical = true,
            created_at = now()
        `;
      }

      if (authenticPayment(decoded, code, txIndex, realmEvents)) {
        const updated = await tx`
          update payments
          set tx_hash = ${hash},
              status = 'settled',
              error = null,
              block_height = ${height},
              block_hash = ${blockHash},
              confirmations = ${blockConfirmations},
              updated_at = now()
          where payment_id = ${decoded.paymentId!}
            and network = ${network}
            and nonce = ${decoded.nonce!}
            and resource_hash = ${decoded.resourceHash!}
            and payer = ${decoded.signer}
            and pay_to = ${decoded.recipient}
            and asset = ${decoded.asset}
            and amount = ${decoded.amount}
            and (tx_hash is null or tx_hash = ${hash})
          returning payment_id
        `;
        if (updated.length === 0) {
          await tx`
            insert into payments(
              id, payment_id, fingerprint, nonce, tx_hash, network, payer,
              pay_to, asset, amount, status, error, resource_hash, source,
              block_height, block_hash, confirmations, created_at, updated_at
            ) values(
              ${randomUUID()}, ${decoded.paymentId!}, ${paymentFingerprint(hash)},
              ${decoded.nonce!}, ${hash}, ${network}, ${decoded.signer},
              ${decoded.recipient}, ${decoded.asset}, ${decoded.amount},
              'settled', null, ${decoded.resourceHash!}, 'chain', ${height},
              ${blockHash}, ${blockConfirmations}, ${blockTime || new Date()}, now()
            )
            on conflict do nothing
          `;
        }
      }
    }

    await tx`
      update payments
      set confirmations = least(
            ${confirmations},
            greatest(0, ${chainHeight} - block_height + 1)
          ),
          updated_at = now()
      where network = ${network}
        and status = 'settled'
        and block_height is not null
    `;
    await tx`
      insert into indexer_checkpoints(
        network, height, block_hash, parent_hash, chain_height, last_error, updated_at
      ) values(
        ${network}, ${height}, ${blockHash}, ${parentHash || null},
        ${chainHeight}, null, now()
      )
      on conflict(network) do update set
        height = excluded.height,
        block_hash = excluded.block_hash,
        parent_hash = excluded.parent_hash,
        chain_height = excluded.chain_height,
        last_error = null,
        updated_at = now()
    `;
  });
}

async function indexNextBlock(current: Checkpoint, chainHeight: number) {
  await renewLease();
  const height = current.height + 1;
  const [block, results] = await Promise.all([
    rpc.block(height),
    rpc.blockResults(height),
  ]);
  assertBlock(block, height);
  if (Number(results.height) !== height)
    throw new Error("block_results_height_mismatch");
  const parentHash = block.block.header.last_block_id?.hash || "";

  if (current.height > 0 && current.hash && parentHash !== current.hash) {
    const ancestor = await commonAncestor(current.height);
    await rewindTo(ancestor, chainHeight);
    metrics.inc("g402_reorgs", { network });
    log("warn", "reorg_detected", {
      checkpointHeight: current.height,
      checkpointHash: current.hash,
      incomingHeight: height,
      incomingParentHash: parentHash,
      rewindTo: ancestor,
    });
    await alertOps("g402 chain reorg detected", {
      network,
      checkpointHeight: current.height,
      checkpointHash: current.hash,
      incomingHeight: height,
      incomingParentHash: parentHash,
      rewindTo: ancestor,
    });
    return { reorg: true as const, checkpoint: await checkpoint() };
  }

  await persistBlock(block, results, chainHeight);
  metrics.inc("g402_blocks_indexed", { network });
  return {
    reorg: false as const,
    checkpoint: {
      height,
      hash: block.block_id.hash,
      parentHash,
      chainHeight,
      lastError: null,
      updatedAt: new Date().toISOString(),
    } satisfies Checkpoint,
  };
}

async function tick(upperBound?: number): Promise<TickResult> {
  const deadline = Date.now() + maxTickMs;
  await renewLease();
  const status = await chainStatus();
  if (status.catchingUp)
    log("warn", "rpc_node_catching_up", { chainHeight: status.height });

  const targetHeight = Math.max(0, status.height - confirmations + 1);
  const maximumHeight = Math.min(targetHeight, upperBound ?? targetHeight);
  let current = await initializeCheckpoint(status.height, targetHeight);
  if (upperBound === undefined)
    current = await maybeReanchorScheduledCheckpoint(
      current,
      status.height,
      targetHeight,
    );
  let processed = 0;
  let reorgs = 0;

  while (
    !stopController.signal.aborted &&
    current.height < maximumHeight &&
    processed < batchSize &&
    Date.now() < deadline
  ) {
    const result = await indexNextBlock(current, status.height);
    if (result.reorg) {
      reorgs += 1;
      if (reorgs > 2) throw new Error("chain_unstable_during_tick");
      if (!result.checkpoint) throw new Error("checkpoint_missing_after_rewind");
      current = result.checkpoint;
      continue;
    }
    current = result.checkpoint;
    processed += 1;
  }

  await renewLease();
  const sql = database();
  await sql`
    update indexer_checkpoints
    set chain_height = ${status.height}, last_error = null, updated_at = now()
    where network = ${network}
  `;

  const now = Date.now();
  if (processed > 0 || reorgs > 0 || now - lastProgressLogAt >= 60_000) {
    log("info", "tick_complete", {
      chainHeight: status.height,
      targetHeight,
      indexedHeight: current.height,
      lag: Math.max(0, status.height - current.height),
      processed,
      reorgs,
      batchSize,
      maxTickMs,
      boundedBy:
        current.height >= maximumHeight
          ? "height"
          : processed >= batchSize
            ? "batch"
            : "time",
    });
    lastProgressLogAt = now;
  }

  return {
    chainHeight: status.height,
    targetHeight,
    indexedHeight: current.height,
    processed,
    reorgs,
  };
}

async function processReindexJob(): Promise<TickResult | null> {
  const sql = database();
  const rows = await sql`
    with candidate as (
      select id
      from indexer_jobs
      where network = ${network}
        and exists(
          select 1 from worker_leases
          where name = ${leaseName}
            and owner_id = ${workerId}
            and expires_at > clock_timestamp()
        )
        and (
          status = 'queued'
          or (
            status = 'running'
            and updated_at < clock_timestamp()
              - (${leaseSeconds * 2} * interval '1 second')
          )
        )
      order by created_at
      for update skip locked
      limit 1
    )
    update indexer_jobs as job
    set status = 'running', attempts = attempts + 1, updated_at = now()
    from candidate
    where job.id = candidate.id
    returning job.id, job.from_height, job.to_height, job.attempts
  `;
  if (!rows[0]) return null;

  const id = String(rows[0].id);
  const attempt = Number(rows[0].attempts);
  const fromHeight = Number(rows[0].from_height);
  const toHeight = Number(rows[0].to_height);
  if (
    !Number.isSafeInteger(fromHeight) ||
    !Number.isSafeInteger(toHeight) ||
    fromHeight < 1 ||
    toHeight < fromHeight
  ) {
    await sql`
      update indexer_jobs
      set status = 'failed', last_error = 'invalid_reindex_range', updated_at = now()
      where id = ${id} and attempts = ${attempt}
        and exists(
          select 1 from worker_leases
          where name = ${leaseName} and owner_id = ${workerId}
        )
    `;
    log("error", "reindex_job_invalid", { jobId: id, fromHeight, toHeight });
    return tick();
  }

  try {
    const current = await checkpoint();
    if (current && fromHeight <= current.height)
      await rewindTo(Math.max(0, fromHeight - 1), current.chainHeight);

    const result = await tick(toHeight);
    if (result.indexedHeight >= toHeight) {
      await sql`
        update indexer_jobs
        set status = 'complete', last_error = null, updated_at = now()
        where id = ${id} and attempts = ${attempt}
          and exists(
            select 1 from worker_leases
            where name = ${leaseName} and owner_id = ${workerId}
          )
      `;
      log("info", "reindex_job_complete", {
        jobId: id,
        fromHeight,
        toHeight,
        indexedHeight: result.indexedHeight,
      });
    } else {
      await sql`
        update indexer_jobs
        set status = 'queued',
            from_height = ${result.indexedHeight + 1},
            last_error = null,
            updated_at = now()
        where id = ${id} and attempts = ${attempt}
          and exists(
            select 1 from worker_leases
            where name = ${leaseName} and owner_id = ${workerId}
          )
      `;
      log("info", "reindex_job_batched", {
        jobId: id,
        nextHeight: result.indexedHeight + 1,
        toHeight,
      });
    }
    return result;
  } catch (error) {
    const message = errorMessage(error);
    await sql`
      update indexer_jobs
      set status = 'failed', last_error = ${message}, updated_at = now()
      where id = ${id} and attempts = ${attempt}
        and exists(
          select 1 from worker_leases
          where name = ${leaseName} and owner_id = ${workerId}
        )
    `;
    throw error;
  }
}

async function recordCheckpointError(message: string) {
  if (!ownsLease) return;
  try {
    await renewLease();
    const sql = database();
    await sql`
      insert into indexer_checkpoints(
        network, height, block_hash, parent_hash, chain_height, last_error, updated_at
      ) values(
        ${network}, 0, '', null, ${lastObservedChainHeight}, ${message}, now()
      )
      on conflict(network) do update set
        chain_height = greatest(
          indexer_checkpoints.chain_height,
          excluded.chain_height
        ),
        last_error = excluded.last_error,
        updated_at = now()
    `;
  } catch (error) {
    log("error", "checkpoint_error_write_failed", {
      message: errorMessage(error),
      originalMessage: message,
    });
  }
}

async function alertFailure(message: string) {
  const now = Date.now();
  if (message === lastAlertMessage && now - lastAlertAt < 60_000) return;
  lastAlertMessage = message;
  lastAlertAt = now;
  await alertOps("g402 indexer failed", { network, message, workerId });
}

async function handleCycleFailure(error: unknown) {
  const message = errorMessage(error);
  log("error", "index_failed", { message });
  await recordCheckpointError(message);
  await alertFailure(message);
}

async function runOwnedCycle() {
  const reindexResult = await processReindexJob();
  return {
    result: reindexResult ?? (await tick()),
    handledReindexJob: reindexResult !== null,
  };
}

async function runOneShot(): Promise<IndexerTickResult> {
  assertRuntimeSafety();
  if (!(await acquireLease())) {
    const current = await checkpoint();
    return {
      acquired: false,
      handledReindexJob: false,
      chainHeight: current?.chainHeight || 0,
      targetHeight: Math.max(
        0,
        (current?.chainHeight || 0) - confirmations + 1,
      ),
      indexedHeight: current?.height || 0,
      processed: 0,
      reorgs: 0,
    };
  }

  try {
    const cycle = await runOwnedCycle();
    return {
      acquired: true,
      handledReindexJob: cycle.handledReindexJob,
      ...cycle.result,
    };
  } catch (error) {
    await handleCycleFailure(error);
    throw error;
  } finally {
    await releaseLease();
  }
}

/** Run one bounded indexing batch without starting the persistent worker loop. */
export function runIndexerTick(): Promise<IndexerTickResult> {
  if (activeOneShot) return activeOneShot;
  activeOneShot = runOneShot().finally(() => {
    activeOneShot = null;
  });
  return activeOneShot;
}

function sleep(ms: number) {
  return new Promise<void>((resolveSleep) => {
    if (stopController.signal.aborted) return resolveSleep();
    let timer: ReturnType<typeof setTimeout>;
    const finish = () => {
      clearTimeout(timer);
      stopController.signal.removeEventListener("abort", finish);
      resolveSleep();
    };
    timer = setTimeout(finish, ms);
    stopController.signal.addEventListener("abort", finish, { once: true });
  });
}

async function runPersistentWorker() {
  assertRuntimeSafety();
  log("info", "indexer_started", {
    chainId,
    paymentMode,
    indexerMode,
    contractPath: paymentMode === "realm" ? contractPath : null,
    intervalMs,
    bootstrapDepth,
    batchSize,
    maxTickMs,
    maxReorgDepth,
    confirmations,
    leaseSeconds,
    mainnetLocked: process.env.G402_ALLOW_MAINNET !== "true",
  });

  try {
    while (!stopController.signal.aborted) {
      try {
        if (await acquireLease()) await runOwnedCycle();
      } catch (error) {
        await handleCycleFailure(error);
      }
      await sleep(intervalMs);
    }
  } finally {
    await releaseLease();
    if (sqlClient) await closePostgres();
    log("info", "indexer_stopped");
  }
}

function isDirectEntry() {
  return Boolean(
    process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url),
  );
}

if (isDirectEntry()) {
  for (const signal of ["SIGTERM", "SIGINT"] as const) {
    process.once(signal, () => {
      log("info", "shutdown_requested", { signal });
      stopController.abort();
    });
  }
  void runPersistentWorker().catch((error) => {
    log("error", "indexer_fatal", { message: errorMessage(error) });
    process.exitCode = 1;
  });
}
