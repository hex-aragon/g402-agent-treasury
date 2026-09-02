import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";

const root = new URL("../", import.meta.url);

async function readProjectFile(path: string) {
  return readFile(new URL(path, root), "utf8");
}

function insertPayment(
  db: DatabaseSync,
  id: string,
  nonce: string,
  txHash: string | null,
  network = "eip155:84532",
  source = "facilitator",
) {
  db.prepare(
    `
    insert into payments (
      id, payment_id, fingerprint, nonce, tx_hash, network, payer, pay_to,
      asset, amount, status, source, created_at, updated_at
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  ).run(
    id,
    `payment-${id}`,
    `fingerprint-${id}`,
    nonce,
    txHash,
    network,
    `payer-${id}`,
    "merchant",
    "asset",
    "1",
    "settled",
    source,
    "2026-09-02T00:00:00.000Z",
    "2026-09-02T00:00:00.000Z",
  );
}

test("D1 migrations enforce one facilitator record per challenge and chain transaction", async () => {
  const db = new DatabaseSync(":memory:");
  db.exec(await readProjectFile("drizzle/0000_g402_facilitator_scan.sql"));
  db.exec(await readProjectFile("drizzle/0001_multichain_ledger.sql"));

  const indexes = db.prepare("pragma index_list('payments')").all() as Array<{
    name: string;
    unique: number;
    partial: number;
  }>;
  const byName = new Map(indexes.map((index) => [index.name, index]));

  assert.equal(byName.get("payments_facilitator_challenge_unique")?.unique, 1);
  assert.equal(byName.get("payments_facilitator_challenge_unique")?.partial, 1);
  assert.equal(byName.get("payments_facilitator_network_tx_unique")?.unique, 1);
  assert.equal(
    byName.get("payments_facilitator_network_tx_unique")?.partial,
    1,
  );
  assert.deepEqual(
    db
      .prepare("pragma index_info('payments_facilitator_network_tx_unique')")
      .all()
      .map((column) => column.name),
    ["network", "tx_hash"],
  );

  insertPayment(db, "first", "challenge-1", "0xabc");
  assert.throws(
    () => insertPayment(db, "duplicate-challenge", "challenge-1", "0xdef"),
    /UNIQUE constraint failed: payments\.nonce/,
  );
  assert.throws(
    () => insertPayment(db, "duplicate-tx", "challenge-2", "0xabc"),
    /UNIQUE constraint failed: payments\.network, payments\.tx_hash/,
  );

  insertPayment(db, "other-network", "challenge-3", "0xabc", "eip155:1");
  insertPayment(
    db,
    "indexed-chain",
    "challenge-1",
    "0xabc",
    "eip155:84532",
    "chain",
  );
  insertPayment(db, "null-tx-1", "challenge-4", null);
  insertPayment(db, "null-tx-2", "challenge-5", null);
});

test("D1 migration fails safely instead of deleting pre-existing duplicates", async () => {
  const db = new DatabaseSync(":memory:");
  db.exec(await readProjectFile("drizzle/0000_g402_facilitator_scan.sql"));
  insertPayment(db, "legacy-1", "legacy-challenge-1", "0xduplicate");
  insertPayment(db, "legacy-2", "legacy-challenge-2", "0xduplicate");
  const migration = await readProjectFile("drizzle/0001_multichain_ledger.sql");

  assert.throws(
    () => db.exec(migration),
    /UNIQUE constraint failed: payments\.network, payments\.tx_hash/,
  );
  assert.equal(
    (
      db.prepare("select count(*) as count from payments").get() as {
        count: number;
      }
    ).count,
    2,
  );
});

test("PostgreSQL migration preflights duplicates and records its ledger version", async () => {
  const migration = await readProjectFile(
    "db/migrations/014_multichain_ledger.sql",
  );

  assert.match(
    migration,
    /where source = 'facilitator' and tx_hash is not null/,
  );
  assert.match(migration, /group by network, tx_hash\s+having count\(\*\) > 1/);
  assert.match(
    migration,
    /create unique index if not exists payments_facilitator_network_tx_unique on payments\(network,tx_hash\) where source='facilitator' and tx_hash is not null/,
  );
  assert.match(
    migration,
    /insert into schema_migrations\(version\) values\('014_multichain_ledger'\) on conflict do nothing/,
  );
});

test("Drizzle journal and snapshots form one consistent migration chain", async () => {
  const journal = JSON.parse(
    await readProjectFile("drizzle/meta/_journal.json"),
  );
  const first = JSON.parse(
    await readProjectFile("drizzle/meta/0000_snapshot.json"),
  );
  const second = JSON.parse(
    await readProjectFile("drizzle/meta/0001_snapshot.json"),
  );

  assert.deepEqual(
    journal.entries.map((entry: { idx: number; tag: string }) => ({
      idx: entry.idx,
      tag: entry.tag,
    })),
    [
      { idx: 0, tag: "0000_g402_facilitator_scan" },
      { idx: 1, tag: "0001_multichain_ledger" },
    ],
  );
  assert.equal(first.dialect, "sqlite");
  assert.equal(second.dialect, "sqlite");
  assert.equal(second.prevId, first.id);

  const indexes = second.tables.payments.indexes;
  assert.equal(indexes.payments_facilitator_challenge_unique.isUnique, true);
  assert.equal(
    indexes.payments_facilitator_challenge_unique.where,
    '"payments"."source" = \'facilitator\'',
  );
  assert.deepEqual(indexes.payments_facilitator_network_tx_unique.columns, [
    "network",
    "tx_hash",
  ]);
  assert.equal(indexes.payments_facilitator_network_tx_unique.isUnique, true);
  assert.equal(
    indexes.payments_facilitator_network_tx_unique.where,
    '"payments"."source" = \'facilitator\' AND "payments"."tx_hash" IS NOT NULL',
  );
});
