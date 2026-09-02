import { z } from "zod";
import { isAddress as isEvmAddress } from "viem";
import {
  HTTPFacilitatorClient,
  type FacilitatorClient,
} from "@x402/core/server";
import type {
  Network,
  PaymentPayload,
  PaymentRequired,
  PaymentRequirements,
  ResourceInfo,
  SettleResponse,
  VerifyResponse,
} from "@x402/core/types";
import { SettleError } from "@x402/core/types";
import { getDefaultAsset } from "@x402/evm";
import { canonicalHash } from "../packages/x402-core/src/index.ts";
import {
  address,
  createNoopSigner,
  getAddressEncoder,
  getBase58Encoder,
  getProgramDerivedAddress,
  getTransactionDecoder,
} from "@solana/kit";
import { ExactSvmScheme as ExactSvmClientScheme } from "@x402/svm/exact/client";
import { createGnoChallenge } from "./challenge.ts";
import { resourceHash } from "./domain.ts";
import {
  appendAudit,
  claimSettlement,
  findChallenge,
  findPayment,
  replaceChallengeUnsignedPayloadHash,
  saveChallenge,
  savePayment,
  validateProtocolChallenge,
  type IssuedChallenge,
  type PaymentRecord,
} from "./store.ts";
import {
  reconcileKnownProtocolPayment,
  type ReconciliationResult,
} from "./reconciliation.ts";

export const X402_SDK_VERSION = "2.24.0";
export const BASE_SEPOLIA_NETWORK = "eip155:84532" as const;
export const ETHEREUM_MAINNET = "eip155:1" as const;
export const SOLANA_DEVNET_NETWORK =
  "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1" as const;
export const SOLANA_MAINNET =
  "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp" as const;
export const BASE_SEPOLIA_USDC =
  "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;
export const ETHEREUM_USDC =
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as const;
export const SOLANA_DEVNET_USDC =
  "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU" as const;
export const SOLANA_MAINNET_USDC =
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" as const;
export const BASE_SEPOLIA_DEMO_RECIPIENT =
  "0x7e758891b2965eb82e4a121f66d5f6f3d6a2dec6" as const;
export const SOLANA_DEVNET_DEMO_RECIPIENT =
  "CKPKJWNdJEqa81x7CkZ14BVPiY6y16Sxs7owznqtWYp5" as const;

export type RailId =
  | "gno-pearl"
  | "evm-base-sepolia"
  | "evm-ethereum-mainnet"
  | "svm-solana-devnet"
  | "svm-solana-mainnet";
export type RailFamily = "gno" | "evm" | "svm";
export type RailCapability = {
  id: RailId;
  family: RailFamily;
  label: string;
  network: Network;
  chain: string;
  asset: string;
  symbol: string;
  decimals: number;
  maxTimeoutSeconds: number;
  priceAtomic: string;
  recipient?: string;
  recipientMode: "merchant-config" | "testnet-demo-sink" | "self-test";
  wallet: string;
  settlement: "native" | "x402-facilitator";
  apiVersion: "v1" | "v2";
  status: "native_ready" | "sdk_ready" | "setup_required" | "locked";
  mainnet: boolean;
  capabilities: string[];
};

const IntegerAmount = z
  .string()
  .regex(/^[1-9][0-9]*$/)
  .max(40);
const SOLANA_TOKEN_PROGRAM = address(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
);
const SOLANA_ASSOCIATED_TOKEN_PROGRAM = address(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
);
const SOLANA_DEVNET_PUBLIC_RPCS = [
  "https://api.devnet.solana.com",
  "https://solana-devnet.api.onfinality.io/public",
  "https://rpc.ankr.com/solana_devnet",
] as const;
const SOLANA_RPC_CACHE_TTL_MS = 5 * 60_000;
const SOLANA_ATA_CACHE_TTL_MS = 25_000;
const SOLANA_RPC_ATTEMPT_TIMEOUT_MS = 7_000;
const SOLANA_RPC_TOTAL_TIMEOUT_MS = 18_000;
const SOLANA_MAX_RPC_URLS = 3;
const verifiedSolanaRpcs = new Map<string, number>();
const verifiedSolanaRecipientAtas = new Map<string, number>();
const pendingSolanaRpcChecks = new Map<string, Promise<void>>();
const pendingSolanaAtaChecks = new Map<string, Promise<void>>();
const NetworkSchema = z
  .string()
  .regex(/^(gno|eip155|solana):[A-Za-z0-9-]{1,80}$/) as z.ZodType<Network>;
const ResourceInfoSchema = z
  .object({
    url: z.string().url().max(2048),
    description: z.string().max(280).optional(),
    mimeType: z.string().max(100).optional(),
    serviceName: z.string().max(100).optional(),
    tags: z.array(z.string().max(40)).max(12).optional(),
    iconUrl: z.string().url().max(2048).optional(),
  })
  .strict();
export const ProtocolRequirementsSchema = z
  .object({
    scheme: z.literal("exact"),
    network: NetworkSchema,
    asset: z.string().min(3).max(200),
    amount: IntegerAmount,
    payTo: z.string().min(3).max(128),
    maxTimeoutSeconds: z.number().int().min(5).max(3600),
    extra: z.record(z.string(), z.unknown()),
  })
  .strict() as z.ZodType<PaymentRequirements>;
export const ProtocolPayloadSchema = z
  .object({
    x402Version: z.literal(2),
    resource: ResourceInfoSchema.optional(),
    accepted: ProtocolRequirementsSchema,
    payload: z.record(z.string(), z.unknown()),
    extensions: z.record(z.string(), z.unknown()).optional(),
  })
  .strict() as z.ZodType<PaymentPayload>;
export const ProtocolPaymentRequiredSchema = z
  .object({
    x402Version: z.literal(2),
    resource: ResourceInfoSchema,
    accepts: z.array(ProtocolRequirementsSchema).length(1),
    extensions: z.record(z.string(), z.unknown()).optional(),
    error: z.string().max(280).optional(),
  })
  .strict() as z.ZodType<PaymentRequired>;
export const ProtocolSettleRequestSchema = z
  .object({
    challengeId: z.string().regex(/^[a-f0-9]{32}$/),
    paymentId: z.string().regex(/^[A-Za-z0-9_-]{16,128}$/),
    paymentPayload: ProtocolPayloadSchema,
  })
  .strict();
