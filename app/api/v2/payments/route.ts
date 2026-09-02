import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimit, safeError } from "@/lib/http";
import { findPayment } from "@/lib/store";

const PaymentId = z.string().regex(/^[A-Za-z0-9_-]{16,128}$/);

export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, 60);
  if (limited) return limited;
  try {
    const paymentId = PaymentId.parse(
      new URL(req.url).searchParams.get("paymentId"),
    );
    const payment = await findPayment(paymentId);
    if (!payment) return safeError("payment_not_found", 404);
    return NextResponse.json(
      {
        payment: {
          paymentId: payment.paymentId,
          status: payment.status,
          network: payment.network,
          asset: payment.asset,
          amount: payment.amount,
          transaction: payment.txHash,
          confirmations: payment.confirmations || 0,
          updatedAt: payment.updatedAt || payment.createdAt,
        },
      },
      { headers: { "cache-control": "private, no-store" } },
    );
  } catch (error) {
    return safeError(
      error instanceof Error ? error.message : "invalid_request",
      400,
    );
  }
}
