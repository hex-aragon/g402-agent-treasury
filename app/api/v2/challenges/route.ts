import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createProtocolChallenge } from "@/lib/multichain";
import { authorize, authorizeAdmin, rateLimit, safeError } from "@/lib/http";

const RequestSchema = z
  .object({
    railId: z.enum([
      "evm-base-sepolia",
      "evm-ethereum-mainnet",
      "svm-solana-devnet",
      "svm-solana-mainnet",
    ]),
    walletAddress: z.string().min(3).max(128),
    resourceId: z.literal("weather").default("weather"),
  })
  .strict();

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, 30);
  if (limited) return limited;
  if (!authorize(req)) return safeError("unauthorized", 401);
  try {
    const body = RequestSchema.parse(await req.json());
    if (
      (body.railId === "evm-ethereum-mainnet" ||
        body.railId === "svm-solana-mainnet") &&
      !authorizeAdmin(req)
    ) {
      return safeError("mainnet_requires_operator_authorization", 403);
    }
    const resource = `${process.env.APP_URL || new URL(req.url).origin}/api/demo/multichain-paid-data`;
    const challenge = await createProtocolChallenge({
      railId: body.railId,
      walletAddress: body.walletAddress,
      resource,
      description: "Chain-neutral x402 weather data",
    });
    return NextResponse.json(challenge, {
      status: 201,
      headers: {
        "payment-required": challenge.paymentRequiredHeader,
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "invalid_request";
    return safeError(
      message,
      /facilitator|solana_rpc|recipient_ata/.test(message) ? 503 : 400,
    );
  }
}
