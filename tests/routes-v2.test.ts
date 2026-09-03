import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { authorizationTypes } from "@x402/evm";
import type { PaymentPayload, PaymentRequired } from "@x402/core/types";
import { privateKeyToAccount } from "viem/accounts";
import { POST as createChallenge } from "../app/api/v2/challenges/route.ts";
import { POST as settlePayment } from "../app/api/v2/settle/route.ts";
import { GET as readPaidResource } from "../app/api/demo/multichain-paid-data/route.ts";

const APP_URL = "https://routes.test";
const FACILITATOR_URL = "https://facilitator.routes.test";
const EVM_NETWORK = "eip155:84532";
// Public Anvil default account; never fund or reuse it outside isolated tests.
const evmAccount = privateKeyToAccount(
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
);

type ChallengeBody = {
  challengeId: string;
  paymentId: string;
  paymentRequired: PaymentRequired;
  paymentRequiredHeader: string;
};

type FacilitatorMode = "success" | "pending" | "failure";
let facilitatorMode: FacilitatorMode = "success";
let transactionSequence = 0;

const originalFetch = globalThis.fetch;
const environmentKeys = [
  "APP_URL",
  "DATABASE_URL",
  "FACILITATOR_API_KEYS",
  "FACILITATOR_PUBLIC",
  "NODE_ENV",
  "X402_FACILITATOR_URL",
  "X402_SAMPLE_PRICE_ATOMIC",
] as const;
const originalEnvironment = Object.fromEntries(
  environmentKeys.map((key) => [key, process.env[key]]),
) as Record<(typeof environmentKeys)[number], string | undefined>;

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (input instanceof URL) return input.toString();
  return input.url;
}

before(() => {
  process.env.APP_URL = APP_URL;
  Reflect.set(process.env, "NODE_ENV", "test");
  process.env.FACILITATOR_PUBLIC = "true";
  process.env.X402_FACILITATOR_URL = FACILITATOR_URL;
  process.env.X402_SAMPLE_PRICE_ATOMIC = "1000";
  delete process.env.DATABASE_URL;
  delete process.env.FACILITATOR_API_KEYS;

  globalThis.fetch = (async (input, init) => {
    const url = requestUrl(input);
    if (url === `${FACILITATOR_URL}/supported`) {
      return json({
        kinds: [{ x402Version: 2, scheme: "exact", network: EVM_NETWORK }],
        extensions: [],
        signers: {},
      });
    }

    if (
      url !== `${FACILITATOR_URL}/verify` &&
      url !== `${FACILITATOR_URL}/settle`
    ) {
      throw new Error(`unexpected_fetch:${url}`);
    }
    const serializedBody = init?.body;
    assert.equal(typeof serializedBody, "string");
    const body = JSON.parse(serializedBody as string) as {
      paymentPayload: PaymentPayload;
      paymentRequirements: PaymentPayload["accepted"];
    };
    const authorization = body.paymentPayload.payload.authorization as {
      from: string;
    };

    if (url.endsWith("/verify")) {
      return json({ isValid: true, payer: authorization.from });
    }

    transactionSequence += 1;
    const transaction = `0x${transactionSequence.toString(16).padStart(64, "0")}`;
    const base = {
      transaction: facilitatorMode === "failure" ? "" : transaction,
      network: body.paymentRequirements.network,
      payer: authorization.from,
      amount: body.paymentRequirements.amount,
    };
    if (facilitatorMode === "success") return json({ success: true, ...base });
    if (facilitatorMode === "pending")
      return json({
        success: false,
        ...base,
        errorReason: "settlement_pending",
      });
    return json({
      success: false,
      ...base,
      errorReason: "insufficient_funds",
      errorMessage: "Facilitator rejected the transfer",
    });
  }) as typeof fetch;
});

after(() => {
  globalThis.fetch = originalFetch;
  for (const key of environmentKeys) {
    const value = originalEnvironment[key];
    if (value === undefined) Reflect.deleteProperty(process.env, key);
    else Reflect.set(process.env, key, value);
  }
});

