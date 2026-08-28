import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export const NetworkId = z.string().regex(/^gno:[a-z0-9-]{2,40}$/);
export const Address = z.string().regex(/^g1[023456789acdefghjklmnpqrstuvwxyz]{38}$/);
export const IntegerAmount = z.string().regex(/^[1-9][0-9]*$/).max(40);

export const PaymentRequirementsSchema = z.object({
  scheme: z.literal("exact"), network: NetworkId, asset: z.string().min(3).max(200),
  amount: IntegerAmount, payTo: Address, maxTimeoutSeconds: z.number().int().min(5).max(3600),
  resource: z.string().url().max(2048), description: z.string().max(280).optional(),
  mimeType: z.string().max(100).optional(), extra: z.object({ chainId: z.string().min(1).max(80),
    denom: z.string().min(1).max(80), resourceHash: z.string().length(64), expiresAt: z.number().int().positive(),
    nonce: z.string().regex(/^[A-Za-z0-9_-]{16,128}$/), paymentMode:z.enum(["direct","realm"]).optional(),
    contractPath:z.string().regex(/^gno\.land\/r\/[a-z0-9_\/-]+\/g402pay$/).max(256).optional(), merchantId: z.string().uuid().optional(),
    agentId: z.string().uuid().optional(), policyId: z.string().uuid().optional(), quoteId:z.string().uuid().optional() }).strict()
}).strict();

export const PaymentPayloadSchema = z.object({
  x402Version: z.literal(2), scheme: z.literal("exact"), network: NetworkId,
  payload: z.object({ signedTx: z.string().min(32).max(500_000), payer: Address,
    paymentId: z.string().regex(/^[A-Za-z0-9_-]{16,128}$/), createdAt: z.number().int().positive() }).strict()
}).strict();

export type PaymentRequirements = z.infer<typeof PaymentRequirementsSchema>;
export type PaymentPayload = z.infer<typeof PaymentPayloadSchema>;
export type VerificationResult = { isValid: boolean; invalidReason?: string; payer?: string };
export type SettlementResult = { success: boolean; transaction?: string; network: string; errorReason?: string; pending?:boolean; blockHeight?:number };

export function paymentFingerprint(payload:PaymentPayload, requirements:PaymentRequirements):string {
  return createHash("sha256").update(JSON.stringify({
    paymentId:payload.payload.paymentId,network:payload.network,payer:payload.payload.payer,
    payTo:requirements.payTo,asset:requirements.asset,amount:requirements.amount,
    resourceHash:requirements.extra.resourceHash,nonce:requirements.extra.nonce,
    expiresAt:requirements.extra.expiresAt,quoteId:requirements.extra.quoteId,signedTxHash:createHash("sha256").update(payload.payload.signedTx).digest("hex")
  })).digest("hex");
}

export function resourceHash(method: string, url: string): string {
  return createHash("sha256").update(`${method.toUpperCase()}\n${url}`).digest("hex");
}
export function constantTimeApiKeyMatch(value: string, allowed: string[]): boolean {
  const hash = (x:string) => createHash("sha256").update(x).digest();
  return allowed.some(k => timingSafeEqual(hash(value), hash(k)));
}
export function assertSettlementAllowed(network: string,chainId?:string): void {
  if (process.env.G402_ENABLE_SETTLEMENT !== "true") throw new Error("settlement_disabled");
  const configuredNetwork=process.env.GNO_NETWORK_ID||"gno:pearl-1",configuredChain=process.env.GNO_CHAIN_ID||"pearl-1";
  if ((network === "gno:mainnet"||chainId==="mainnet"||configuredChain==="mainnet") && process.env.G402_ALLOW_MAINNET !== "true") throw new Error("mainnet_locked");
  if(network!==configuredNetwork||Boolean(chainId&&chainId!==configuredChain))throw new Error("network_not_configured");
}
