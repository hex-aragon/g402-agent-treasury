import { NextRequest, NextResponse } from "next/server";
import { constantTimeApiKeyMatch } from "./domain";
import { consumeRateLimit } from "./rate-limit";

function configuredApiKeys() {
  return (process.env.FACILITATOR_API_KEYS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function bearerToken(req: NextRequest) {
  return req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
}

export function clientIp(req: NextRequest) {
  const cloudflareIp = req.headers.get("cf-connecting-ip")?.trim();
  if (cloudflareIp) return cloudflareIp.slice(0, 64);

  // Cloudflare overwrites CF-Connecting-IP at the trusted proxy boundary. In
  // production, never trust a caller-supplied forwarding chain as identity.
  if (process.env.NODE_ENV === "production") return "unknown";
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim().slice(0, 64) ||
    "unknown"
  );
}

export async function rateLimit(
  req: NextRequest,
  limit = 60,
  windowMs = 60_000,
) {
  const result = await consumeRateLimit(
    `http:${clientIp(req)}:${new URL(req.url).pathname}`,
    limit,
    windowMs,
  );
  if (!result.allowed)
    return NextResponse.json(
      { error: "rate_limited" },
      {
        status: 429,
        headers: {
          "retry-after": String(
            Math.ceil((result.resetAt - Date.now()) / 1000),
          ),
          "x-ratelimit-remaining": "0",
        },
      },
    );
  return null;
}

// Public mode applies only to the x402 protocol surface. It must never grant
// management privileges.
export function authorize(req: NextRequest) {
  if (process.env.FACILITATOR_PUBLIC === "true") return true;
  const configured = configuredApiKeys();
  if (!configured.length && process.env.NODE_ENV !== "production") return true;
  const value = bearerToken(req);
  return value.length > 0 && constantTimeApiKeyMatch(value, configured);
}

export function authorizeAdmin(req: NextRequest) {
  const configured = configuredApiKeys();
  const value = bearerToken(req);
  return (
    configured.length > 0 &&
    value.length > 0 &&
    constantTimeApiKeyMatch(value, configured)
  );
}

export function safeError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