function challengeRequest(
  body: unknown,
  headers: HeadersInit = {},
): NextRequest {
  return new NextRequest(`${APP_URL}/api/v2/challenges`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

async function issueChallenge(): Promise<ChallengeBody> {
  const response = await createChallenge(
    challengeRequest({
      railId: "evm-base-sepolia",
      walletAddress: evmAccount.address,
      resourceId: "weather",
    }),
  );
  assert.equal(response.status, 201);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const body = (await response.json()) as ChallengeBody;
  const header = response.headers.get("payment-required");
  assert.equal(header, body.paymentRequiredHeader);
  assert.deepEqual(
    JSON.parse(Buffer.from(header!, "base64").toString("utf8")),
    body.paymentRequired,
  );
  return body;
}

async function signChallenge(
  challenge: ChallengeBody,
): Promise<PaymentPayload> {
  const accepted = challenge.paymentRequired.accepts[0];
  const authorization = {
    from: evmAccount.address,
    to: accepted.payTo as `0x${string}`,
    value: accepted.amount,
    validAfter: "0",
    validBefore: String(accepted.extra.validBefore),
    nonce: accepted.extra.authorizationNonce as `0x${string}`,
  };
  const signature = await evmAccount.signTypedData({
    domain: {
      name: String(accepted.extra.name),
      version: String(accepted.extra.version),
      chainId: 84532,
      verifyingContract: accepted.asset as `0x${string}`,
    },
    types: authorizationTypes,
    primaryType: "TransferWithAuthorization",
    message: {
      ...authorization,
      value: BigInt(authorization.value),
      validAfter: BigInt(authorization.validAfter),
      validBefore: BigInt(authorization.validBefore),
    },
  });
  return {
    x402Version: 2,
    resource: challenge.paymentRequired.resource,
    accepted,
    payload: { authorization, signature },
  };
}

async function settle(
  challenge: ChallengeBody,
  paymentPayload: PaymentPayload,
): Promise<Response> {
  return settlePayment(
    new NextRequest(`${APP_URL}/api/v2/settle`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        challengeId: challenge.challengeId,
        paymentId: challenge.paymentId,
        paymentPayload,
      }),
    }),
  );
}

function decodePaymentResponse(response: Response): Record<string, unknown> {
  const encoded = response.headers.get("payment-response");
  assert.ok(encoded);
  return JSON.parse(Buffer.from(encoded, "base64").toString("utf8")) as Record<
    string,
    unknown
  >;
}

test("v2 authorization is closed in production unless public mode or an exact bearer key is configured", async () => {
  Reflect.set(process.env, "NODE_ENV", "production");
  delete process.env.FACILITATOR_PUBLIC;
  delete process.env.FACILITATOR_API_KEYS;

  assert.equal((await createChallenge(challengeRequest({}))).status, 401);

  process.env.FACILITATOR_API_KEYS = "route-secret,second-secret";
  assert.equal(
    (
      await createChallenge(
        challengeRequest({}, { authorization: "Bearer wrong-secret" }),
      )
    ).status,
    401,
  );
  assert.equal(
    (
      await createChallenge(
        challengeRequest({}, { authorization: "Bearer route-secret" }),
      )
    ).status,
    400,
  );

  process.env.FACILITATOR_PUBLIC = "true";
  delete process.env.FACILITATOR_API_KEYS;
  assert.equal((await createChallenge(challengeRequest({}))).status, 400);

  Reflect.set(process.env, "NODE_ENV", "test");
});

test("public protocol mode cannot prepare a mainnet challenge", async () => {
  process.env.FACILITATOR_PUBLIC = "true";
  delete process.env.FACILITATOR_API_KEYS;
  const response = await createChallenge(
    challengeRequest({
      railId: "evm-ethereum-mainnet",
      walletAddress: evmAccount.address,
      resourceId: "weather",
    }),
  );
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), {
    error: "mainnet_requires_operator_authorization",
  });
});

test("v2 challenge returns 201 and a decodable Payment-Required header", async () => {
  const challenge = await issueChallenge();
  assert.match(challenge.challengeId, /^[a-f0-9]{32}$/);
  assert.match(challenge.paymentId, /^pay_[a-f0-9]{32}$/);
  assert.equal(challenge.paymentRequired.accepts[0].network, EVM_NETWORK);
});

