import type { PaymentRequirements } from "./domain.ts";

export const WEBMCP_STORAGE = {
  preparedPayment: "g402.webmcp.prepared-payment.v1",
  preparedMultichainPayment: "x402.multichain.prepared",
  activity: "g402.webmcp.activity.v1",
} as const;

export const WEBMCP_EVENTS = {
  preparedPayment: "g402:webmcp-prepared-payment",
  preparedMultichainPayment: "x402:webmcp-prepared-payment",
  activity: "g402:webmcp-activity",
  ready: "g402:webmcp-ready",
} as const;

export const WEBMCP_TOOL_CATALOG = [
  {
    name: "list_payment_rails",
    title: "List payment rails",
    kind: "Read",
    description:
      "Inspect EVM, Solana and Gno capabilities plus independent mainnet locks.",
  },
  {
    name: "prepare_agent_payment",
    title: "Prepare agent payment",
    kind: "Prepare",
    description:
      "Create server-bound x402 terms for an EVM, Solana or Gno wallet. Never signs or settles.",
  },
  {
    name: "inspect_g402_gateway",
    title: "Inspect g402 gateway",
    kind: "Read",
    description:
      "Check the live Pearl facilitator, settlement rail, indexer and mainnet lock.",
  },
  {
    name: "search_gno_activity",
    title: "Search Gno activity",
    kind: "Read",
    description:
      "Search canonical Pearl blocks and transactions without scraping the explorer UI.",
  },
  {
    name: "prepare_pearl_payment",
    title: "Prepare Pearl payment",
    kind: "Prepare",
    description:
      "Create fixed-resource testnet payment terms for a human to review. It never signs or sends.",
  },
  {
    name: "open_payment_review",
    title: "Open payment review",
    kind: "Navigate",
    description:
      "Move the shared page to the matching wallet review screen after terms have been prepared.",
  },
  {
    name: "get_payment_receipt",
    title: "Get payment receipt",
    kind: "Read",
    description:
      "Read the durable facilitator status for an exact payment ID, with Gno block data when indexed.",
  },
] as const;

export type PreparedWebMCPPayment = {
  version: 1;
  preparedAt: string;
  paymentRequirements: PaymentRequirements;
};

export type PreparedMultichainPayment = {
  challengeId: string;
  paymentId: string;
  rail: {
    id: string;
    family: string;
    network: string;
    asset: string;
    symbol: string;
    priceAtomic: string;
    recipient?: string;
    status: string;
    mainnet: boolean;
  };
  paymentRequired: {
    x402Version: number;
    resource: { url: string };
    accepts: Array<{
      scheme: string;
      network: string;
      asset: string;
      amount: string;
      payTo: string;
      maxTimeoutSeconds: number;
      extra: Record<string, unknown>;
    }>;
  };
  unsignedPaymentPayload?: unknown;
  expectedPayer: string;
};

export type WebMCPActivity = {
  id: string;
  tool: string;
  status: "success" | "error";
  summary: string;
  at: string;
};

export type WebMCPExecutionOptions = { signal?: AbortSignal };
export type WebMCPTool = {
  name: string;
  title: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute(input: unknown, options?: WebMCPExecutionOptions): Promise<unknown>;
};

type JsonRecord = Record<string, unknown>;
const EXPECTED_MAINNETS = [
  { family: "evm", network: "eip155:1" },
  {
    family: "svm",
    network: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
  },
  { family: "gno", network: "gno:mainnet" },
] as const;
type WebMCPDependencies = {
  fetcher: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  origin: string;
  savePreparedPayment: (payment: PreparedWebMCPPayment) => void;
  loadPreparedPayment: () => PreparedWebMCPPayment | null;
  savePreparedMultichainPayment?: (payment: PreparedMultichainPayment) => void;
  loadPreparedMultichainPayment?: () => PreparedMultichainPayment | null;
  recordActivity: (activity: WebMCPActivity) => void;
  navigate: (path: string) => void;
  now?: () => Date;
  randomId?: () => string;
};

class ToolInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ToolInputError";
  }
}

