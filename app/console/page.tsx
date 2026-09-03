import Link from "next/link";
import { getD1 } from "@/db/index";
import { pingPostgres } from "@/db/postgres";
import { getScanStatus } from "@/lib/scan";

export const dynamic = "force-dynamic";

async function databaseState() {
  if (process.env.DATABASE_URL?.trim()) {
    try {
      return { connected: await pingPostgres(), label: "POSTGRESQL" };
    } catch {
      return { connected: false, label: "POSTGRESQL" };
    }
  }

  return {
    connected: Boolean(await getD1()),
    label: "CLOUDFLARE D1",
  };
}

export default async function Console() {
  const database = await databaseState();
  let scan: Awaited<ReturnType<typeof getScanStatus>> | null = null;
  try {
    scan = await getScanStatus();
  } catch {
    // The unavailable state is rendered below without masking the rest of ops.
  }

  const settlement = process.env.G402_ENABLE_SETTLEMENT === "true";
  const publicApi = process.env.FACILITATOR_PUBLIC === "true";
  const realm = process.env.G402_PAYMENT_MODE === "realm";
  const indexerRuntime =
    process.env.INDEXER_MODE === "scheduled"
      ? "Vercel scheduled function"
      : "Persistent managed worker";

  return (
    <>
      <div className="pageHead">
        <div className="eyebrow">Live configuration</div>
        <h1>Operations</h1>
        <p>
          실제 배포 환경과 영속 인덱서 워커의 체크포인트를 기준으로
          표시합니다.
        </p>
      </div>

      <div className="card warning">
        <h3>Mainnet settlement is locked</h3>
        <p>
          현재 정산은 Pearl 테스트넷에만 고정되어 있습니다. 메인넷 플래그는
          코드와 배포 환경에서 각각 차단됩니다.
        </p>
      </div>

      <div className="grid stats" style={{ marginTop: 14 }}>
        <div className="card stat">
          <label>DURABLE DATABASE</label>
          <strong className={database.connected ? "success" : "failed"}>
            {database.connected ? `${database.label} ON` : `${database.label} OFF`}
          </strong>
        </div>
        <div className="card stat">
          <label>SETTLEMENT</label>
          <strong className={settlement ? "success" : "pending"}>
            {settlement ? "ON" : "LOCKED"}
          </strong>
        </div>
        <div className="card stat">
          <label>INDEX HEIGHT</label>
          <strong>{scan?.indexedHeight || "—"}</strong>
        </div>
        <div className="card stat">
          <label>INDEX LAG</label>
          <strong>{scan?.lag ?? "—"}</strong>
          <small>blocks</small>
        </div>
      </div>

      <div className="grid twoCol">
        <div className="card feature">
          <h3>Facilitator</h3>
          <div className="statusLine">
            <span>Network</span>
            <b>{process.env.GNO_NETWORK_ID || "gno:pearl-1"}</b>
          </div>
          <div className="statusLine">
            <span>Chain ID</span>
            <b>{process.env.GNO_CHAIN_ID || "pearl-1"}</b>
          </div>
          <div className="statusLine">
            <span>Mode</span>
            <b>{realm ? "g402pay realm" : "WUGNOT direct"}</b>
          </div>
          <div className="statusLine">
            <span>API access</span>
            <b>{publicApi ? "Public + rate limited" : "Bearer key"}</b>
          </div>
        </div>

        <div className="card feature">
          <h3>Indexer</h3>
          <div className="statusLine">
            <span>Runtime</span>
            <b>{indexerRuntime}</b>
          </div>
          <div className="statusLine">
            <span>Request-triggered sync</span>
            <b>Disabled</b>
          </div>
          <div className="statusLine">
            <span>Chain height</span>
            <b>{scan?.chainHeight || "—"}</b>
          </div>
          <div className="statusLine">
            <span>Last checkpoint</span>
            <b>
              {scan?.updatedAt
                ? new Date(scan.updatedAt).toLocaleString("ko-KR")
                : "Never"}
            </b>
          </div>
          <div className="statusLine">
            <span>Last error</span>
            <b className={scan?.lastError ? "failed" : "success"}>
              {scan?.lastError || "None"}
            </b>
          </div>
          <Link className="button secondary consoleAction" href="/scan">
            Open read-only scan
          </Link>
        </div>
      </div>
    </>
  );
}
