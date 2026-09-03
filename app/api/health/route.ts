import { NextResponse } from "next/server";
import { getD1 } from "@/db/index";
import { pingPostgres } from "@/db/postgres";
import { GnoRpcClient } from "@/lib/gno";
import { getScanStatus } from "@/lib/scan";

export const dynamic = "force-dynamic";

function positiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function GET() {
  const indexerMode =
    process.env.INDEXER_MODE === "scheduled"
      ? "scheduled-function"
      : "persistent-worker";
  const realmMode = process.env.G402_PAYMENT_MODE === "realm";
  const chainId = process.env.GNO_CHAIN_ID || "pearl-1";
  const network = process.env.GNO_NETWORK_ID || "gno:pearl-1";
  const missingConfiguration = [
    process.env.G402_ENABLE_SETTLEMENT !== "true" &&
      "G402_ENABLE_SETTLEMENT",
    process.env.FACILITATOR_PUBLIC !== "true" &&
      !process.env.FACILITATOR_API_KEYS &&
      "FACILITATOR_API_KEYS",
    process.env.G402_SELF_TEST_MODE !== "true" &&
      !process.env.G402_MERCHANT_ADDRESS &&
      "G402_MERCHANT_ADDRESS",
    realmMode && !process.env.G402_CONTRACT_PATH && "G402_CONTRACT_PATH",
  ].filter((value): value is string => Boolean(value));

  const usesPostgres = Boolean(process.env.DATABASE_URL?.trim());
  const database: {
    connected: boolean;
    kind: "PostgreSQL" | "Cloudflare D1";
    error?: string;
  } = {
    connected: false,
    kind: usesPostgres ? "PostgreSQL" : "Cloudflare D1",
  };

  try {
    database.connected = usesPostgres
      ? await pingPostgres()
      : Boolean(await getD1());
  } catch (error) {
    database.error = errorMessage(error, "database_unavailable");
  }

  let rpc: {
    ok: boolean;
    chainId?: string;
    height?: number;
    catchingUp?: boolean;
    error?: string;
  } = { ok: false };
  try {
    const result = await new GnoRpcClient().status();
    const rpcChainId = result.node_info.network;
    const catchingUp = Boolean(result.sync_info.catching_up);
    rpc = {
      ok: rpcChainId === chainId && !catchingUp,
      chainId: rpcChainId,
      height: Number(result.sync_info.latest_block_height),
      catchingUp,
      ...(rpcChainId === chainId ? {} : { error: "rpc_chain_id_mismatch" }),
    };
  } catch (error) {
    rpc = { ok: false, error: errorMessage(error, "rpc_unavailable") };
  }

  let scan: Awaited<ReturnType<typeof getScanStatus>> | null = null;
  let scanError: string | undefined;
  if (database.connected) {
    try {
      scan = await getScanStatus();
    } catch (error) {
      scanError = errorMessage(error, "indexer_status_unavailable");
    }
  }

  const maxLag = positiveNumber(process.env.INDEXER_READY_MAX_LAG, 10);
  const maxAgeMs = positiveNumber(
    process.env.INDEXER_READY_MAX_AGE_MS,
    120_000,
  );
  const checkpointAgeMs = scan?.updatedAt
    ? Date.now() - new Date(scan.updatedAt).getTime()
    : null;
  const checkpointFresh =
    checkpointAgeMs !== null &&
    Number.isFinite(checkpointAgeMs) &&
    checkpointAgeMs >= 0 &&
    checkpointAgeMs <= maxAgeMs;
  const indexerReady = Boolean(
    scan &&
      scan.updatedAt &&
      !scan.lastError &&
      scan.lag <= maxLag &&
      checkpointFresh,
  );
  const configurationReady = missingConfiguration.length === 0;
  const ready =
    database.connected && rpc.ok && configurationReady && indexerReady;

  return NextResponse.json(
    {
      status: ready ? "ok" : "degraded",
      ready,
      service: "g402-facilitator-scan",
      version: "2.0.0",
      network,
      chainId,
      checks: {
        database: { ok: database.connected, ...database },
        rpc,
        configuration: {
          ok: configurationReady,
          missing: missingConfiguration,
        },
        indexer: {
          ok: indexerReady,
          mode: indexerMode,
          requestSync: false,
          maxLag,
          maxAgeMs,
          checkpointAgeMs,
          error: scanError || scan?.lastError || undefined,
        },
      },
      database,
      rpc,
      scan,
      gnoContract: {
        paymentMode: realmMode ? "realm" : "direct",
        path: realmMode ? process.env.G402_CONTRACT_PATH || null : null,
        configured: !realmMode || Boolean(process.env.G402_CONTRACT_PATH),
      },
      settlement: {
        enabled: process.env.G402_ENABLE_SETTLEMENT === "true",
        publicApi: process.env.FACILITATOR_PUBLIC === "true",
        selfTest: process.env.G402_SELF_TEST_MODE === "true",
      },
      locks: { gnoMainnet: process.env.G402_ALLOW_MAINNET !== "true" },
      missingConfiguration,
      time: new Date().toISOString(),
    },
    {
      status: ready ? 200 : 503,
      headers: { "cache-control": "no-store" },
    },
  );
}