class ToolRequestError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly retryable = false,
  ) {
    super(message);
    this.name = "ToolRequestError";
  }
}

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function objectInput(input: unknown, allowed: readonly string[]): JsonRecord {
  const value = input === undefined ? {} : input;
  if (!isRecord(value)) throw new ToolInputError("Input must be an object.");
  const unexpected = Object.keys(value).find((key) => !allowed.includes(key));
  if (unexpected)
    throw new ToolInputError(`Unexpected input field: ${unexpected}`);
  return value;
}

function requiredString(
  input: JsonRecord,
  key: string,
  pattern: RegExp,
  maxLength: number,
): string {
  const value = input[key];
  if (
    typeof value !== "string" ||
    value.length > maxLength ||
    !pattern.test(value)
  ) {
    throw new ToolInputError(`Invalid ${key}.`);
  }
  return value;
}

function optionalString(
  input: JsonRecord,
  key: string,
  maxLength: number,
): string {
  const value = input[key];
  if (value === undefined) return "";
  if (typeof value !== "string" || value.length > maxLength)
    throw new ToolInputError(`Invalid ${key}.`);
  return value.trim();
}

function optionalLimit(
  input: JsonRecord,
  fallback: number,
  maximum: number,
): number {
  const value = input.limit;
  if (value === undefined) return fallback;
  if (!Number.isInteger(value) || Number(value) < 1 || Number(value) > maximum)
    throw new ToolInputError("Invalid limit.");
  return Number(value);
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function booleanValue(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function child(value: unknown): JsonRecord {
  return isRecord(value) ? value : {};
}

function isPaymentRequirements(value: unknown): value is PaymentRequirements {
  if (!isRecord(value)) return false;
  const extra = child(value.extra);
  return (
    value.scheme === "exact" &&
    typeof value.network === "string" &&
    /^gno:[a-z0-9-]{2,40}$/.test(value.network) &&
    typeof value.asset === "string" &&
    value.asset.length >= 3 &&
    value.asset.length <= 200 &&
    typeof value.amount === "string" &&
    /^[1-9][0-9]{0,39}$/.test(value.amount) &&
    typeof value.payTo === "string" &&
    /^g1[023456789acdefghjklmnpqrstuvwxyz]{38}$/.test(value.payTo) &&
    typeof value.resource === "string" &&
    value.resource.length <= 2048 &&
    typeof value.maxTimeoutSeconds === "number" &&
    Number.isInteger(value.maxTimeoutSeconds) &&
    value.maxTimeoutSeconds >= 5 &&
    value.maxTimeoutSeconds <= 3600 &&
    typeof extra.chainId === "string" &&
    extra.chainId.length > 0 &&
    extra.chainId.length <= 80 &&
    typeof extra.denom === "string" &&
    extra.denom.length > 0 &&
    extra.denom.length <= 80 &&
    typeof extra.resourceHash === "string" &&
    /^[a-f0-9]{64}$/.test(extra.resourceHash) &&
    typeof extra.expiresAt === "number" &&
    Number.isInteger(extra.expiresAt) &&
    extra.expiresAt > 0 &&
    typeof extra.nonce === "string" &&
    /^[A-Za-z0-9_-]{16,128}$/.test(extra.nonce)
  );
}

function assertSafeTerms(
  requirements: PaymentRequirements,
  walletAddress: string,
  origin: string,
) {
  let resource: URL;
  try {
    resource = new URL(requirements.resource);
  } catch {
    throw new ToolRequestError(
      "unsafe_terms",
      "The payment resource is invalid.",
    );
  }
  if (
    requirements.network !== "gno:pearl-1" ||
    requirements.extra.chainId !== "pearl-1" ||
    requirements.extra.paymentMode !== "direct" ||
    requirements.asset !== "gno.land/r/gnoland/wugnot" ||
    requirements.extra.denom !== "ugnot" ||
    requirements.amount !== "1000" ||
    requirements.payTo !== walletAddress ||
    resource.origin !== origin ||
    resource.pathname !== "/api/demo/paid-data" ||
    resource.search !== ""
  ) {
    throw new ToolRequestError(
      "unsafe_terms",
      "The facilitator returned terms outside the fixed Pearl self-test policy.",
    );
  }
}

function assertSafeHealth(health: JsonRecord) {
  const locks = child(health.locks);
  const settlement = child(health.settlement);
  const contract = child(health.gnoContract);
  if (
    health.status !== "ok" ||
    health.network !== "gno:pearl-1" ||
    health.chainId !== "pearl-1" ||
    locks.gnoMainnet !== true ||
    settlement.enabled !== true ||
    settlement.selfTest !== true ||
    contract.paymentMode !== "direct"
  ) {
    throw new ToolRequestError(
      "safety_check_failed",
      "Pearl self-test safety controls could not be verified.",
    );
  }
}

export function isSafeWebMCPHealth(value: unknown): boolean {
  try {
    assertSafeHealth(child(value));
    return true;
  } catch {
    return false;
  }
}

export function isSafePreparedWebMCPPayment(
  payment: PreparedWebMCPPayment,
  walletAddress: string,
  origin: string,
  at = Date.now(),
): boolean {
  try {
    if (payment.paymentRequirements.extra.expiresAt <= Math.floor(at / 1000))
      return false;
    assertSafeTerms(payment.paymentRequirements, walletAddress, origin);
    return true;
  } catch {
    return false;
  }
}

export function decodePreparedWebMCPPayment(
  raw: string | null,
): PreparedWebMCPPayment | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (
      !isRecord(value) ||
      value.version !== 1 ||
      typeof value.preparedAt !== "string" ||
      !isPaymentRequirements(value.paymentRequirements)
    )
      return null;
    return value as PreparedWebMCPPayment;
  } catch {
    return null;
  }
}

