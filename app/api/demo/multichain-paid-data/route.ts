import { NextRequest, NextResponse } from "next/server";
import { rateLimit, safeError } from "@/lib/http";
import { resourceHash } from "@/lib/domain";
import { findAuthorizedSettledPayment } from "@/lib/store";
import { paymentRails } from "@/lib/multichain";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, 20);
  if (limited) return limited;
  const resource = `${process.env.APP_URL || new URL(req.url).origin}/api/demo/multichain-paid-data`;
  const paymentId = req.headers.get("x-payment-id");
  if (paymentId) {
    const payment = await findAuthorizedSettledPayment(
      paymentId,
      resourceHash("GET", resource),
    );
    if (payment)
      return NextResponse.json(
        {
          city: "Seoul",
          temperatureC: 24,
          conditions: "clear",
          paidBy: payment.payer,
          network: payment.network,
          asset: payment.asset,
          transaction: payment.txHash,
        },
        { headers: { "cache-control": "private, no-store" } },
      );
    return safeError("payment_not_finalized_or_wrong_resource", 402);
  }
  return NextResponse.json(
    {
      error: "payment_required",
      x402Version: 2,
      detail:
        "Create a wallet-bound challenge with POST /api/v2/challenges, sign it, then settle it.",
      rails: paymentRails()
        .filter((rail) => rail.apiVersion === "v2")
        .map(({ id, network, asset, symbol, wallet, status, mainnet }) => ({
          id,
          network,
          asset,
          symbol,
          wallet,
          status,
          mainnet,
        })),
    },
    { status: 402, headers: { "cache-control": "no-store" } },
  );
}
