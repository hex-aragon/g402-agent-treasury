import { NextResponse } from "next/server";
import {
  mainnetReadiness,
  paymentRails,
  facilitatorDisplayOrigin,
  X402_SDK_VERSION,
} from "@/lib/multichain";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      x402Version: 2,
      sdkVersion: X402_SDK_VERSION,
      rails: paymentRails(),
      mainnets: mainnetReadiness(),
      facilitator: {
        origin: facilitatorDisplayOrigin(),
        publicTestnetOnly: !process.env.X402_FACILITATOR_URL,
      },
    },
    { headers: { "cache-control": "no-store" } },
  );
}
