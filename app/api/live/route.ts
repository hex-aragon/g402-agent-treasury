import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "g402-facilitator-scan",
      time: new Date().toISOString(),
    },
    { headers: { "cache-control": "no-store" } },
  );
}
