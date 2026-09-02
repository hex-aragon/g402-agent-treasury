import {
  getSignatureFromTransaction,
  getTransactionDecoder,
} from "@solana/kit";
import { eip3009ABI } from "@x402/evm";
import { decodeFunctionData, keccak256, stringToHex } from "viem";
import { canonicalHash } from "../packages/x402-core/src/index.ts";
import type { IssuedChallenge, PaymentRecord } from "./store.ts";

export type ReconciliationResult =
  | {
      state: "settled";
      blockHeight: number;
      blockHash: string;
      confirmations: number;
    }
  | { state: "pending" }
  | { state: "reverted"; reason: string }
  | { state: "mismatch"; reason: string };

type JsonRpcResponse<T> = { result?: T; error?: { message?: string } };

function rpcUrl(network: string): string {
  const raw =
    network === "eip155:84532"
      ? process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org"
      : network === "eip155:1"
        ? process.env.ETHEREUM_MAINNET_RPC_URL
        : network === "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1"
          ? process.env.SOLANA_DEVNET_RPC_URL || "https://api.devnet.solana.com"
          : network === "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"
            ? process.env.SOLANA_MAINNET_RPC_URL
            : undefined;
  if (!raw) throw new Error("reconciliation_rpc_required");
  const parsed = new URL(raw);
  if (
    parsed.protocol !== "https:" ||
    parsed.username ||
    parsed.password ||
    parsed.hash
  )
    throw new Error("invalid_reconciliation_rpc_url");
  return parsed.toString();
}