export function decodePreparedMultichainPayment(
  raw: string | null,
): PreparedMultichainPayment | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (
      !isRecord(value) ||
      typeof value.challengeId !== "string" ||
      !/^[a-f0-9]{32}$/.test(value.challengeId) ||
      typeof value.paymentId !== "string" ||
      !/^pay_[a-f0-9]{32}$/.test(value.paymentId)
    )
      return null;
    const rail = child(value.rail),
      paymentRequired = child(value.paymentRequired),
      resource = child(paymentRequired.resource);
    const accepts = Array.isArray(paymentRequired.accepts)
      ? paymentRequired.accepts
      : [];
    const accepted = child(accepts[0]);
    if (
      typeof rail.id !== "string" ||
      typeof rail.family !== "string" ||
      typeof rail.priceAtomic !== "string" ||
      typeof rail.status !== "string" ||
      typeof rail.mainnet !== "boolean" ||
      typeof value.expectedPayer !== "string" ||
      paymentRequired.x402Version !== 2 ||
      accepts.length !== 1 ||
      typeof resource.url !== "string" ||
      accepted.scheme !== "exact" ||
      typeof accepted.network !== "string" ||
      typeof accepted.asset !== "string" ||
      typeof accepted.amount !== "string" ||
      typeof accepted.payTo !== "string"
    )
      return null;
    return value as PreparedMultichainPayment;
  } catch {
    return null;
  }
}