test("paid resource stays locked without a valid payment capability", async () => {
  const unpaid = await readPaidResource(
    new NextRequest(`${APP_URL}/api/demo/multichain-paid-data`),
  );
  assert.equal(unpaid.status, 402);
  assert.equal(unpaid.headers.get("payment-required"), null);
  assert.equal((await unpaid.json()).error, "payment_required");

  const wrong = await readPaidResource(
    new NextRequest(`${APP_URL}/api/demo/multichain-paid-data`, {
      headers: { "x-payment-id": "pay_does_not_exist_123456" },
    }),
  );
  assert.equal(wrong.status, 402);
  assert.deepEqual(await wrong.json(), {
    error: "payment_not_finalized_or_wrong_resource",
  });
});

test("successful settlement returns 200, emits Payment-Response, and unlocks only its resource", async () => {
  facilitatorMode = "success";
  const challenge = await issueChallenge();
  const payload = await signChallenge(challenge);
  const response = await settle(challenge, payload);
  assert.equal(response.status, 200);
  const body = (await response.json()) as Record<string, unknown>;
  assert.equal(body.success, true);
  assert.equal(body.paymentId, challenge.paymentId);

  const header = decodePaymentResponse(response);
  assert.equal(header.success, true);
  assert.equal(header.network, EVM_NETWORK);
  assert.equal(header.payer, evmAccount.address);
  assert.equal(header.amount, "1000");
  assert.match(String(header.transaction), /^0x[0-9a-f]{64}$/);
  assert.equal("paymentId" in header, false);
  assert.equal("pending" in header, false);

  const paid = await readPaidResource(
    new NextRequest(`${APP_URL}/api/demo/multichain-paid-data`, {
      headers: { "x-payment-id": challenge.paymentId },
    }),
  );
  assert.equal(paid.status, 200);
  assert.equal(paid.headers.get("cache-control"), "private, no-store");
  const resource = (await paid.json()) as Record<string, unknown>;
  assert.equal(resource.paidBy, evmAccount.address);
  assert.equal(resource.network, EVM_NETWORK);
  assert.equal(resource.transaction, header.transaction);

  const conflictingPayload = structuredClone(payload);
  (conflictingPayload.payload as { signature: string }).signature =
    `0x${"b".repeat(130)}`;
  const conflict = await settle(challenge, conflictingPayload);
  assert.equal(conflict.status, 409);
  assert.deepEqual(await conflict.json(), { error: "idempotency_conflict" });
  assert.equal(conflict.headers.get("payment-response"), null);
});

test("pending and rejected settlements return 202 and 502 with protocol response headers", async () => {
  facilitatorMode = "pending";
  const pendingChallenge = await issueChallenge();
  const pending = await settle(
    pendingChallenge,
    await signChallenge(pendingChallenge),
  );
  assert.equal(pending.status, 202);
  const pendingBody = (await pending.json()) as Record<string, unknown>;
  assert.equal(pendingBody.pending, true);
  assert.equal(pendingBody.errorReason, "settlement_pending");
  const pendingHeader = decodePaymentResponse(pending);
  assert.equal(pendingHeader.success, false);
  assert.equal(pendingHeader.errorReason, "settlement_pending");
  assert.equal("pending" in pendingHeader, false);
  assert.equal("paymentId" in pendingHeader, false);

  facilitatorMode = "failure";
  const failedChallenge = await issueChallenge();
  const failed = await settle(
    failedChallenge,
    await signChallenge(failedChallenge),
  );
  assert.equal(failed.status, 502);
  const failedBody = (await failed.json()) as Record<string, unknown>;
  assert.equal(failedBody.success, false);
  assert.equal(failedBody.errorReason, "insufficient_funds");
  const failedHeader = decodePaymentResponse(failed);
  assert.equal(failedHeader.success, false);
  assert.equal(failedHeader.transaction, "");
  assert.equal(failedHeader.errorReason, "insufficient_funds");
  assert.equal(failedHeader.errorMessage, "Facilitator rejected the transfer");
});
