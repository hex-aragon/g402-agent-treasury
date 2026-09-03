import { NextRequest, NextResponse } from "next/server";
import { constantTimeApiKeyMatch } from "@/lib/domain";
import { runIndexerTick } from "@/worker/indexer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const configured = process.env.CRON_SECRET?.trim() || "";
  const supplied =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  if (
    !configured ||
    !supplied ||
    !constantTimeApiKeyMatch(supplied, [configured])
  ) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401, headers: { "cache-control": "no-store" } },
    );
  }

  try {
    const result = await runIndexerTick();
    return NextResponse.json(
      { ok: true, result },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "index_failed",
      },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
