import { NextRequest, NextResponse } from "next/server";
import { settleProtocolPayment } from "@/lib/multichain";
import { authorize, rateLimit, safeError } from "@/lib/http";

function paymentResponseHeader(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64");
}

function protocolSettlementResponse(
  result: Awaited<ReturnType<typeof settleProtocolPayment>>,
) {
  return {
    success: result.success,
    transaction: result.transaction,
    network: result.network,
    ...(result.payer ? { payer: result.payer } : {}),
    ...(result.amount !== undefined ? { amount: result.amount } : {}),
    ...(result.errorReason ? { errorReason: result.errorReason } : {}),
    ...(result.errorMessage ? { errorMessage: result.errorMessage } : {}),
    ...(result.extensions ? { extensions: result.extensions } : {}),
    ...(result.extra ? { extra: result.extra } : {}),
  };
}

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, 20);
  if (limited) return limited;
  if (!authorize(req)) return safeError("unauthorized", 401);
  try {
    const result = await settleProtocolPayment(await req.json());
    const status = result.success ? 200 : result.pending ? 202 : 502;
    return NextResponse.json(result, {
      status,
      headers: {
        "payment-response": paymentResponseHeader(
          protocolSettlementResponse(result),
        ),
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "invalid_request";
    const status =
      message === "nonce_reused" ||
      message === "idempotency_conflict" ||
      message === "challenge_consumed"
        ? 409
        : /facilitator/.test(message)
          ? 503
          : 400;
    return safeError(message, status);
  }
}
