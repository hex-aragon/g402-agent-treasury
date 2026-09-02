import type {
  ExpectedSettlement,
  SettlementAdapter,
} from "../../x402-core/src/index.ts";
import { findPayment } from "../../../lib/store.ts";
export class G402SettlementAdapter implements SettlementAdapter {
  async verify(paymentId: string, expected: ExpectedSettlement) {
    const payment = await findPayment(paymentId);
    if (!payment) return { valid: false, reason: "payment_not_found" };
    if (payment.status !== "settled")
      return { valid: false, reason: "payment_not_finalized" };
    if (
      (payment.network === "gno:mainnet" &&
        process.env.G402_ALLOW_MAINNET !== "true") ||
      (payment.network === "eip155:1" &&
        process.env.X402_ALLOW_EVM_MAINNET !== "true") ||
      (payment.network === "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp" &&
        process.env.X402_ALLOW_SOLANA_MAINNET !== "true")
    )
      return { valid: false, reason: "mainnet_locked" };
    if (payment.serviceQuoteId !== expected.quoteId)
      return { valid: false, reason: "quote_payment_mismatch" };
    if (payment.network !== expected.network)
      return { valid: false, reason: "network_payment_mismatch" };
    const caseInsensitive = payment.network.startsWith("eip155:");
    const sameAsset = caseInsensitive
      ? payment.asset.toLowerCase() === expected.asset.toLowerCase()
      : payment.asset === expected.asset;
    if (!sameAsset)
      return { valid: false, reason: "asset_payment_mismatch" };
    const sameRecipient = caseInsensitive
      ? payment.payTo.toLowerCase() === expected.payTo.toLowerCase()
      : payment.payTo === expected.payTo;
    if (!sameRecipient)
      return { valid: false, reason: "recipient_payment_mismatch" };
    if (BigInt(payment.amount) !== BigInt(expected.amount))
      return { valid: false, reason: "amount_payment_mismatch" };
    if (expected.agentId && payment.agentId !== expected.agentId)
      return { valid: false, reason: "agent_payment_mismatch" };
    if ((payment.confirmations || 0) < (expected.minConfirmations || 0))
      return { valid: false, reason: "payment_confirmations_pending" };
    return { valid: true, transaction: payment.txHash || undefined };
  }
}
