import { NextRequest, NextResponse } from "next/server";
import { validateProtocolReview } from "@/lib/multichain";
import { authorize, rateLimit, safeError } from "@/lib/http";

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, 30);
  if (limited) return limited;
  if (!authorize(req)) return safeError("unauthorized", 401);
  try {
    return NextResponse.json(await validateProtocolReview(await req.json()), {
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    return safeError(
      error instanceof Error ? error.message : "invalid_request",
      400,
    );
  }
}
