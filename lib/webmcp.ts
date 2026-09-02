import type { PaymentRequirements } from "./domain.ts";

export const WEBMCP_STORAGE = {
  preparedPayment: "g402.webmcp.prepared-payment.v1",
  activity: "g402.webmcp.activity.v1",
} as const;

export const WEBMCP_EVENTS = {
  preparedPayment: "g402:webmcp-prepared-payment",
  activity: "g402:webmcp-activity",
  ready: "g402:webmcp-ready",
} as const;

export const WEBMCP_TOOL_CATALOG = [
  { name: "inspect_g402_gateway", title: "Inspect g402 gateway", kind: "Read", description: "Check the live Pearl facilitator, settlement rail, indexer and mainnet lock." },
  { name: "search_gno_activity", title: "Search Gno activity", kind: "Read", description: "Search canonical Pearl blocks and transactions without scraping the explorer UI." },
  { name: "prepare_pearl_payment", title: "Prepare Pearl payment", kind: "Prepare", description: "Create fixed-resource testnet payment terms for a human to review. It never signs or sends." },
  { name: "open_payment_review", title: "Open payment review", kind: "Navigate", description: "Move the shared page to the Adena review screen after terms have been prepared." },
  { name: "get_payment_receipt", title: "Get payment receipt", kind: "Read", description: "Verify the durable status and chain receipt for an exact payment ID." },
] as const;

export type PreparedWebMCPPayment = {
  version: 1;
  preparedAt: string;
  paymentRequirements: PaymentRequirements;
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
type WebMCPDependencies = {
  fetcher: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  origin: string;
  savePreparedPayment: (payment: PreparedWebMCPPayment) => void;
  loadPreparedPayment: () => PreparedWebMCPPayment | null;
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
  constructor(public readonly code: string, message: string, public readonly retryable = false) {
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
  if (unexpected) throw new ToolInputError(`Unexpected input field: ${unexpected}`);
  return value;
}

function requiredString(input: JsonRecord, key: string, pattern: RegExp, maxLength: number): string {
  const value = input[key];
  if (typeof value !== "string" || value.length > maxLength || !pattern.test(value)) {
    throw new ToolInputError(`Invalid ${key}.`);
  }
  return value;
}

function optionalString(input: JsonRecord, key: string, maxLength: number): string {
  const value = input[key];
  if (value === undefined) return "";
  if (typeof value !== "string" || value.length > maxLength) throw new ToolInputError(`Invalid ${key}.`);
  return value.trim();
}

function optionalLimit(input: JsonRecord, fallback: number, maximum: number): number {
  const value = input.limit;
  if (value === undefined) return fallback;
  if (!Number.isInteger(value) || Number(value) < 1 || Number(value) > maximum) throw new ToolInputError("Invalid limit.");
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
  return value.scheme === "exact"
    && typeof value.network === "string" && /^gno:[a-z0-9-]{2,40}$/.test(value.network)
    && typeof value.asset === "string" && value.asset.length >= 3 && value.asset.length <= 200
    && typeof value.amount === "string" && /^[1-9][0-9]{0,39}$/.test(value.amount)
    && typeof value.payTo === "string" && /^g1[023456789acdefghjklmnpqrstuvwxyz]{38}$/.test(value.payTo)
    && typeof value.resource === "string" && value.resource.length <= 2048
    && typeof value.maxTimeoutSeconds === "number" && Number.isInteger(value.maxTimeoutSeconds) && value.maxTimeoutSeconds >= 5 && value.maxTimeoutSeconds <= 3600
    && typeof extra.chainId === "string" && extra.chainId.length > 0 && extra.chainId.length <= 80
    && typeof extra.denom === "string" && extra.denom.length > 0 && extra.denom.length <= 80
    && typeof extra.resourceHash === "string" && /^[a-f0-9]{64}$/.test(extra.resourceHash)
    && typeof extra.expiresAt === "number" && Number.isInteger(extra.expiresAt) && extra.expiresAt > 0
    && typeof extra.nonce === "string" && /^[A-Za-z0-9_-]{16,128}$/.test(extra.nonce);
}

function assertSafeTerms(requirements: PaymentRequirements, walletAddress: string, origin: string) {
  let resource: URL;
  try {
    resource = new URL(requirements.resource);
  } catch {
    throw new ToolRequestError("unsafe_terms", "The payment resource is invalid.");
  }
  if (requirements.network !== "gno:pearl-1"
    || requirements.extra.chainId !== "pearl-1"
    || requirements.extra.paymentMode !== "direct"
    || requirements.asset !== "gno.land/r/gnoland/wugnot"
    || requirements.extra.denom !== "ugnot"
    || requirements.amount !== "1000"
    || requirements.payTo !== walletAddress
    || resource.origin !== origin
    || resource.pathname !== "/api/demo/paid-data"
    || resource.search !== "") {
    throw new ToolRequestError("unsafe_terms", "The facilitator returned terms outside the fixed Pearl self-test policy.");
  }
}

function assertSafeHealth(health: JsonRecord) {
  const locks = child(health.locks);
  const settlement = child(health.settlement);
  const contract = child(health.gnoContract);
  if (health.status !== "ok"
    || health.network !== "gno:pearl-1"
    || health.chainId !== "pearl-1"
    || locks.gnoMainnet !== true
    || settlement.enabled !== true
    || settlement.selfTest !== true
    || contract.paymentMode !== "direct") {
    throw new ToolRequestError("safety_check_failed", "Pearl self-test safety controls could not be verified.");
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

export function isSafePreparedWebMCPPayment(payment: PreparedWebMCPPayment, walletAddress: string, origin: string, at = Date.now()): boolean {
  try {
    if (payment.paymentRequirements.extra.expiresAt <= Math.floor(at / 1000)) return false;
    assertSafeTerms(payment.paymentRequirements, walletAddress, origin);
    return true;
  } catch {
    return false;
  }
}

export function decodePreparedWebMCPPayment(raw: string | null): PreparedWebMCPPayment | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value) || value.version !== 1 || typeof value.preparedAt !== "string" || !isPaymentRequirements(value.paymentRequirements)) return null;
    return value as PreparedWebMCPPayment;
  } catch {
    return null;
  }
}