async function rpc<T>(
  network: string,
  method: string,
  params: unknown[],
): Promise<T | null> {
  const timeout = Number(process.env.X402_RECONCILE_RPC_TIMEOUT_MS || 8_000);
  const timeoutMs =
    Number.isInteger(timeout) && timeout >= 1_000 && timeout <= 20_000
      ? timeout
      : 8_000;
  const response = await fetch(rpcUrl(network), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: crypto.randomUUID(),
      method,
      params,
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error("reconciliation_rpc_unavailable");
  const body = (await response.json()) as JsonRpcResponse<T>;
  if (body.error) throw new Error("reconciliation_rpc_error");
  return body.result ?? null;
}

function sameEvmAddress(left: string, right: string): boolean {
  return left.toLowerCase() === right.toLowerCase();
}

function topicAddress(value: string): string {
  return value.toLowerCase().replace(/^0x/, "").padStart(64, "0");
}

async function reconcileEvm(
  payment: PaymentRecord,
  challenge: IssuedChallenge,
): Promise<ReconciliationResult> {
  type Transaction = {
    hash?: string;
    to?: string;
    input?: `0x${string}`;
    blockNumber?: string | null;
    blockHash?: string | null;
  };
  type Receipt = {
    transactionHash?: string;
    blockNumber?: string;
    blockHash?: string;
    status?: string;
    logs?: Array<{ address?: string; topics?: string[]; data?: string }>;
  };
  type Block = { number?: string };
  const [chainId, transaction, receipt, finalized] = await Promise.all([
    rpc<string>(payment.network, "eth_chainId", []),
    rpc<Transaction>(payment.network, "eth_getTransactionByHash", [
      payment.txHash,
    ]),
    rpc<Receipt>(payment.network, "eth_getTransactionReceipt", [
      payment.txHash,
    ]),
    rpc<Block>(payment.network, "eth_getBlockByNumber", ["finalized", false]),
  ]);
  if (!transaction || !receipt || !finalized?.number)
    return { state: "pending" };
  const expectedChainId = BigInt(payment.network.split(":", 2)[1]);
  if (!chainId || BigInt(chainId) !== expectedChainId)
    throw new Error("reconciliation_chain_id_mismatch");
  if (
    !receipt.blockNumber ||
    !receipt.blockHash ||
    !transaction.blockNumber ||
    !transaction.blockHash
  )
    return { state: "pending" };
  if (
    !sameEvmAddress(receipt.transactionHash || "", payment.txHash || "") ||
    !sameEvmAddress(transaction.hash || "", payment.txHash || "") ||
    BigInt(transaction.blockNumber) !== BigInt(receipt.blockNumber) ||
    !sameEvmAddress(transaction.blockHash, receipt.blockHash)
  )
    return { state: "pending" };
  const receiptBlock = BigInt(receipt.blockNumber);
  const finalizedBlock = BigInt(finalized.number);
  if (receiptBlock > finalizedBlock) return { state: "pending" };
  if (!sameEvmAddress(transaction.to || "", payment.asset))
    return { state: "mismatch", reason: "transaction_target_mismatch" };
  if (!transaction.input)
    return { state: "mismatch", reason: "transaction_input_missing" };
  let decoded: ReturnType<typeof decodeFunctionData>;
  try {
    decoded = decodeFunctionData({ abi: eip3009ABI, data: transaction.input });
  } catch {
    return { state: "mismatch", reason: "authorization_decode_failed" };
  }
  const args = decoded.args as readonly unknown[];
  const expectedNonce = challenge.requirements?.extra?.authorizationNonce;
  const expectedValidBefore = challenge.requirements?.extra?.validBefore;
  if (
    decoded.functionName !== "transferWithAuthorization" ||
    !args ||
    !sameEvmAddress(String(args[0] || ""), payment.payer) ||
    !sameEvmAddress(String(args[1] || ""), payment.payTo) ||
    BigInt(String(args[2])) !== BigInt(payment.amount) ||
    BigInt(String(args[3])) !== 0n ||
    String(args[4]) !== String(expectedValidBefore) ||
    String(args[5]).toLowerCase() !== String(expectedNonce).toLowerCase()
  )
    return { state: "mismatch", reason: "authorization_terms_mismatch" };
  if (receipt.status === "0x0")
    return { state: "reverted", reason: "transaction_reverted" };
  if (receipt.status !== "0x1") return { state: "pending" };
  const transferTopic = keccak256(
    stringToHex("Transfer(address,address,uint256)"),
  );
  const transferFound = (receipt.logs || []).some((log) => {
    try {
      return (
        sameEvmAddress(log.address || "", payment.asset) &&
        log.topics?.[0]?.toLowerCase() === transferTopic.toLowerCase() &&
        log.topics?.[1]?.toLowerCase().replace(/^0x/, "") ===
          topicAddress(payment.payer) &&
        log.topics?.[2]?.toLowerCase().replace(/^0x/, "") ===
          topicAddress(payment.payTo) &&
        BigInt(log.data || "0x0") === BigInt(payment.amount)
      );
    } catch {
      return false;
    }
  });
  if (!transferFound)
    return { state: "mismatch", reason: "transfer_log_mismatch" };
  return {
    state: "settled",
    blockHeight: Number(receiptBlock),
    blockHash: receipt.blockHash,
    confirmations: Number(finalizedBlock - receiptBlock + 1n),
  };
}

async function reconcileSolana(
  payment: PaymentRecord,
  challenge: IssuedChallenge,
): Promise<ReconciliationResult> {
  type Status = {
    confirmationStatus?: string;
    err?: unknown;
    slot?: number;
  };
  type TransactionResult = {
    slot?: number;
    transaction?: [string, string];
    meta?: { err?: unknown } | null;
  };
  const [genesisHash, statuses, transaction] = await Promise.all([
    rpc<string>(payment.network, "getGenesisHash", []),
    rpc<{ value?: Array<Status | null> }>(
      payment.network,
      "getSignatureStatuses",
      [[payment.txHash], { searchTransactionHistory: true }],
    ),
    rpc<TransactionResult>(payment.network, "getTransaction", [
      payment.txHash,
      {
        commitment: "finalized",
        encoding: "base64",
        maxSupportedTransactionVersion: 0,
      },
    ]),
  ]);
  if (!genesisHash) return { state: "pending" };
  if (genesisHash !== payment.network.split(":", 2)[1])
    throw new Error("reconciliation_genesis_hash_mismatch");
  const status = statuses?.value?.[0];
  if (!status || status.confirmationStatus !== "finalized" || !transaction)
    return { state: "pending" };
  const statusSlot = status.slot;
  const transactionSlot = transaction.slot;
  if (
    typeof statusSlot !== "number" ||
    typeof transactionSlot !== "number" ||
    !Number.isSafeInteger(statusSlot) ||
    !Number.isSafeInteger(transactionSlot) ||
    statusSlot !== transactionSlot
  )
    return { state: "pending" };
  const encoded = transaction.transaction?.[0];
  if (!encoded || transaction.transaction?.[1] !== "base64")
    return { state: "pending" };
  let decoded;
  try {
    const bytes = Buffer.from(encoded, "base64");
    if (!bytes.length || bytes.toString("base64") !== encoded)
      return { state: "pending" };
    decoded = getTransactionDecoder().decode(bytes);
  } catch {
    return { state: "pending" };
  }
  if (
    getSignatureFromTransaction(decoded) !== payment.txHash ||
    canonicalHash(Array.from(decoded.messageBytes)) !==
      challenge.unsignedPayloadHash
  )
    return { state: "mismatch", reason: "transaction_terms_mismatch" };
  if (
    !Object.hasOwn(status, "err") ||
    !transaction.meta ||
    !Object.hasOwn(transaction.meta, "err")
  )
    return { state: "pending" };
  if (status.err !== null || transaction.meta.err !== null)
    return { state: "reverted", reason: "transaction_failed" };
  const block = await rpc<{ blockhash?: string }>(payment.network, "getBlock", [
    transactionSlot,
    {
      commitment: "finalized",
      transactionDetails: "none",
      rewards: false,
    },
  ]);
  if (!block?.blockhash) return { state: "pending" };
  return {
    state: "settled",
    blockHeight: transactionSlot,
    blockHash: block.blockhash,
    confirmations: 1,
  };
}

export async function reconcileKnownProtocolPayment(
  payment: PaymentRecord,
  challenge: IssuedChallenge,
): Promise<ReconciliationResult> {
  if (!payment.txHash) return { state: "pending" };
  const isEvm = payment.network.startsWith("eip155:");
  const sameAsset = isEvm
    ? sameEvmAddress(payment.asset, challenge.asset)
    : payment.asset === challenge.asset;
  const sameRecipient = isEvm
    ? sameEvmAddress(payment.payTo, challenge.payTo)
    : payment.payTo === challenge.payTo;
  const sameExpectedPayer =
    Boolean(challenge.expectedPayer) &&
    (isEvm
      ? sameEvmAddress(payment.payer, challenge.expectedPayer!)
      : payment.payer === challenge.expectedPayer);
  if (
    challenge.nonce !== payment.nonce ||
    challenge.expectedPaymentId !== payment.paymentId ||
    challenge.network !== payment.network ||
    challenge.amount !== payment.amount ||
    challenge.resourceHash !== payment.resourceHash ||
    !sameAsset ||
    !sameRecipient ||
    !sameExpectedPayer
  )
    return { state: "mismatch", reason: "challenge_payment_mismatch" };
  if (payment.network.startsWith("eip155:"))
    return reconcileEvm(payment, challenge);
  if (payment.network.startsWith("solana:"))
    return reconcileSolana(payment, challenge);
  return { state: "mismatch", reason: "unsupported_reconciliation_network" };
}
