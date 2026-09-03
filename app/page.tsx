import Link from "next/link";
import { listPayments, type PaymentRecord } from "@/lib/store";
import { getScanStatus } from "@/lib/scan";
export const dynamic = "force-dynamic";
export default async function Home() {
  const payments = await listPayments(200),
    recent = payments.slice(0, 8),
    settled = payments.filter((p) => p.status === "settled"),
    evmSettled = settled.filter((p) => p.network.startsWith("eip155:")).length,
    svmSettled = settled.filter((p) => p.network.startsWith("solana:")).length,
    gnoSettled = settled.filter((p) => p.network.startsWith("gno:")).length;
  let scan: null | Awaited<ReturnType<typeof getScanStatus>> = null;
  try {
    scan = await getScanStatus();
  } catch {}
  return (
    <>
      <section className="hero">
        <div>
          <div className="eyebrow">
            WebMCP + x402 across three chain families
          </div>
          <h1>
            One treasury. <em>Any rail.</em>
          </h1>
          <p>
            에이전트는 EVM, Solana, Gno 중 결제 레일을 고르고 조건을 준비합니다.
            사람은 자기 지갑에서만 최종 승인하며, 세 체인의 영수증은 하나의 체인
            중립 원장으로 연결됩니다.
          </p>
          <div className="heroActions">
            <Link className="button" href="/pay">
              Open multichain pay
            </Link>
            <Link className="button secondary" href="/webmcp">
              Open WebMCP desk
            </Link>
            <Link className="button secondary" href="/scan">
              Open g402 Scan
            </Link>
          </div>
        </div>
        <div className="heroAside">
          <div className="statusLine">
            <span>WebMCP</span>
            <b className="success">Chain-neutral tools</b>
          </div>
          <div className="statusLine">
            <span>EVM rail</span>
            <b className="success">Base Sepolia · USDC</b>
          </div>
          <div className="statusLine">
            <span>Solana rail</span>
            <b className="success">Devnet · USDC</b>
          </div>
          <div className="statusLine">
            <span>Gno rail</span>
            <b className="success">Pearl · WUGNOT</b>
          </div>
          <div className="statusLine">
            <span>Mainnets</span>
            <b className="pending">3 independent locks</b>
          </div>
        </div>
      </section>
      <section className="grid stats">
        <div className="card stat">
          <label>EVM RECEIPTS</label>
          <strong>{evmSettled}</strong>
          <small>USDC</small>
        </div>
        <div className="card stat">
          <label>SOLANA RECEIPTS</label>
          <strong>{svmSettled}</strong>
          <small>USDC</small>
        </div>
        <div className="card stat">
          <label>GNO RECEIPTS</label>
          <strong>{gnoSettled}</strong>
          <small>WUGNOT</small>
        </div>
        <div className="card stat">
          <label>GNO INDEX HEIGHT</label>
          <strong>{scan?.indexedHeight ?? "—"}</strong>
        </div>
      </section>
      <section className="grid layout">
        <div className="card">
          <div className="sectionTitle">
            <h2>Recent payments</h2>
            <Link href="/payments">Open ledger →</Link>
          </div>
          <PaymentTable payments={recent} />
        </div>
        <div className="card">
          <div className="sectionTitle">
            <h2>Enforced controls</h2>
          </div>
          <div className="activity">
            <Activity
              text="CAIP-2 network + exact asset + recipient binding"
              time="all rails"
            />
            <Activity
              text="One challenge can produce one facilitator settlement"
              time="atomic PostgreSQL"
            />
            <Activity
              text="Wallet approval is separated from agent preparation"
              time="non-custodial"
            />
            <Activity
              text="EVM, Solana and Gno mainnets lock independently"
              time="fail-closed"
            />
          </div>
        </div>
      </section>
    </>
  );
}
function Activity({ text, time }: { text: string; time: string }) {
  return (
    <div className="activityItem">
      <i className="dot" />
      <div>
        <p>{text}</p>
        <small>{time}</small>
      </div>
    </div>
  );
}
function short(value: string) {
  return value.length > 15 ? `${value.slice(0, 7)}…${value.slice(-5)}` : value;
}
export function PaymentTable({ payments }: { payments: PaymentRecord[] }) {
  return (
    <div className="tableWrap">
      <table className="table">
        <thead>
          <tr>
            <th>Payment</th>
            <th>Created</th>
            <th>Route</th>
            <th>Amount</th>
            <th>Block</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.length ? (
            payments.map((p) => (
              <tr key={p.paymentId}>
                <td className="mono">{short(p.paymentId)}</td>
                <td>{new Date(p.createdAt).toLocaleString()}</td>
                <td className="mono">
                  {short(p.payer)} → {short(p.payTo)}
                </td>
                <td>{p.amount}</td>
                <td>
                  {p.blockHeight
                    ? `#${p.blockHeight} · ${p.confirmations || 0} conf`
                    : "—"}
                </td>
                <td>
                  <span
                    className={
                      (p.status === "settled"
                        ? "success"
                        : p.status === "failed" || p.status === "reverted"
                          ? "failed"
                          : "pending") + " badge"
                    }
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6}>
                No payments yet. Prepare one from the multichain payment desk.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