async function jsonRequest(
  deps: WebMCPDependencies,
  path: string,
  init: RequestInit,
  acceptedStatuses: readonly number[],
  signal?: AbortSignal,
): Promise<{ response: Response; body: JsonRecord }> {
  const response = await deps.fetcher(path, { ...init, signal, cache: "no-store" });
  let parsed: unknown;
  try {
    parsed = await response.json();
  } catch {
    throw new ToolRequestError("invalid_response", "The gateway returned an invalid response.", true);
  }
  const body = child(parsed);
  if (!acceptedStatuses.includes(response.status)) {
    const serverCode = stringValue(body.error);
    throw new ToolRequestError(serverCode || `http_${response.status}`, "The gateway could not complete the request.", response.status >= 500 || response.status === 429);
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

function safeMessage(error: unknown): { code: string; message: string; retryable: boolean } {
  if (error instanceof ToolInputError) return { code: "invalid_input", message: error.message, retryable: false };
  if (error instanceof ToolRequestError) return { code: error.code, message: error.message, retryable: error.retryable };
  if (error instanceof DOMException && error.name === "AbortError") return { code: "cancelled", message: "The tool call was cancelled.", retryable: true };
  return { code: "tool_failed", message: "The tool could not complete the request.", retryable: true };
}

function makeTool(
  deps: WebMCPDependencies,
  definition: Omit<WebMCPTool, "execute">,
  perform: (input: unknown, options: WebMCPExecutionOptions) => Promise<JsonRecord>,
  summarize: (result: JsonRecord) => string,
): WebMCPTool {
  return {
    ...definition,
    async execute(input: unknown, options: WebMCPExecutionOptions = {}) {
      const now = deps.now?.() || new Date();
      const randomId = deps.randomId?.() || crypto.randomUUID();
      try {
        const result = await perform(input, options);
        try { deps.recordActivity({ id: randomId, tool: definition.name, status: "success", summary: summarize(result), at: now.toISOString() }); } catch {}
        return result;
      } catch (error) {
        const safe = safeMessage(error);
        try { deps.recordActivity({ id: randomId, tool: definition.name, status: "error", summary: safe.message, at: now.toISOString() }); } catch {}
        return { ok: false, error: safe };
      }
    },
  };
}

export function createWebMCPTools(deps: WebMCPDependencies): WebMCPTool[] {
  const now = deps.now || (() => new Date());

  const inspect = makeTool(deps, {
    name: "inspect_g402_gateway",
    title: "Inspect g402 gateway",
    description: "Read the live g402 facilitator, Pearl network, settlement rail, scan checkpoint, and mainnet safety lock. Does not change state.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, untrustedContentHint: false },
  }, async (input, options) => {
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
    const kinds = Array.isArray(supportedResult.body.kinds) ? supportedResult.body.kinds : [];
    const firstKind = child(kinds[0]);
    const mainnetLocked = booleanValue(locks.gnoMainnet) === true;
    const healthy = health.status === "ok"
      && health.network === "gno:pearl-1"
      && health.chainId === "pearl-1"
      && mainnetLocked;
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
  }, (result) => `Gateway ${result.healthy === true ? "healthy" : "not healthy"}; mainnet ${result.mainnetLocked === true ? "locked" : "lock not verified"}.`);

  const search = makeTool(deps, {
    name: "search_gno_activity",
    title: "Search Gno activity",
    description: "Search canonical Pearl testnet transactions by hash, payment ID, address, or height. Returns a small bounded result and does not change state.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", maxLength: 128, description: "Transaction hash, payment ID, Gno address, or block height. Empty means latest." },
        limit: { type: "integer", minimum: 1, maximum: 5, default: 5, description: "Maximum results." },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, untrustedContentHint: true },
  }, async (input, options) => {
    const value = objectInput(input, ["query", "limit"]);
    const query = optionalString(value, "query", 128);
    const limit = optionalLimit(value, 5, 5);
    const { body } = await jsonRequest(deps, `/api/v1/scan?q=${encodeURIComponent(query)}&limit=${limit}`, {}, [200], options.signal);
    const status = child(body.status);
    const transactions = Array.isArray(body.transactions) ? body.transactions.slice(0, limit).map(compactTransaction) : [];
    return {
      ok: true,
      query,
      network: stringValue(status.network),
      indexedHeight: numberValue(status.indexedHeight),
      chainHeight: numberValue(status.chainHeight),
      count: transactions.length,
      transactions,
    };
  }, (result) => `Found ${numberValue(result.count) || 0} canonical transaction(s).`);

  const prepare = makeTool(deps, {
    name: "prepare_pearl_payment",
    title: "Prepare Pearl payment",
    description: "Create reviewable terms for the fixed paid-data demo using a Pearl Adena address. This writes an expiring challenge but never opens the wallet, signs, or transfers funds.",
    inputSchema: {
      type: "object",
      properties: {
        walletAddress: { type: "string", pattern: "^g1[023456789acdefghjklmnpqrstuvwxyz]{38}$", maxLength: 40, description: "Pearl Adena address that will self-pay in the safe demo." },
      },
      required: ["walletAddress"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
  }, async (input, options) => {
    const value = objectInput(input, ["walletAddress"]);
    const walletAddress = requiredString(value, "walletAddress", /^g1[023456789acdefghjklmnpqrstuvwxyz]{38}$/, 40);
    const healthResult = await jsonRequest(deps, "/api/health", {}, [200], options.signal);
    assertSafeHealth(healthResult.body);
    const { body } = await jsonRequest(deps, `/api/demo/paid-data?payTo=${encodeURIComponent(walletAddress)}`, {}, [402], options.signal);
    const requirements = body.paymentRequirements;
    if (!isPaymentRequirements(requirements)) throw new ToolRequestError("invalid_terms", "The facilitator returned invalid payment terms.", true);
    assertSafeTerms(requirements, walletAddress, deps.origin);
    const prepared: PreparedWebMCPPayment = { version: 1, preparedAt: now().toISOString(), paymentRequirements: requirements };
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
      humanAction: "Review the terms, connect the matching Adena wallet, and approve its signature request.",
      mainnetLocked: true,
    };
  }, (result) => `Prepared ${stringValue(result.amount) || "test"} WUGNOT terms; no transfer submitted.`);

  const review = makeTool(deps, {
    name: "open_payment_review",
    title: "Open payment review",
    description: "Open the human review screen for already prepared Pearl terms. This changes the visible page but does not sign or transfer funds.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
  }, async (input, options) => {
    objectInput(input, []);
    const prepared = deps.loadPreparedPayment();
    if (!prepared || prepared.paymentRequirements.extra.expiresAt <= Math.floor(now().getTime() / 1000)) {
      throw new ToolRequestError("prepared_payment_missing", "Prepare fresh Pearl payment terms before opening review.");
    }
    assertSafeTerms(prepared.paymentRequirements, prepared.paymentRequirements.payTo, deps.origin);
    const healthResult = await jsonRequest(deps, "/api/health", {}, [200], options.signal);
    assertSafeHealth(healthResult.body);
    deps.navigate("/wallet?source=webmcp");
    return {
      ok: true,
      opened: "/wallet?source=webmcp",
      transferSubmitted: false,
      nextAction: "The human reviews the terms and explicitly approves the Adena signature.",
      mainnetLocked: true,
    };
  }, () => "Opened the human Adena review screen; no transfer submitted.");

  const receipt = makeTool(deps, {
    name: "get_payment_receipt",
    title: "Get payment receipt",
    description: "Look up one exact g402 payment ID in the durable facilitator ledger and return its settlement and block status. Does not change state.",
    inputSchema: {
      type: "object",
      properties: {
        paymentId: { type: "string", pattern: "^[A-Za-z0-9_-]{16,128}$", maxLength: 128, description: "Exact g402 payment ID shown after Adena approval." },
      },
      required: ["paymentId"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, untrustedContentHint: true },
  }, async (input, options) => {
    const value = objectInput(input, ["paymentId"]);
    const paymentId = requiredString(value, "paymentId", /^[A-Za-z0-9_-]{16,128}$/, 128);
    const { body } = await jsonRequest(deps, `/api/v1/payments?paymentId=${encodeURIComponent(paymentId)}`, {}, [200], options.signal);
    const match = body.payment;
    if (!match) return { ok: true, found: false, paymentId, nextAction: "Check the payment ID or wait for settlement, then retry." };
    return { ok: true, found: true, receipt: compactPayment(match) };
  }, (result) => result.found === true ? "Found the durable payment receipt." : "No receipt found yet.");

  return [inspect, search, prepare, review, receipt];
}
