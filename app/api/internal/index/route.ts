import { NextRequest, NextResponse } from "next/server";
import { authorizeAdmin, rateLimit, safeError } from "@/lib/http";
import { getScanStatus } from "@/lib/scan";

export const dynamic = "force-dynamic";

function indexerMode() {
  return process.env.INDEXER_MODE === "scheduled"
    ? "scheduled-function"
    : "persistent-worker";
}

export async function GET() {
  try {
    return NextResponse.json(
      {
        status: await getScanStatus(),
        indexer: { mode: indexerMode(), requestSync: false },
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    return safeError(
      error instanceof Error ? error.message : "index_status_failed",
      503,
    );
  }
}

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, 8, 60_000);
  if (limited) return limited;
  if (!authorizeAdmin(req)) return safeError("unauthorized", 401);

  return NextResponse.json(
    {
      ok: false,
      error: "indexer_managed_by_runtime",
      message:
        "Request-triggered indexing is disabled. The configured indexer runtime manages synchronization.",
      indexer: { mode: indexerMode(), requestSync: false },
    },
    {
      status: 409,
      headers: { "cache-control": "no-store" },
    },
  );
}