function assertSafeMultichainTerms(
  payment: PreparedMultichainPayment,
  origin: string,
  expectedWallet?: string,
) {
  const expected: Record<
    string,
    { family: string; network: string; asset: string; timeout: number }
  > = {
    "gno-pearl": {
      family: "gno",
      network: "gno:pearl-1",
      asset: "gno.land/r/gnoland/wugnot",
      timeout: 300,
    },
    "evm-base-sepolia": {
      family: "evm",
      network: "eip155:84532",
      asset: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      timeout: 300,
    },
    "svm-solana-devnet": {
      family: "svm",
      network: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
      asset: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
      timeout: 60,
    },
  };
  const policy = expected[payment.rail.id],
    accepted = payment.paymentRequired.accepts[0],
    resource = new URL(payment.paymentRequired.resource.url),
    extra = accepted.extra,
    sameAsset =
      policy?.family === "evm"
        ? accepted.asset.toLowerCase() === policy.asset.toLowerCase()
        : accepted.asset === policy?.asset,
    sameRecipient =
      policy?.family === "evm"
        ? accepted.payTo.toLowerCase() === payment.rail.recipient?.toLowerCase()
        : accepted.payTo === payment.rail.recipient,
    payerMatches = expectedWallet
      ? policy?.family === "evm"
        ? payment.expectedPayer.toLowerCase() === expectedWallet.toLowerCase()
        : payment.expectedPayer === expectedWallet
      : true;
  if (
    !policy ||
    payment.rail.family !== policy.family ||
    payment.rail.network !== policy.network ||
    accepted.network !== policy.network ||
    !sameAsset ||
    accepted.amount !== payment.rail.priceAtomic ||
    !/^[1-9][0-9]{0,6}$/.test(accepted.amount) ||
    !sameRecipient ||
    accepted.maxTimeoutSeconds !== policy.timeout ||
    payment.rail.mainnet ||
    payment.rail.status !== "sdk_ready" ||
    !payerMatches ||
    resource.origin !== origin ||
    resource.pathname !== "/api/demo/multichain-paid-data" ||
    resource.search ||
    (policy.family === "evm" &&
      (extra.assetTransferMethod !== "eip3009" ||
        extra.name !== "USDC" ||
        extra.version !== "2" ||
        extra.g402ChallengeId !== payment.challengeId ||
        typeof extra.authorizationNonce !== "string" ||
        !/^0x[0-9a-fA-F]{64}$/.test(extra.authorizationNonce) ||
        typeof extra.validBefore !== "string" ||
        !/^[0-9]{10}$/.test(extra.validBefore) ||
        typeof extra.resourceHash !== "string" ||
        !/^[a-f0-9]{64}$/.test(extra.resourceHash))) ||
    (policy.family === "svm" &&
      (typeof extra.feePayer !== "string" ||
        !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(extra.feePayer) ||
        typeof extra.memo !== "string" ||
        !new RegExp(`^g402:${payment.challengeId}:[a-f0-9]{64}$`).test(
          extra.memo,
        ) ||
        !payment.unsignedPaymentPayload))
  )
    throw new ToolRequestError(
      "unsafe_terms",
      "The gateway returned terms outside the fixed multichain test policy.",
    );
}

async function jsonRequest(
  deps: WebMCPDependencies,
  path: string,
  init: RequestInit,
  acceptedStatuses: readonly number[],
  signal?: AbortSignal,
): Promise<{ response: Response; body: JsonRecord }> {
  const response = await deps.fetcher(path, {
    ...init,
    signal,
    cache: "no-store",
  });
  let parsed: unknown;
  try {
    parsed = await response.json();
  } catch {
    throw new ToolRequestError(
      "invalid_response",
      "The gateway returned an invalid response.",
      true,
    );
  }
  const body = child(parsed);
  if (!acceptedStatuses.includes(response.status)) {
    const serverCode = stringValue(body.error);
    throw new ToolRequestError(
      serverCode || `http_${response.status}`,
      "The gateway could not complete the request.",
      response.status >= 500 || response.status === 429,
    );
  }
  return { response, body };
}

function compactTransaction(value: unknown) {
  const tx = child(value);
  return {
    txHash: stringValue(tx.txHash),
    height: numberValue(tx.height),
    code: numberValue(tx.code),
    kind: stringValue(tx.kind),
    amount: stringValue(tx.amount),
    paymentId: stringValue(tx.paymentId),
    canonical: booleanValue(tx.canonical),
  };
}

function compactPayment(value: unknown) {
  const payment = child(value);
  return {
    paymentId: stringValue(payment.paymentId),
    status: stringValue(payment.status),
    network: stringValue(payment.network),
    amount: stringValue(payment.amount),
    asset: stringValue(payment.asset),
    payer: stringValue(payment.payer),
    payTo: stringValue(payment.payTo),
    transaction: stringValue(payment.txHash),
    blockHeight: numberValue(payment.blockHeight),
    confirmations: numberValue(payment.confirmations),
    createdAt: stringValue(payment.createdAt),
  };
}

function safeMessage(error: unknown): {
  code: string;
  message: string;
  retryable: boolean;
} {
  if (error instanceof ToolInputError)
    return { code: "invalid_input", message: error.message, retryable: false };
  if (error instanceof ToolRequestError)
    return {
      code: error.code,
      message: error.message,
      retryable: error.retryable,
    };
  if (error instanceof DOMException && error.name === "AbortError")
    return {
      code: "cancelled",
      message: "The tool call was cancelled.",
      retryable: true,
    };
  return {
    code: "tool_failed",
    message: "The tool could not complete the request.",
    retryable: true,
  };
}