const ProtocolReviewRequestSchema = z
  .object({
    challengeId: z.string().regex(/^[a-f0-9]{32}$/),
    walletAddress: z.string().min(3).max(128),
    paymentRequired: ProtocolPaymentRequiredSchema,
    unsignedPaymentPayload: z
      .object({
        x402Version: z.literal(2),
        payload: z.record(z.string(), z.unknown()),
        extensions: z.record(z.string(), z.unknown()).optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

function amountForDemo(): string {
  const value = process.env.X402_SAMPLE_PRICE_ATOMIC || "1000";
  const parsed = IntegerAmount.parse(value);
  if (BigInt(parsed) > 1_000_000n) throw new Error("demo_price_exceeds_1_usdc");
  return parsed;
}

function gnoRail(): RailCapability {
  return {
    id: "gno-pearl",
    family: "gno",
    label: "Gno Pearl",
    network: (process.env.GNO_NETWORK_ID || "gno:pearl-1") as Network,
    chain: process.env.GNO_CHAIN_ID || "pearl-1",
    asset: process.env.GNO_ASSET || "gno.land/r/gnoland/wugnot",
    symbol: "WUGNOT",
    decimals: 6,
    maxTimeoutSeconds: 300,
    priceAtomic: amountForDemo(),
    recipient: process.env.G402_MERCHANT_ADDRESS,
    recipientMode:
      process.env.G402_SELF_TEST_MODE === "true"
        ? "self-test"
        : "merchant-config",
    wallet: "Adena",
    settlement: "native",
    apiVersion: "v1",
    status:
      process.env.G402_MERCHANT_ADDRESS ||
      process.env.G402_SELF_TEST_MODE === "true"
        ? "native_ready"
        : "setup_required",
    mainnet: false,
    capabilities: ["exact", "direct-transfer", "resource-memo"],
  };
}

export function paymentRails(): RailCapability[] {
  const productionFacilitator = hasProductionFacilitator();
  const ethereumRecipient = process.env.X402_ETHEREUM_PAY_TO;
  const solanaMainnetRecipient = process.env.X402_SOLANA_MAINNET_PAY_TO;
  const ethereumOptIn = process.env.X402_ALLOW_EVM_MAINNET === "true";
  const solanaOptIn = process.env.X402_ALLOW_SOLANA_MAINNET === "true";
  const ethereumSettlementGate =
    process.env.X402_ENABLE_EVM_MAINNET_SETTLEMENT === "true";
  const solanaSettlementGate =
    process.env.X402_ENABLE_SOLANA_MAINNET_SETTLEMENT === "true";
  return [
    gnoRail(),
    {
      id: "evm-base-sepolia",
      family: "evm",
      label: "Base Sepolia (EVM)",
      network: BASE_SEPOLIA_NETWORK,
      chain: "Base Sepolia",
      asset: BASE_SEPOLIA_USDC,
      symbol: "USDC",
      decimals: 6,
      maxTimeoutSeconds: 300,
      priceAtomic: amountForDemo(),
      recipient: process.env.X402_EVM_PAY_TO || BASE_SEPOLIA_DEMO_RECIPIENT,
      recipientMode: process.env.X402_EVM_PAY_TO
        ? "merchant-config"
        : "testnet-demo-sink",
      wallet: "EIP-1193",
      settlement: "x402-facilitator",
      apiVersion: "v2",
      status: "sdk_ready",
      mainnet: false,
      capabilities: ["exact", "EIP-3009", "EIP-712", "EOA"],
    },
    {
      id: "evm-ethereum-mainnet",
      family: "evm",
      label: "Ethereum Mainnet",
      network: ETHEREUM_MAINNET,
      chain: "Ethereum",
      asset: ETHEREUM_USDC,
      symbol: "USDC",
      decimals: 6,
      maxTimeoutSeconds: 300,
      priceAtomic: amountForDemo(),
      recipient: ethereumRecipient,
      recipientMode: "merchant-config",
      wallet: "EIP-1193",
      settlement: "x402-facilitator",
      apiVersion: "v2",
      status:
        !ethereumOptIn || !ethereumSettlementGate
          ? "locked"
          : productionFacilitator &&
              ethereumRecipient &&
              validWalletAddress("evm", ethereumRecipient) &&
              hasValidHttpsEndpoint(process.env.ETHEREUM_MAINNET_RPC_URL)
            ? "sdk_ready"
            : "setup_required",
      mainnet: true,
      capabilities: ["exact", "EIP-3009", "EIP-712", "EOA"],
    },
    {
      id: "svm-solana-devnet",
      family: "svm",
      label: "Solana",
      network: SOLANA_DEVNET_NETWORK,
      chain: "Solana Devnet",
      asset: SOLANA_DEVNET_USDC,
      symbol: "USDC",
      decimals: 6,
      maxTimeoutSeconds: 60,
      priceAtomic: amountForDemo(),
      recipient: process.env.X402_SOLANA_PAY_TO || SOLANA_DEVNET_DEMO_RECIPIENT,
      recipientMode: process.env.X402_SOLANA_PAY_TO
        ? "merchant-config"
        : "testnet-demo-sink",
      wallet: "Wallet Standard",
      settlement: "x402-facilitator",
      apiVersion: "v2",
      status: "sdk_ready",
      mainnet: false,
      capabilities: ["exact", "SPL Token", "v0 transaction", "sponsored fees"],
    },
    {
      id: "svm-solana-mainnet",
      family: "svm",
      label: "Solana Mainnet",
      network: SOLANA_MAINNET,
      chain: "Solana Mainnet",
      asset: SOLANA_MAINNET_USDC,
      symbol: "USDC",
      decimals: 6,
      maxTimeoutSeconds: 60,
      priceAtomic: amountForDemo(),
      recipient: solanaMainnetRecipient,
      recipientMode: "merchant-config",
      wallet: "Wallet Standard",
      settlement: "x402-facilitator",
      apiVersion: "v2",
      status:
        !solanaOptIn || !solanaSettlementGate
          ? "locked"
          : productionFacilitator &&
              solanaMainnetRecipient &&
              validWalletAddress("svm", solanaMainnetRecipient) &&
              hasValidHttpsEndpoint(process.env.SOLANA_MAINNET_RPC_URL)
            ? "sdk_ready"
            : "setup_required",
      mainnet: true,
      capabilities: ["exact", "SPL Token", "v0 transaction", "sponsored fees"],
    },
  ];
}

export function mainnetReadiness() {
  const rails = paymentRails();
  const ethereum = rails.find((rail) => rail.id === "evm-ethereum-mainnet")!;
  const solana = rails.find((rail) => rail.id === "svm-solana-mainnet")!;
  return [
    {
      family: "evm" as const,
      network: ETHEREUM_MAINNET,
      asset: ETHEREUM_USDC,
      codeSupported: true,
      settlementEnabled: ethereum.status === "sdk_ready",
      lock: "X402_ALLOW_EVM_MAINNET",
      settlementGate: "X402_ENABLE_EVM_MAINNET_SETTLEMENT",
      requirement:
        "production facilitator with eip155:1 support and an HTTPS reconciliation RPC",
    },
    {
      family: "svm" as const,
      network: SOLANA_MAINNET,
      asset: SOLANA_MAINNET_USDC,
      codeSupported: true,
      settlementEnabled: solana.status === "sdk_ready",
      lock: "X402_ALLOW_SOLANA_MAINNET",
      settlementGate: "X402_ENABLE_SOLANA_MAINNET_SETTLEMENT",
      requirement: "production facilitator with Solana mainnet support",
    },
    {
      family: "gno" as const,
      network: "gno:mainnet" as Network,
      asset: process.env.GNO_ASSET || "gno.land/r/gnoland/wugnot",
      codeSupported: true,
      settlementEnabled:
        process.env.G402_ALLOW_MAINNET === "true" &&
        process.env.G402_ENABLE_SETTLEMENT === "true" &&
        process.env.GNO_NETWORK_ID === "gno:mainnet" &&
        Boolean(process.env.G402_MERCHANT_ADDRESS),
      lock: "G402_ALLOW_MAINNET",
      requirement: "explicit Gno mainnet configuration",
    },
  ];
}

export function railById(id: string): RailCapability {
  const rail = paymentRails().find((candidate) => candidate.id === id);
  if (!rail) throw new Error("unsupported_payment_rail");
  if (rail.mainnet && rail.status !== "sdk_ready")
    throw new Error("mainnet_rail_locked");
  return rail;
}

export function railForRequirements(
  requirements: PaymentRequirements,
): RailCapability {
  const rail = paymentRails().find(
    (candidate) => candidate.network === requirements.network,
  );
  if (!rail) throw new Error("unsupported_payment_network");
  if (rail.mainnet && rail.status !== "sdk_ready")
    throw new Error("mainnet_rail_locked");
  const sameAsset =
    rail.family === "evm"
      ? rail.asset.toLowerCase() === requirements.asset.toLowerCase()
      : rail.asset === requirements.asset;
  if (!sameAsset) throw new Error("unsupported_payment_asset");
  return rail;
}

function parseSolanaRpcUrl(raw: string): string {
  const parsed = new URL(raw);
  if (
    parsed.protocol !== "https:" ||
    parsed.username ||
    parsed.password ||
    parsed.hash
  )
    throw new Error("invalid_solana_rpc_url");
  return parsed.toString();
}

function solanaRpcUrls(rail: RailCapability): string[] {
  if (rail.mainnet) {
    const raw = process.env.SOLANA_MAINNET_RPC_URL;
    if (!raw) throw new Error("solana_rpc_required");
    return [parseSolanaRpcUrl(raw)];
  }
  const configuredList = process.env.SOLANA_DEVNET_RPC_URLS?.trim();
  const configuredSingle = process.env.SOLANA_DEVNET_RPC_URL?.trim();
  const rawUrls = configuredList
    ? configuredList.split(",").map((value) => value.trim())
    : configuredSingle
      ? [configuredSingle]
      : [...SOLANA_DEVNET_PUBLIC_RPCS];
  const urls = [
    ...new Set(rawUrls.filter(Boolean).map(parseSolanaRpcUrl)),
  ];
  if (!urls.length) throw new Error("solana_rpc_required");
  if (urls.length > SOLANA_MAX_RPC_URLS)
    throw new Error("too_many_solana_rpc_urls");
  return urls;
}

function pruneExpiryCache(cache: Map<string, number>, now = Date.now()): void {
  for (const [key, expiresAt] of cache) {
    if (expiresAt <= now) cache.delete(key);
  }
  while (cache.size >= 64) cache.delete(cache.keys().next().value!);
}

async function solanaRpcRequest(
  rpcUrl: string,
  method: string,
  params: unknown[] = [],
): Promise<unknown> {
  const id = crypto.randomUUID();
  let response: Response;
  try {
    response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
      redirect: "error",
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    throw new Error("solana_rpc_unavailable");
  }
  if (!response.ok) throw new Error("solana_rpc_unavailable");
  let body: {
    jsonrpc?: unknown;
    id?: unknown;
    result?: unknown;
    error?: unknown;
  };
  try {
    body = (await response.json()) as typeof body;
  } catch {
    throw new Error("solana_rpc_unavailable");
  }
  if (
    body.jsonrpc !== "2.0" ||
    body.id !== id ||
    body.error ||
    !("result" in body)
  )
    throw new Error("solana_rpc_unavailable");
  return body.result;
}

async function assertSolanaRpcForRail(
  rail: RailCapability,
  rpcUrl: string,
): Promise<void> {
  const key = `${rail.network}:${rpcUrl}`;
  const now = Date.now();
  pruneExpiryCache(verifiedSolanaRpcs, now);
  if ((verifiedSolanaRpcs.get(key) || 0) > now) return;
  const existing = pendingSolanaRpcChecks.get(key);
  if (existing) return existing;
  const pending = (async () => {
    const result = await solanaRpcRequest(rpcUrl, "getGenesisHash");
    if (typeof result !== "string")
      throw new Error("solana_rpc_unavailable");
    if (result !== rail.network.slice("solana:".length))
      throw new Error("solana_rpc_wrong_cluster");
    pruneExpiryCache(verifiedSolanaRpcs);
    verifiedSolanaRpcs.set(key, Date.now() + SOLANA_RPC_CACHE_TTL_MS);
  })();
  pendingSolanaRpcChecks.set(key, pending);
  try {
    await pending;
  } finally {
    if (pendingSolanaRpcChecks.get(key) === pending)
      pendingSolanaRpcChecks.delete(key);
  }
}

function sameBytes(actual: ArrayLike<number>, expected: ArrayLike<number>): boolean {
  if (actual.length !== expected.length) return false;
  for (let index = 0; index < actual.length; index += 1) {
    if (actual[index] !== expected[index]) return false;
  }
  return true;
}

async function ensureSolanaRecipientAtaAtRpc(
  rail: RailCapability,
  recipient: string,
  rpcUrl: string,
  forceCheck = false,
): Promise<void> {
  const cacheKey = `${rail.network}:${rail.asset}:${recipient}:${rpcUrl}`;
  const now = Date.now();
  pruneExpiryCache(verifiedSolanaRecipientAtas, now);
  if (!forceCheck && (verifiedSolanaRecipientAtas.get(cacheKey) || 0) > now)
    return;
  const existing = pendingSolanaAtaChecks.get(cacheKey);
  if (existing) return existing;
  const encoder = getAddressEncoder();
  const [ata] = await getProgramDerivedAddress({
    programAddress: SOLANA_ASSOCIATED_TOKEN_PROGRAM,
    seeds: [
      encoder.encode(address(recipient)),
      encoder.encode(SOLANA_TOKEN_PROGRAM),
      encoder.encode(address(rail.asset)),
    ],
  });
  const pending = (async () => {
    const result = await solanaRpcRequest(rpcUrl, "getAccountInfo", [
      ata,
      { encoding: "base64", commitment: "finalized" },
    ]);
    if (!result || typeof result !== "object" || !("value" in result))
      throw new Error("solana_rpc_unavailable");
    const value = (result as { value: unknown }).value;
    if (value === null) throw new Error("solana_recipient_ata_required");
    if (!value || typeof value !== "object")
      throw new Error("solana_rpc_unavailable");
    const account = value as {
      owner?: unknown;
      executable?: unknown;
      data?: unknown;
    };
    if (account.owner !== SOLANA_TOKEN_PROGRAM)
      throw new Error("solana_recipient_ata_invalid");
    if (account.executable !== false)
      throw new Error("solana_recipient_ata_invalid");
    if (
      !Array.isArray(account.data) ||
      account.data.length !== 2 ||
      typeof account.data[0] !== "string" ||
      account.data[1] !== "base64"
    )
      throw new Error("solana_recipient_ata_invalid");
    const data = Buffer.from(account.data[0], "base64");
    if (data.toString("base64") !== account.data[0])
      throw new Error("solana_rpc_unavailable");
    if (data.length !== 165)
      throw new Error("solana_recipient_ata_invalid");
    const mint = getBase58Encoder().encode(rail.asset);
    const authority = getBase58Encoder().encode(recipient);
    const validCOptionTags = [72, 109, 129].every((offset) => {
      const tag = data.readUInt32LE(offset);
      return tag === 0 || tag === 1;
    });
    if (
      !sameBytes(data.subarray(0, 32), mint) ||
      !sameBytes(data.subarray(32, 64), authority) ||
      data[108] !== 1 ||
      !validCOptionTags ||
      data.readUInt32LE(109) !== 0
    )
      throw new Error("solana_recipient_ata_invalid");
    pruneExpiryCache(verifiedSolanaRecipientAtas);
    verifiedSolanaRecipientAtas.set(
      cacheKey,
      Date.now() + SOLANA_ATA_CACHE_TTL_MS,
    );
  })();
  pendingSolanaAtaChecks.set(cacheKey, pending);
  try {
    await pending;
  } finally {
    if (pendingSolanaAtaChecks.get(cacheKey) === pending)
      pendingSolanaAtaChecks.delete(cacheKey);
  }
}

async function withSolanaTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  if (timeoutMs <= 0) throw new Error("solana_rpc_unavailable");
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("solana_rpc_unavailable")),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function isSolanaSemanticConstructionError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /unsupported network|known token program|feepayer is required|memo exceeds|invalid_solana_transaction/i.test(
    message,
  );
}

async function createSvmUnsignedPaymentPayload(
  rail: RailCapability,
  walletAddress: string,
  requirements: PaymentRequirements,
  options: { forceAtaCheck?: boolean } = {},
) {
  const rpcUrls = solanaRpcUrls(rail);
  const deadline = Date.now() + SOLANA_RPC_TOTAL_TIMEOUT_MS;
  let observedMissingAta = false;
  for (const rpcUrl of rpcUrls) {
    try {
      const attemptDeadline = Math.min(
        deadline,
        Date.now() + SOLANA_RPC_ATTEMPT_TIMEOUT_MS,
      );
      const remaining = () => attemptDeadline - Date.now();
      const clusterTimeout = remaining();
      if (clusterTimeout <= 0) throw new Error("solana_rpc_unavailable");
      await withSolanaTimeout(
        assertSolanaRpcForRail(rail, rpcUrl),
        clusterTimeout,
      );
      const ataTimeout = remaining();
      if (ataTimeout <= 0) throw new Error("solana_rpc_unavailable");
      await withSolanaTimeout(
        ensureSolanaRecipientAtaAtRpc(
          rail,
          requirements.payTo,
          rpcUrl,
          options.forceAtaCheck,
        ),
        ataTimeout,
      );
      const payloadTimeout = remaining();
      if (payloadTimeout <= 0) throw new Error("solana_rpc_unavailable");
      const payload = await withSolanaTimeout(
        new ExactSvmClientScheme(
          createNoopSigner(address(walletAddress)),
          { rpcUrl },
        ).createPaymentPayload(2, requirements),
        payloadTimeout,
      );
      svmMessageHash(payload);
      return payload;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (
        message === "solana_rpc_wrong_cluster" ||
        message === "solana_recipient_ata_invalid" ||
        isSolanaSemanticConstructionError(error)
      )
        throw error;
      if (message === "solana_recipient_ata_required") {
        observedMissingAta = true;
        continue;
      }
      if (rail.mainnet) break;
    }
  }
  if (observedMissingAta) throw new Error("solana_recipient_ata_required");
  throw new Error("solana_rpc_unavailable");
}

export function validWalletAddress(family: RailFamily, value: string): boolean {
  if (family === "evm") return isEvmAddress(value);
  if (family === "gno")
    return /^g1[023456789acdefghjklmnpqrstuvwxyz]{38}$/.test(value);
  try {
    address(value);
    return true;
  } catch {
    return false;
  }
}

function configuredFacilitatorUrl(): string {
  const raw =
    process.env.X402_FACILITATOR_URL || "https://x402.org/facilitator";
  const parsed = new URL(raw);
  if (
    parsed.protocol !== "https:" ||
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash
  )
    throw new Error("invalid_facilitator_url");
  return parsed.toString().replace(/\/$/, "");
}

function hasProductionFacilitator(): boolean {
  if (!process.env.X402_FACILITATOR_URL) return false;
  try {
    return configuredFacilitatorUrl() !== "https://x402.org/facilitator";
  } catch {
    return false;
  }
}

function hasValidHttpsEndpoint(raw: string | undefined): boolean {
  if (!raw) return false;
  try {
    const parsed = new URL(raw);
    return (
      parsed.protocol === "https:" &&
      !parsed.username &&
      !parsed.password &&
      !parsed.hash
    );
  } catch {
    return false;
  }
}

export function facilitatorDisplayOrigin(): string {
  return new URL(configuredFacilitatorUrl()).origin;
}

function facilitatorClient(): FacilitatorClient {
  const configuredTimeout = Number(process.env.X402_FACILITATOR_TIMEOUT_MS);
  const timeoutMs =
    Number.isInteger(configuredTimeout) &&
    configuredTimeout >= 1_000 &&
    configuredTimeout <= 60_000
      ? configuredTimeout
      : 15_000;
  const bearer = process.env.X402_FACILITATOR_BEARER_TOKEN;
  const authorization: Record<string, string> = bearer
    ? { Authorization: `Bearer ${bearer}` }
    : {};
  return new HTTPFacilitatorClient({
    url: configuredFacilitatorUrl(),
    timeoutMs,
    ...(bearer
      ? {
          createAuthHeaders: async () => ({
            verify: authorization,
            settle: authorization,
            supported: authorization,
          }),
        }
      : {}),
  });
}

function configuredRecipient(rail: RailCapability): string {
  const recipient = rail.recipient;
  if (!recipient) throw new Error("merchant_recipient_required");
  if (!validWalletAddress(rail.family, recipient))
    throw new Error("invalid_wallet_address");
  return recipient;
}

async function ensureFacilitatorSupport(
  rail: RailCapability,
  client: FacilitatorClient,
): Promise<Record<string, unknown>> {
  const supported = await client.getSupported();
  const kind = supported.kinds.find(
    (candidate) =>
      candidate.x402Version === 2 &&
      candidate.scheme === "exact" &&
      candidate.network === rail.network,
  );
  if (!kind) throw new Error("facilitator_rail_unsupported");
  return kind.extra || {};
}

export type CreatedProtocolChallenge = {
  challengeId: string;
  paymentId: string;
  rail: RailCapability;
  paymentRequired: PaymentRequired;
  paymentRequiredHeader: string;
  reviewUrl: string;
  legacyPaymentRequirements?: unknown;
  unsignedPaymentPayload?: {
    x402Version: number;
    payload: Record<string, unknown>;
    extensions?: Record<string, unknown>;
  };
  expectedPayer: string;
};

function assertProtocolEnvelopeSize(raw: unknown): void {
  let encoded: string;
  try {
    encoded = JSON.stringify(raw);
  } catch {
    throw new Error("invalid_payment_envelope");
  }
  if (encoded.length > 500_000) throw new Error("payment_envelope_too_large");
}

function samePayer(
  family: RailFamily,
  expected: string,
  actual: string,
): boolean {
  return family === "evm"
    ? expected.toLowerCase() === actual.toLowerCase()
    : expected === actual;
}

function validTransactionId(family: RailFamily, value: string): boolean {
  if (family === "evm") return /^0x[0-9a-fA-F]{64}$/.test(value);
  if (family === "svm") {
    try {
      return getBase58Encoder().encode(value).length === 64;
    } catch {
      return false;
    }
  }
  return /^[A-Za-z0-9_-]{16,128}$/.test(value);
}

function boundedSettlementError(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  return String(value).slice(0, 500);
}

function svmMessageHash(value: unknown): string {
  const transaction = (value as { payload?: { transaction?: unknown } } | null)
    ?.payload?.transaction;
  if (
    typeof transaction !== "string" ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(transaction)
  )
    throw new Error("invalid_solana_transaction");
  const bytes = Buffer.from(transaction, "base64");
  if (!bytes.length || bytes.toString("base64") !== transaction)
    throw new Error("invalid_solana_transaction");
  const decoded = getTransactionDecoder().decode(bytes);
  return canonicalHash(Array.from(decoded.messageBytes));
}

export async function createProtocolChallenge(
  input: {
    railId: RailId;
    resource: string;
    method?: "GET" | "POST";
    walletAddress: string;
    description?: string;
  },
  dependencies: { facilitator?: FacilitatorClient; now?: Date } = {},
): Promise<CreatedProtocolChallenge> {
  const rail = railById(input.railId);
  if (!validWalletAddress(rail.family, input.walletAddress))
    throw new Error("invalid_wallet_address");
  const method = input.method || "GET";
  const description = input.description || "x402 multichain paid weather data";
  if (rail.family === "gno") {
    const legacy = await createGnoChallenge(input.resource, method, {
      payTo: input.walletAddress,
      amount: amountForDemo(),
      description,
    });
    const accepted = ProtocolRequirementsSchema.parse({
      scheme: legacy.scheme,
      network: legacy.network,
      asset: legacy.asset,
      amount: legacy.amount,
      payTo: legacy.payTo,
      maxTimeoutSeconds: legacy.maxTimeoutSeconds,
      extra: legacy.extra,
    });
    const paymentRequired: PaymentRequired = {
      x402Version: 2,
      resource: {
        url: legacy.resource,
        description: legacy.description,
        mimeType: legacy.mimeType,
      },
      accepts: [accepted],
    };
    return {
      challengeId: legacy.extra.nonce,
      paymentId: `pay_${legacy.extra.nonce}`,
      rail,
      paymentRequired,
      paymentRequiredHeader: encodePaymentRequired(paymentRequired),
      reviewUrl: "/wallet",
      legacyPaymentRequirements: legacy,
      expectedPayer: input.walletAddress,
    };
  }

  const recipient = configuredRecipient(rail);
  const client = dependencies.facilitator || facilitatorClient();
  const facilitatorExtra = await ensureFacilitatorSupport(rail, client);
  const challengeId = crypto.randomUUID().replaceAll("-", "");
  const paymentId = `pay_${crypto.randomUUID().replaceAll("-", "")}`;
  const hash = resourceHash(method, input.resource);
  let issuedAt = dependencies.now || new Date();
  let expiresAt =
    Math.floor(issuedAt.getTime() / 1000) + rail.maxTimeoutSeconds;
  const extra: Record<string, unknown> =
    rail.family === "evm"
      ? (() => {
          const token = getDefaultAsset(rail.network);
          if (token.asset.toLowerCase() !== rail.asset.toLowerCase())
            throw new Error("default_asset_mismatch");
          return {
            name: token.name,
            version: token.version,
            assetTransferMethod: "eip3009",
            g402ChallengeId: challengeId,
            resourceHash: hash,
            authorizationNonce: `0x${canonicalHash({
              challengeId,
              paymentId,
              resourceHash: hash,
              network: rail.network,
              asset: rail.asset,
              amount: amountForDemo(),
              payTo: recipient,
              payer: input.walletAddress.toLowerCase(),
            })}`,
            validBefore: String(expiresAt),
          };
        })()
      : {
          feePayer: facilitatorExtra.feePayer,
          memo: `g402:${challengeId}:${hash}`,
        };
  if (rail.family === "svm" && !extra.feePayer)
    throw new Error("facilitator_fee_payer_missing");
  const accepted = ProtocolRequirementsSchema.parse({
    scheme: "exact",
    network: rail.network,
    asset: rail.asset,
    amount: amountForDemo(),
    payTo: recipient,
    maxTimeoutSeconds: rail.maxTimeoutSeconds,
    extra,
  });
  const resourceInfo: ResourceInfo = {
    url: input.resource,
    description,
    mimeType: "application/json",
    serviceName: "x402 Agent Treasury",
    tags: ["webmcp", "multichain"],
  };
  const paymentRequired: PaymentRequired = {
    x402Version: 2,
    resource: resourceInfo,
    accepts: [accepted],
  };
  const unsignedPaymentPayload =
    rail.family === "svm"
      ? await createSvmUnsignedPaymentPayload(
          rail,
          input.walletAddress,
          accepted,
        )
      : undefined;
  if (rail.family === "svm" && !dependencies.now) {
    issuedAt = new Date();
    expiresAt =
      Math.floor(issuedAt.getTime() / 1000) + rail.maxTimeoutSeconds;
  }
  await saveChallenge({
    nonce: challengeId,
    resource: input.resource,
    resourceHash: hash,
    method,
    network: accepted.network,
    chainId: accepted.network.split(":", 2)[1],
    asset: accepted.asset,
    denom: rail.symbol.toLowerCase(),
    amount: accepted.amount,
    payTo: accepted.payTo,
    paymentMode: "direct",
    expectedPayer: input.walletAddress,
    expectedPaymentId: paymentId,
    unsignedPayloadHash: unsignedPaymentPayload
      ? svmMessageHash(unsignedPaymentPayload)
      : undefined,
    railId: rail.id,
    requirementsHash: canonicalHash(accepted),
    requirements: accepted,
    resourceInfo,
    expiresAt,
    createdAt: issuedAt.toISOString(),
  });
  return {
    challengeId,
    paymentId,
    rail,
    paymentRequired,
    paymentRequiredHeader: encodePaymentRequired(paymentRequired),
    reviewUrl: `/pay?challenge=${challengeId}`,
    unsignedPaymentPayload,
    expectedPayer: input.walletAddress,
  };
}

export function encodePaymentRequired(
  paymentRequired: PaymentRequired,
): string {
  return Buffer.from(JSON.stringify(paymentRequired)).toString("base64");
}

export function protocolFingerprint(
  challengeId: string,
  paymentId: string,
  paymentPayload: PaymentPayload,
): string {
  return canonicalHash({
    challengeId,
    paymentId,
    paymentPayload,
  });
}

function assertSignedPayloadBinding(
  rail: RailCapability,
  issued: Awaited<ReturnType<typeof validateProtocolChallenge>>,
  paymentPayload: PaymentPayload,
): void {
  if (rail.family === "svm") {
    if (
      !issued.unsignedPayloadHash ||
      svmMessageHash(paymentPayload) !== issued.unsignedPayloadHash
    )
      throw new Error("signed_payload_binding_mismatch");
    return;
  }
  if (rail.family !== "evm") return;
  const raw = paymentPayload.payload as {
    authorization?: Record<string, unknown>;
    signature?: unknown;
  };
  const authorization = raw.authorization;
  const expectedNonce = issued.requirements?.extra?.authorizationNonce;
  const expectedValidBefore = issued.requirements?.extra?.validBefore;
  if (
    !authorization ||
    typeof raw.signature !== "string" ||
    !/^0x[0-9a-fA-F]{130}$/.test(raw.signature) ||
    typeof expectedNonce !== "string" ||
    typeof expectedValidBefore !== "string" ||
    authorization.nonce !== expectedNonce ||
    authorization.validBefore !== expectedValidBefore ||
    authorization.validAfter !== "0" ||
    authorization.value !== issued.amount ||
    typeof authorization.from !== "string" ||
    typeof authorization.to !== "string" ||
    !issued.expectedPayer ||
    !samePayer("evm", issued.expectedPayer, authorization.from) ||
    !samePayer("evm", issued.payTo, authorization.to)
  )
    throw new Error("signed_payload_binding_mismatch");
}

export async function validateProtocolReview(raw: unknown): Promise<{
  approved: true;
  railId: RailId;
  requirementsHash: string;
  unsignedPaymentPayload?: CreatedProtocolChallenge["unsignedPaymentPayload"];
}> {
  assertProtocolEnvelopeSize(raw);
  const input = ProtocolReviewRequestSchema.parse(raw);
  const requirements = input.paymentRequired.accepts[0];
  const rail = railForRequirements(requirements);
  if (rail.family === "gno") throw new Error("use_gno_wallet_review");
  const issued = await validateProtocolChallenge(
    input.challengeId,
    requirements,
  );
  const resourceMatches =
    issued.resourceInfo &&
    canonicalHash(issued.resourceInfo) ===
      canonicalHash(input.paymentRequired.resource);
  const payerMatches =
    issued.expectedPayer &&
    samePayer(rail.family, issued.expectedPayer, input.walletAddress);
  const unsignedMatches =
    rail.family === "svm"
      ? Boolean(
          issued.unsignedPayloadHash &&
          input.unsignedPaymentPayload &&
          svmMessageHash(input.unsignedPaymentPayload) ===
            issued.unsignedPayloadHash,
        )
      : !input.unsignedPaymentPayload && !issued.unsignedPayloadHash;
  if (
    issued.railId !== rail.id ||
    !resourceMatches ||
    !payerMatches ||
    !unsignedMatches
  )
    throw new Error("review_terms_mismatch");
  let unsignedPaymentPayload:
    CreatedProtocolChallenge["unsignedPaymentPayload"] | undefined;
  if (rail.family === "svm") {
    const startedAt = Math.floor(Date.now() / 1000);
    if (issued.expiresAt - startedAt < 15)
      throw new Error("challenge_expiring");
    unsignedPaymentPayload = await createSvmUnsignedPaymentPayload(
      rail,
      input.walletAddress,
      requirements,
      { forceAtaCheck: true },
    );
    const commitNow = Math.floor(Date.now() / 1000);
    if (issued.expiresAt - commitNow < 15)
      throw new Error("challenge_expiring");
    const nextHash = svmMessageHash(unsignedPaymentPayload);
    const replaced = await replaceChallengeUnsignedPayloadHash(
      input.challengeId,
      issued.unsignedPayloadHash!,
      nextHash,
      commitNow,
    );
    if (!replaced) throw new Error("challenge_refresh_conflict");
  }
  return {
    approved: true,
    railId: rail.id,
    requirementsHash: issued.requirementsHash!,
    ...(unsignedPaymentPayload ? { unsignedPaymentPayload } : {}),
  };
}

export async function verifyProtocolPayment(
  raw: unknown,
  dependencies: { facilitator?: FacilitatorClient } = {},
): Promise<VerifyResponse & { railId: RailId; challengeId: string }> {
  assertProtocolEnvelopeSize(raw);
  const input = ProtocolSettleRequestSchema.parse(raw);
  const requirements = input.paymentPayload.accepted;
  const rail = railForRequirements(requirements);
  if (rail.family === "gno") throw new Error("use_gno_v1_verification");
  const issued = await validateProtocolChallenge(
    input.challengeId,
    requirements,
  );
  if (
    issued.railId !== rail.id ||
    !issued.expectedPayer ||
    !issued.resourceInfo ||
    !input.paymentPayload.resource ||
    canonicalHash(issued.resourceInfo) !==
      canonicalHash(input.paymentPayload.resource)
  )
    throw new Error("challenge_mismatch");
  assertSignedPayloadBinding(rail, issued, input.paymentPayload);
  const result = await (dependencies.facilitator || facilitatorClient()).verify(
    input.paymentPayload,
    requirements,
  );
  if (
    result.payer &&
    !samePayer(rail.family, issued.expectedPayer, result.payer)
  )
    throw new Error("payer_mismatch");
  return { ...result, railId: rail.id, challengeId: input.challengeId };
}

function replayResponse(
  existing: PaymentRecord,
): SettleResponse & { replayed: true; pending?: boolean } {
  return {
    success: existing.status === "settled",
    transaction: existing.txHash || "",
    network: existing.network as Network,
    payer: existing.payer,
    amount: existing.amount,
    replayed: true,
    pending: existing.status === "settling" || existing.status === "broadcast",
    ...(existing.status !== "settled" &&
    existing.status !== "settling" &&
    existing.status !== "broadcast"
      ? { errorReason: existing.error || existing.status }
      : {}),
  };
}

export async function settleProtocolPayment(
  raw: unknown,
  dependencies: {
    facilitator?: FacilitatorClient;
    reconcile?: (
      payment: PaymentRecord,
      challenge: IssuedChallenge,
    ) => Promise<ReconciliationResult>;
  } = {},
): Promise<
  SettleResponse & { paymentId: string; replayed?: boolean; pending?: boolean }
> {
  assertProtocolEnvelopeSize(raw);
  const input = ProtocolSettleRequestSchema.parse(raw);
  const requirements = input.paymentPayload.accepted;
  const fingerprint = protocolFingerprint(
    input.challengeId,
    input.paymentId,
    input.paymentPayload,
  );
  const existing = await findPayment(input.paymentId);
  if (existing) {
    if (existing.fingerprint !== fingerprint)
      throw new Error("idempotency_conflict");
    if (existing.status === "broadcast" && existing.txHash && existing.nonce) {
      const challenge = await findChallenge(existing.nonce);
      if (challenge) {
        try {
          const reconciled = await (
            dependencies.reconcile || reconcileKnownProtocolPayment
          )(existing, challenge);
          if (reconciled.state === "settled") {
            const finalized = {
              ...existing,
              status: "settled" as const,
              error: null,
              blockHeight: reconciled.blockHeight,
              blockHash: reconciled.blockHash,
              confirmations: reconciled.confirmations,
              updatedAt: new Date().toISOString(),
            };
            await savePayment(finalized);
            const persisted = (await findPayment(input.paymentId)) || finalized;
            await appendAudit(
              existing.payer,
              "payment.reconciled",
              input.paymentId,
              { transaction: existing.txHash },
            ).catch(() => undefined);
            return {
              ...replayResponse(persisted),
              paymentId: input.paymentId,
            };
          }
          if (reconciled.state === "reverted") {
            const reverted = {
              ...existing,
              status: "reverted" as const,
              error: boundedSettlementError(reconciled.reason),
              updatedAt: new Date().toISOString(),
            };
            await savePayment(reverted);
            const persisted = (await findPayment(input.paymentId)) || reverted;
            return {
              ...replayResponse(persisted),
              paymentId: input.paymentId,
            };
          }
          if (reconciled.state === "mismatch") {
            const failed = {
              ...existing,
              status: "failed" as const,
              error: boundedSettlementError(reconciled.reason),
              updatedAt: new Date().toISOString(),
            };
            await savePayment(failed);
            const persisted = (await findPayment(input.paymentId)) || failed;
            return {
              ...replayResponse(persisted),
              paymentId: input.paymentId,
            };
          }
        } catch {
          // A reconciliation read must never trigger another settlement.
        }
      }
    }
    return { ...replayResponse(existing), paymentId: input.paymentId };
  }
  const rail = railForRequirements(requirements);
  if (rail.family === "gno") throw new Error("use_gno_v1_settlement");
  const issued = await validateProtocolChallenge(
    input.challengeId,
    requirements,
  );
  if (
    issued.railId !== rail.id ||
    !issued.expectedPayer ||
    !issued.resourceInfo ||
    !input.paymentPayload.resource ||
    canonicalHash(issued.resourceInfo) !==
      canonicalHash(input.paymentPayload.resource) ||
    issued.expectedPaymentId !== input.paymentId
  )
    throw new Error("challenge_mismatch");
  assertSignedPayloadBinding(rail, issued, input.paymentPayload);
  const client = dependencies.facilitator || facilitatorClient();
  const verification: VerifyResponse = await client.verify(
    input.paymentPayload,
    requirements,
  );
  if (!verification.isValid || !verification.payer)
    throw new Error(verification.invalidReason || "payment_invalid");
  if (!validWalletAddress(rail.family, verification.payer))
    throw new Error("invalid_verified_payer");
  if (!samePayer(rail.family, issued.expectedPayer, verification.payer))
    throw new Error("payer_mismatch");
  const record: PaymentRecord = {
    id: crypto.randomUUID(),
    paymentId: input.paymentId,
    fingerprint,
    nonce: input.challengeId,
    txHash: null,
    network: requirements.network,
    payer: verification.payer,
    payTo: requirements.payTo,
    asset: requirements.asset,
    amount: requirements.amount,
    status: "settling",
    error: null,
    resourceHash: issued.resourceHash,
    source: "facilitator",
    createdAt: new Date().toISOString(),
  };
  const claim = await claimSettlement(record);
  if (!claim.claimed && claim.existing) {
    return { ...replayResponse(claim.existing), paymentId: input.paymentId };
  }
  await appendAudit(
    verification.payer,
    "payment.settlement_claimed",
    input.paymentId,
    { railId: rail.id, network: rail.network, amount: requirements.amount },
  ).catch(() => undefined);
  try {
    const result = await client.settle(input.paymentPayload, requirements);
    const resultPayer = result.payer || verification.payer;
    const hasTransaction = Boolean(result.transaction);
    const transactionValid =
      hasTransaction && validTransactionId(rail.family, result.transaction);
    const responseMismatch =
      result.network !== requirements.network ||
      (result.amount !== undefined && result.amount !== requirements.amount) ||
      (hasTransaction && !transactionValid) ||
      (result.success && !transactionValid) ||
      !samePayer(rail.family, issued.expectedPayer, resultPayer);
    if (responseMismatch) {
      await savePayment({
        ...record,
        txHash: transactionValid ? result.transaction : null,
        status: "broadcast",
        error: "facilitator_response_mismatch",
        updatedAt: new Date().toISOString(),
      });
      await appendAudit(
        verification.payer,
        "payment.pending",
        input.paymentId,
        { railId: rail.id, reason: "facilitator_response_mismatch" },
      ).catch(() => undefined);
      return {
        success: false,
        transaction: transactionValid ? result.transaction : "",
        network: requirements.network,
        payer: verification.payer,
        amount: requirements.amount,
        paymentId: input.paymentId,
        pending: true,
        errorReason: "facilitator_response_mismatch",
      };
    }
    const settlementPending =
      !result.success &&
      (transactionValid || result.errorReason === "settlement_pending");
    const status = result.success
      ? "settled"
      : settlementPending
        ? "broadcast"
        : "failed";
    await savePayment({
      ...record,
      txHash: transactionValid ? result.transaction : null,
      payer: verification.payer,
      status,
      error: settlementPending
        ? "settlement_outcome_unknown"
        : boundedSettlementError(result.errorReason || result.errorMessage),
      confirmations: result.success ? 1 : 0,
      updatedAt: new Date().toISOString(),
    });
    await appendAudit(
      verification.payer,
      result.success
        ? "payment.settled"
        : settlementPending
          ? "payment.pending"
          : "payment.failed",
      input.paymentId,
      {
        railId: rail.id,
        transaction: result.transaction,
        reason: result.errorReason,
      },
    ).catch(() => undefined);
    return {
      ...result,
      paymentId: input.paymentId,
      ...(settlementPending ? { pending: true } : {}),
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "facilitator_error";
    const settleErrorTransaction =
      error instanceof SettleError &&
      validTransactionId(rail.family, error.transaction) &&
      error.network === requirements.network
        ? error.transaction
        : "";
    const deterministicRejection =
      error instanceof SettleError &&
      error.errorReason !== "settlement_pending" &&
      !error.transaction;
    const outcomeUnknown = !deterministicRejection;
    await savePayment({
      ...record,
      txHash: settleErrorTransaction || null,
      status: outcomeUnknown ? "broadcast" : "failed",
      error: outcomeUnknown
        ? "settlement_outcome_unknown"
        : boundedSettlementError(reason),
      updatedAt: new Date().toISOString(),
    });
    if (outcomeUnknown)
      return {
        success: false,
        transaction: settleErrorTransaction,
        network: requirements.network,
        payer: verification.payer,
        amount: requirements.amount,
        paymentId: input.paymentId,
        pending: true,
        errorReason: "settlement_outcome_unknown",
      };
    throw error;
  }
}
