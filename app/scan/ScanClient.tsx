"use client";

import { useState, type FormEvent } from "react";
import type {
  ScanBlock,
  ScanStatus,
  ScanTransaction,
} from "@/lib/scan";

type ScanPayload = {
  status: ScanStatus;
  blocks: ScanBlock[];
  transactions: ScanTransaction[];
};

function short(value: string | null, front = 9, back = 6) {
  if (!value) return "—";
  return value.length > front + back + 1
    ? `${value.slice(0, front)}…${value.slice(-back)}`
    : value;
}

function time(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("ko-KR");
}

export default function ScanClient({
  initial,
  indexerMode,
}: {
  initial: ScanPayload;
  indexerMode: "scheduled" | "persistent";
}) {
  const [data, setData] = useState(initial);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load(searchQuery: string) {
    const response = await fetch(
      `/api/v1/scan?q=${encodeURIComponent(searchQuery)}`,
      { cache: "no-store" },
    );
    const body = (await response.json()) as ScanPayload & { error?: string };
    if (!response.ok) throw new Error(body.error || "scan_load_failed");
    setData(body);
  }

  async function refresh(searchQuery = query) {
    setBusy(true);
    setError("");
    try {
      await load(searchQuery);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "scan_load_failed");
    } finally {
      setBusy(false);
    }
  }

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void refresh(query);
  }

  const status = data.status;
  return (
    <>
      <section className="scanToolbar card">
        <form onSubmit={search} className="scanSearch">
          <input
            aria-label="Search chain"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="TX hash, payment ID, address or block height"
          />
          <button className="button" type="submit" disabled={busy}>
            {busy ? "Working…" : "Search"}
          </button>
        </form>
        <button
          className="button secondary"
          type="button"
          onClick={() => void refresh()}
          disabled={busy}
        >
          Refresh
        </button>
        <p className="mutedText" aria-live="polite">
          Synchronization is managed by the {indexerMode === "scheduled" ? "scheduled function" : "persistent worker"}.
          This view never triggers a chain sync.
        </p>
      </section>

      {error ? (
        <div className="errorBanner" role="alert">
          {error}
        </div>
      ) : null}

      <section className="grid stats">
        <div className="card stat">
          <label>CHAIN HEIGHT</label>
          <strong>{status.chainHeight || "—"}</strong>
        </div>
        <div className="card stat">
          <label>INDEXED HEIGHT</label>
          <strong>{status.indexedHeight || "—"}</strong>
        </div>
        <div className="card stat">
          <label>INDEX LAG</label>
          <strong className={status.lag > 5 ? "pending" : "success"}>
            {status.lag}
          </strong>
          <small>blocks</small>
        </div>
        <div className="card stat">
          <label>G402 PAYMENTS</label>
          <strong>{status.settledPayments}</strong>
          <small>settled</small>
        </div>
      </section>

      <section className="grid scanLayout">
        <div className="card">
          <div className="sectionTitle">
            <div>
              <div className="eyebrow">Canonical chain</div>
              <h2>Transactions</h2>
            </div>
            <span className="mutedText">
              {data.transactions.length} results
            </span>
          </div>
          <div className="tableWrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Hash</th>
                  <th>Block</th>
                  <th>Time</th>
                  <th>Route</th>
                  <th>Amount</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {data.transactions.length ? (
                  data.transactions.map((transaction) => (
                    <tr key={transaction.txHash}>
                      <td>
                        <details>
                          <summary className="mono scanLink">
                            {short(transaction.txHash)}
                          </summary>
                          <div className="txDetail">
                            <p>
                              <b>Transaction</b>
                              <span className="mono">
                                {transaction.txHash}
                              </span>
                            </p>
                            <p>
                              <b>Memo</b>
                              <span className="mono">
                                {transaction.memo || "—"}
                              </span>
                            </p>
                            <p>
                              <b>Payment ID</b>
                              <span className="mono">
                                {transaction.paymentId || "—"}
                              </span>
                            </p>
                            <p>
                              <b>Block hash</b>
                              <span className="mono">
                                {transaction.blockHash}
                              </span>
                            </p>
                            {transaction.log ? (
                              <p>
                                <b>Log</b>
                                <span>{transaction.log}</span>
                              </p>
                            ) : null}
                          </div>
                        </details>
                      </td>
                      <td>#{transaction.height}</td>
                      <td>{time(transaction.blockTime)}</td>
                      <td className="mono">
                        {short(transaction.signer)} →{" "}
                        {short(transaction.recipient)}
                      </td>
                      <td>
                        {transaction.amount || "—"}{" "}
                        <span className="mutedText">
                          {short(transaction.asset, 6, 4)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`${
                            transaction.code === 0 ? "success" : "failed"
                          } badge`}
                        >
                          {transaction.code === 0 ? "success" : "failed"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6}>
                      No indexed transactions yet. The managed indexer will
                      populate this view.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="card">
          <div className="sectionTitle">
            <div>
              <div className="eyebrow">Recent</div>
              <h2>Blocks</h2>
            </div>
          </div>
          <div className="blockList">
            {data.blocks.length ? (
              data.blocks.map((block) => (
                <div
                  className="blockRow"
                  key={`${block.height}:${block.blockHash}`}
                >
                  <div>
                    <b>#{block.height}</b>
                    <span className="mono">
                      {short(block.blockHash, 8, 5)}
                    </span>
                  </div>
                  <div>
                    <span>{block.txCount} tx</span>
                    <time>{time(block.blockTime)}</time>
                  </div>
                </div>
              ))
            ) : (
              <p className="mutedText">
                No blocks indexed yet. The managed indexer is responsible for
                synchronization.
              </p>
            )}
          </div>
          <div className="indexMeta">
            <span>Network</span>
            <b>{status.network}</b>
            <span>Chain ID</span>
            <b>{status.chainId}</b>
            <span>Last checkpoint</span>
            <b>{time(status.updatedAt)}</b>
            <span>Indexer</span>
            <b>{indexerMode === "scheduled" ? "Scheduled function" : "Persistent worker"}</b>
          </div>
        </aside>
      </section>
    </>
  );
}