function makeTool(
  deps: WebMCPDependencies,
  definition: Omit<WebMCPTool, "execute">,
  perform: (
    input: unknown,
    options: WebMCPExecutionOptions,
  ) => Promise<JsonRecord>,
  summarize: (result: JsonRecord) => string,
): WebMCPTool {
  return {
    ...definition,
    async execute(input: unknown, options: WebMCPExecutionOptions = {}) {
      const now = deps.now?.() || new Date();
      const randomId = deps.randomId?.() || crypto.randomUUID();
      try {
        const result = await perform(input, options);
        try {
          deps.recordActivity({
            id: randomId,
            tool: definition.name,
            status: "success",
            summary: summarize(result),
            at: now.toISOString(),
          });
        } catch {}
        return result;
      } catch (error) {
        const safe = safeMessage(error);
        try {
          deps.recordActivity({
            id: randomId,
            tool: definition.name,
            status: "error",
            summary: safe.message,
            at: now.toISOString(),
          });
        } catch {}
        return { ok: false, error: safe };
      }
    },
  };
}

export function createWebMCPTools(deps: WebMCPDependencies): WebMCPTool[] {
  const now = deps.now || (() => new Date());

  const listRails = makeTool(
    deps,
    {
      name: "list_payment_rails",
      title: "List payment rails",
      description:
        "Read configured EVM, Solana and Gno rails, wallet standards, protocol capabilities, and independent mainnet locks. Does not sign or transfer.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
    },
    async (input, options) => {
      objectInput(input, []);
      const { body } = await jsonRequest(
        deps,
        "/api/v2/rails",
        {},
        [200],
        options.signal,
      );
      const rails = Array.isArray(body.rails)
        ? body.rails.slice(0, 5).map((value) => {
            const rail = child(value);
            return {
              id: stringValue(rail.id),
              family: stringValue(rail.family),
              label: stringValue(rail.label),
              network: stringValue(rail.network),
              asset: stringValue(rail.asset),
              symbol: stringValue(rail.symbol),
              wallet: stringValue(rail.wallet),
              status: stringValue(rail.status),
              mainnet: booleanValue(rail.mainnet),
              capabilities: Array.isArray(rail.capabilities)
                ? rail.capabilities.slice(0, 8).map(String)
                : [],
            };
          })
        : [];
      const mainnets = Array.isArray(body.mainnets)
        ? body.mainnets.slice(0, 3).map((value) => {
            const item = child(value);
            return {
              family: stringValue(item.family),
              network: stringValue(item.network),
              codeSupported: booleanValue(item.codeSupported),
              settlementEnabled: booleanValue(item.settlementEnabled),
              lock: stringValue(item.lock),
            };
          })
        : [];
      const allMainnetsLocked =
        mainnets.length === EXPECTED_MAINNETS.length &&
        EXPECTED_MAINNETS.every(
          ({ family, network }) =>
            mainnets.filter(
              (item) =>
                item.family === family &&
                item.network === network &&
                item.codeSupported === true &&
                item.settlementEnabled === false &&
                typeof item.lock === "string" &&
                item.lock.length > 0,
            ).length === 1,
        );
      return {
        ok: true,
        x402Version: numberValue(body.x402Version),
        sdkVersion: stringValue(body.sdkVersion),
        rails,
        mainnets,
        allMainnetsLocked,
        note: "Mainnet code support is distinct from deployment enablement; every mainnet has its own fail-closed prerequisites.",
      };
    },
    (result) =>
      `Found ${Array.isArray(result.rails) ? result.rails.length : 0} configured payment rails.`,
  );

  const prepareAny = makeTool(
    deps,
    {
      name: "prepare_agent_payment",
      title: "Prepare agent payment",
      description:
        "Create one wallet-bound, server-persisted testnet x402 challenge on EVM, Solana, or Gno for human review. The tool cannot sign, settle, choose arbitrary tokens, or enable mainnet.",
      inputSchema: {
        type: "object",
        properties: {
          railId: {
            type: "string",
            enum: ["evm-base-sepolia", "svm-solana-devnet", "gno-pearl"],
            description: "Allowlisted testnet rail.",
          },
          walletAddress: {
            type: "string",
            minLength: 32,
            maxLength: 128,
            description:
              "Connected wallet address that the human will control.",
          },
        },
        required: ["railId", "walletAddress"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
    },
    async (input, options) => {
      const value = objectInput(input, ["railId", "walletAddress"]);
      const railId = requiredString(
        value,
        "railId",
        /^(evm-base-sepolia|svm-solana-devnet|gno-pearl)$/,
        32,
      );
      const walletAddress = requiredString(
        value,
        "walletAddress",
        /^[A-Za-z0-9]{32,128}$|^0x[0-9a-fA-F]{40}$/,
        128,
      );
      if (railId === "gno-pearl") {
        const healthResult = await jsonRequest(
          deps,
          "/api/health",
          {},
          [200],
          options.signal,
        );
        assertSafeHealth(healthResult.body);
        const { body } = await jsonRequest(
          deps,
          `/api/demo/paid-data?payTo=${encodeURIComponent(walletAddress)}`,
          {},
          [402],
          options.signal,
        );
        const legacy = body.paymentRequirements;
        if (!isPaymentRequirements(legacy))
          throw new ToolRequestError(
            "invalid_terms",
            "The Gno adapter returned invalid payment terms.",
            true,
          );
        assertSafeTerms(legacy, walletAddress, deps.origin);
        deps.savePreparedPayment({
          version: 1,
          preparedAt: now().toISOString(),
          paymentRequirements: legacy,
        });
        return {
          ok: true,
          challengeId: legacy.extra.nonce,
          railId,
          network: legacy.network,
          asset: legacy.asset,
          amount: legacy.amount,
          payTo: legacy.payTo,
          resource: legacy.resource,
          reviewUrl: "/wallet?source=webmcp",
          transferSubmitted: false,
          humanAction:
            "Open the Adena review screen and explicitly approve the signature.",
          mainnetLocked: true,
        };
      }
      const { body } = await jsonRequest(
        deps,
        "/api/v2/challenges",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            railId,
            walletAddress,
            resourceId: "weather",
          }),
        },
        [201],
        options.signal,
      );
      const prepared = decodePreparedMultichainPayment(JSON.stringify(body));
      if (!prepared)
        throw new ToolRequestError(
          "invalid_terms",
          "The gateway returned invalid payment terms.",
          true,
        );
      assertSafeMultichainTerms(prepared, deps.origin, walletAddress);
      const accepted = prepared.paymentRequired.accepts[0];
      if (!deps.savePreparedMultichainPayment)
        throw new ToolRequestError(
          "storage_unavailable",
          "The multichain review handoff is unavailable.",
        );
      deps.savePreparedMultichainPayment(prepared);
      return {
        ok: true,
        challengeId: prepared.challengeId,
        railId,
        network: accepted.network,
        asset: accepted.asset,
        amount: accepted.amount,
        payTo: accepted.payTo,
        resource: prepared.paymentRequired.resource.url,
        reviewUrl: "/pay?source=webmcp",
        transferSubmitted: false,
        humanAction:
          "Open the review screen and explicitly approve the wallet signature.",
        mainnet: false,
      };
    },
    (result) =>
      `Prepared ${stringValue(result.railId) || "testnet"} terms; no signature or transfer submitted.`,
  );

  const inspect = makeTool(
    deps,
    {
      name: "inspect_g402_gateway",
      title: "Inspect g402 gateway",
      description:
        "Read the live g402 facilitator, Pearl network, settlement rail, scan checkpoint, and mainnet safety lock. Does not change state.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
    },
    async (input, options) => {
      objectInput(input, []);
      const [healthResult, supportedResult] = await Promise.all([
        jsonRequest(deps, "/api/health", {}, [200, 503], options.signal),
        jsonRequest(deps, "/api/v1/supported", {}, [200], options.signal),
      ]);
      const health = healthResult.body;
      const locks = child(health.locks);
      const settlement = child(health.settlement);
      const contract = child(health.gnoContract);
      const scan = child(health.scan);
      const kinds = Array.isArray(supportedResult.body.kinds)
        ? supportedResult.body.kinds
        : [];
      const firstKind = child(kinds[0]);
      const mainnetLocked = booleanValue(locks.gnoMainnet) === true;
      const healthy =
        health.status === "ok" &&
        health.network === "gno:pearl-1" &&
        health.chainId === "pearl-1" &&
        mainnetLocked;
      return {
        ok: true,
        healthy,
        status: stringValue(health.status),
        service: stringValue(health.service),
        network: stringValue(health.network) || stringValue(firstKind.network),
        chainId: stringValue(health.chainId),
        paymentMode: stringValue(contract.paymentMode),
        settlementEnabled: booleanValue(settlement.enabled),
        mainnetLocked,
        scan: {
          indexedHeight: numberValue(scan.indexedHeight),
          chainHeight: numberValue(scan.chainHeight),
          lag: numberValue(scan.lag),
          payments: numberValue(scan.payments),
        },
        checkedAt: now().toISOString(),
      };
    },
    (result) =>
      `Gateway ${result.healthy === true ? "healthy" : "not healthy"}; mainnet ${result.mainnetLocked === true ? "locked" : "lock not verified"}.`,
  );

  const search = makeTool(
    deps,
    {
      name: "search_gno_activity",
      title: "Search Gno activity",
      description:
        "Search canonical Pearl testnet transactions by hash, payment ID, address, or height. Returns a small bounded result and does not change state.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            maxLength: 128,
            description:
              "Transaction hash, payment ID, Gno address, or block height. Empty means latest.",
          },
          limit: {
            type: "integer",
            minimum: 1,
            maximum: 5,
            default: 5,
            description: "Maximum results.",
          },
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
    },
    async (input, options) => {
      const value = objectInput(input, ["query", "limit"]);
      const query = optionalString(value, "query", 128);
      const limit = optionalLimit(value, 5, 5);
      const { body } = await jsonRequest(
        deps,
        `/api/v1/scan?q=${encodeURIComponent(query)}&limit=${limit}`,
        {},
        [200],
        options.signal,
      );
      const status = child(body.status);
      const transactions = Array.isArray(body.transactions)
        ? body.transactions.slice(0, limit).map(compactTransaction)
        : [];
      return {
        ok: true,
        query,
        network: stringValue(status.network),
        indexedHeight: numberValue(status.indexedHeight),
        chainHeight: numberValue(status.chainHeight),
        count: transactions.length,
        transactions,
      };
    },
    (result) =>
      `Found ${numberValue(result.count) || 0} canonical transaction(s).`,
  );

  const prepare = makeTool(
    deps,
    {
      name: "prepare_pearl_payment",
      title: "Prepare Pearl payment",
      description:
        "Create reviewable terms for the fixed paid-data demo using a Pearl Adena address. This writes an expiring challenge but never opens the wallet, signs, or transfers funds.",
      inputSchema: {
        type: "object",
        properties: {
          walletAddress: {
            type: "string",
            pattern: "^g1[023456789acdefghjklmnpqrstuvwxyz]{38}$",
            maxLength: 40,
            description:
              "Pearl Adena address that will self-pay in the safe demo.",
          },
        },
        required: ["walletAddress"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
    },
    async (input, options) => {
      const value = objectInput(input, ["walletAddress"]);
      const walletAddress = requiredString(
        value,
        "walletAddress",
        /^g1[023456789acdefghjklmnpqrstuvwxyz]{38}$/,
        40,
      );
      const healthResult = await jsonRequest(
        deps,
        "/api/health",
        {},
        [200],
        options.signal,
      );
      assertSafeHealth(healthResult.body);
      const { body } = await jsonRequest(
        deps,
        `/api/demo/paid-data?payTo=${encodeURIComponent(walletAddress)}`,
        {},
        [402],
        options.signal,
      );
      const requirements = body.paymentRequirements;
      if (!isPaymentRequirements(requirements))
        throw new ToolRequestError(
          "invalid_terms",
          "The facilitator returned invalid payment terms.",
          true,
        );
      assertSafeTerms(requirements, walletAddress, deps.origin);
      const prepared: PreparedWebMCPPayment = {
        version: 1,
        preparedAt: now().toISOString(),
        paymentRequirements: requirements,
      };
      deps.savePreparedPayment(prepared);
      return {
        ok: true,
        prepared: true,
        network: requirements.network,
        chainId: requirements.extra.chainId,
        asset: requirements.asset,
        amount: requirements.amount,
        payTo: requirements.payTo,
        resource: requirements.resource,
        expiresAt: new Date(requirements.extra.expiresAt * 1000).toISOString(),
        paymentMode: requirements.extra.paymentMode || "direct",
        reviewUrl: "/wallet?source=webmcp",
        transferSubmitted: false,
        humanAction:
          "Review the terms, connect the matching Adena wallet, and approve its signature request.",
        mainnetLocked: true,
      };
    },
    (result) =>
      `Prepared ${stringValue(result.amount) || "test"} WUGNOT terms; no transfer submitted.`,
  );

  const review = makeTool(
    deps,
    {
      name: "open_payment_review",
      title: "Open payment review",
      description:
        "Open the matching human wallet review screen for already prepared terms. This changes the visible page but does not sign or transfer funds.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
    },
    async (input, options) => {
      objectInput(input, []);
      const multichain = deps.loadPreparedMultichainPayment?.();
      if (multichain) {
        assertSafeMultichainTerms(multichain, deps.origin);
        deps.navigate("/pay?source=webmcp");
        return {
          ok: true,
          opened: "/pay?source=webmcp",
          railId: multichain.rail.id,
          transferSubmitted: false,
          nextAction:
            "The human reconnects the matching wallet, reviews every term, and approves its signature.",
          mainnet: false,
        };
      }
      const prepared = deps.loadPreparedPayment();
      if (
        !prepared ||
        prepared.paymentRequirements.extra.expiresAt <=
          Math.floor(now().getTime() / 1000)
      ) {
        throw new ToolRequestError(
          "prepared_payment_missing",
          "Prepare fresh Pearl payment terms before opening review.",
        );
      }
      assertSafeTerms(
        prepared.paymentRequirements,
        prepared.paymentRequirements.payTo,
        deps.origin,
      );
      const healthResult = await jsonRequest(
        deps,
        "/api/health",
        {},
        [200],
        options.signal,
      );
      assertSafeHealth(healthResult.body);
      deps.navigate("/wallet?source=webmcp");
      return {
        ok: true,
        opened: "/wallet?source=webmcp",
        transferSubmitted: false,
        nextAction:
          "The human reviews the terms and explicitly approves the Adena signature.",
        mainnetLocked: true,
      };
    },
    () => "Opened the human wallet review screen; no transfer submitted.",
  );

  const receipt = makeTool(
    deps,
    {
      name: "get_payment_receipt",
      title: "Get payment receipt",
      description:
        "Look up one exact payment ID in the durable facilitator ledger and return settlement status plus Gno block data when indexed. Does not change state.",
      inputSchema: {
        type: "object",
        properties: {
          paymentId: {
            type: "string",
            pattern: "^[A-Za-z0-9_-]{16,128}$",
            maxLength: 128,
            description: "Exact payment ID shown after wallet approval.",
          },
        },
        required: ["paymentId"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
    },
    async (input, options) => {
      const value = objectInput(input, ["paymentId"]);
      const paymentId = requiredString(
        value,
        "paymentId",
        /^[A-Za-z0-9_-]{16,128}$/,
        128,
      );
      const { body } = await jsonRequest(
        deps,
        `/api/v1/payments?paymentId=${encodeURIComponent(paymentId)}`,
        {},
        [200],
        options.signal,
      );
      const match = body.payment;
      if (!match)
        return {
          ok: true,
          found: false,
          paymentId,
          nextAction:
            "Check the payment ID or wait for settlement, then retry.",
        };
      return { ok: true, found: true, receipt: compactPayment(match) };
    },
    (result) =>
      result.found === true
        ? "Found the durable payment receipt."
        : "No receipt found yet.",
  );

  return [listRails, prepareAny, inspect, search, prepare, review, receipt];
}
