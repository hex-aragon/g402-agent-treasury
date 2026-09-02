import test from "node:test";
import assert from "node:assert/strict";
import {
  createKeyPairSignerFromPrivateKeyBytes,
  getSignatureFromTransaction,
  getTransactionDecoder,
  getTransactionEncoder,
  partiallySignTransaction,
} from "@solana/kit";
import { ExactSvmScheme } from "@x402/svm/exact/client";
import { eip3009ABI } from "@x402/evm";
import { encodeFunctionData, keccak256, pad, stringToHex, toHex } from "viem";
import type { PaymentPayload } from "@x402/core/types";
import { canonicalHash } from "../packages/x402-core/src/index.ts";
import { reconcileKnownProtocolPayment } from "../lib/reconciliation.ts";
import {
  findPayment,
  saveChallenge,
  savePayment,
  type IssuedChallenge,
  type PaymentRecord,
} from "../lib/store.ts";
import {
  BASE_SEPOLIA_NETWORK,
  BASE_SEPOLIA_USDC,
  SOLANA_DEVNET_NETWORK,
  SOLANA_DEVNET_USDC,
  protocolFingerprint,
  settleProtocolPayment,
} from "../lib/multichain.ts";

const evmPayer = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const evmRecipient = "0x7e758891b2965eb82e4a121f66d5f6f3d6a2dec6";
const evmTx = `0x${"a".repeat(64)}` as `0x${string}`;
const evmNonce = `0x${"b".repeat(64)}` as `0x${string}`;

function payment(overrides: Partial<PaymentRecord> = {}): PaymentRecord {
  return {
    id: crypto.randomUUID(),
    paymentId: `pay_${"c".repeat(32)}`,
    fingerprint: "d".repeat(64),
    nonce: "e".repeat(32),
    txHash: evmTx,
    network: BASE_SEPOLIA_NETWORK,
    payer: evmPayer,
    payTo: evmRecipient,
    asset: BASE_SEPOLIA_USDC,
    amount: "1000",
    status: "broadcast",
    error: "settlement_outcome_unknown",
    resourceHash: "f".repeat(64),
    source: "facilitator",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function challenge(overrides: Partial<IssuedChallenge> = {}): IssuedChallenge {
  return {
    nonce: "e".repeat(32),
    resource: "https://resource.test/data",
    resourceHash: "f".repeat(64),
    method: "GET",
    network: BASE_SEPOLIA_NETWORK,
    chainId: "84532",
    asset: BASE_SEPOLIA_USDC,
    denom: "usdc",
    amount: "1000",
    payTo: evmRecipient,
    paymentMode: "direct",
    expectedPayer: evmPayer,
    expectedPaymentId: `pay_${"c".repeat(32)}`,
    railId: "evm-base-sepolia",
    requirementsHash: "1".repeat(64),
    requirements: {
      scheme: "exact",
      network: BASE_SEPOLIA_NETWORK,
      asset: BASE_SEPOLIA_USDC,
      amount: "1000",
      payTo: evmRecipient,
      maxTimeoutSeconds: 300,
      extra: {
        authorizationNonce: evmNonce,
        validBefore: "2000000000",
      },
    },
    expiresAt: 2_000_000_000,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

test("EVM reconciliation requires finalized exact calldata and Transfer evidence", async () => {
  const originalFetch = globalThis.fetch;
  const originalRpc = process.env.BASE_SEPOLIA_RPC_URL;
  process.env.BASE_SEPOLIA_RPC_URL = "https://rpc.test";
  const input = encodeFunctionData({
    abi: eip3009ABI,
    functionName: "transferWithAuthorization",
    args: [
      evmPayer,
      evmRecipient,
      1000n,
      0n,
      2_000_000_000n,
      evmNonce,
      27,
      `0x${"2".repeat(64)}`,
      `0x${"3".repeat(64)}`,
    ],
  });
  const transferTopic = keccak256(
    stringToHex("Transfer(address,address,uint256)"),
  );
  let transferAmount = 1000n;
  let transactionTo: string = BASE_SEPOLIA_USDC;
  let receiptStatus = "0x1";
  let receiptBlock = "0x63";
  let finalizedBlock = "0x64";
  globalThis.fetch = async (_url, init) => {
    const request = JSON.parse(String(init?.body)) as { method: string };
    const result =
      request.method === "eth_chainId"
        ? "0x14a34"
        : request.method === "eth_getTransactionByHash"
          ? {
              hash: evmTx,
              to: transactionTo,
              input,
              blockNumber: receiptBlock,
              blockHash: `0x${"4".repeat(64)}`,
            }
          : request.method === "eth_getTransactionReceipt"
            ? {
                transactionHash: evmTx,
                blockNumber: receiptBlock,
                blockHash: `0x${"4".repeat(64)}`,
                status: receiptStatus,
                logs: [
                  {
                    address: BASE_SEPOLIA_USDC,
                    topics: [
                      transferTopic,
                      pad(evmPayer, { size: 32 }),
                      pad(evmRecipient, { size: 32 }),
                    ],
                    data: toHex(transferAmount, { size: 32 }),
                  },
                ],
              }
            : { number: finalizedBlock };
    return new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }));
  };
  try {
    const exact = await reconcileKnownProtocolPayment(payment(), challenge());
    assert.deepEqual(exact, {
      state: "settled",
      blockHeight: 99,
      blockHash: `0x${"4".repeat(64)}`,
      confirmations: 2,
    });
    transferAmount = 1001n;
    const mismatch = await reconcileKnownProtocolPayment(
      payment(),
      challenge(),
    );
    assert.deepEqual(mismatch, {
      state: "mismatch",
      reason: "transfer_log_mismatch",
    });
    transferAmount = 1000n;
    transactionTo = `0x${"1".repeat(40)}`;
    assert.deepEqual(
      await reconcileKnownProtocolPayment(payment(), challenge()),
      { state: "mismatch", reason: "transaction_target_mismatch" },
    );
    transactionTo = BASE_SEPOLIA_USDC;
    receiptStatus = "0x0";
    assert.deepEqual(
      await reconcileKnownProtocolPayment(payment(), challenge()),
      { state: "reverted", reason: "transaction_reverted" },
    );
    finalizedBlock = "0x62";
    assert.deepEqual(
      await reconcileKnownProtocolPayment(payment(), challenge()),
      { state: "pending" },
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalRpc === undefined) delete process.env.BASE_SEPOLIA_RPC_URL;
    else process.env.BASE_SEPOLIA_RPC_URL = originalRpc;
  }
});

test("Solana reconciliation requires finalized status and the exact signed message", async () => {
  const originalFetch = globalThis.fetch;
  const originalRpc = process.env.SOLANA_DEVNET_RPC_URL;
  process.env.SOLANA_DEVNET_RPC_URL = "https://rpc.test";
  const payer = await createKeyPairSignerFromPrivateKeyBytes(
    new Uint8Array(32).fill(7),
  );
  const recipient = await createKeyPairSignerFromPrivateKeyBytes(
    new Uint8Array(32).fill(8),
  );
  const feePayer = await createKeyPairSignerFromPrivateKeyBytes(
    new Uint8Array(32).fill(9),
  );
  const mint = new Uint8Array(82);
  mint[44] = 6;
  mint[45] = 1;
  globalThis.fetch = async (_url, init) => {
    const request = JSON.parse(String(init?.body)) as { method: string };
    const result =
      request.method === "getAccountInfo"
        ? {
            context: { slot: 1 },
            value: {
              data: [Buffer.from(mint).toString("base64"), "base64"],
              executable: false,
              lamports: 1,
              owner: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
              rentEpoch: 0,
              space: 82,
            },
          }
        : {
            context: { slot: 1 },
            value: {
              blockhash: "11111111111111111111111111111111",
              lastValidBlockHeight: 1000,
            },
          };
    return new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }));
  };
  const requirements = {
    scheme: "exact" as const,
    network: SOLANA_DEVNET_NETWORK,
    asset: SOLANA_DEVNET_USDC,
    amount: "1000",
    payTo: recipient.address,
    maxTimeoutSeconds: 60,
    extra: {
      feePayer: feePayer.address,
      memo: `g402:${"a".repeat(32)}:${"b".repeat(64)}`,
    },
  };
  try {
    const created = await new ExactSvmScheme(payer, {
      rpcUrl: "https://rpc.test",
    }).createPaymentPayload(2, requirements);
    const partial = getTransactionDecoder().decode(
      Buffer.from(String(created.payload.transaction), "base64"),
    );
    const signed = await partiallySignTransaction([feePayer.keyPair], partial);
    const encoded = Buffer.from(
      getTransactionEncoder().encode(signed),
    ).toString("base64");
    const signature = getSignatureFromTransaction(signed);
    const expectedHash = canonicalHash(Array.from(signed.messageBytes));
    let statusSlot = 42;
    let omitMeta = false;
    let statusError: unknown = null;
    globalThis.fetch = async (_url, init) => {
      const request = JSON.parse(String(init?.body)) as { method: string };
      const result =
        request.method === "getGenesisHash"
          ? SOLANA_DEVNET_NETWORK.split(":", 2)[1]
          : request.method === "getSignatureStatuses"
            ? {
                value: [
                  {
                    confirmationStatus: "finalized",
                    err: statusError,
                    slot: statusSlot,
                  },
                ],
              }
            : request.method === "getTransaction"
              ? {
                  slot: 42,
                  transaction: [encoded, "base64"],
                  ...(omitMeta ? {} : { meta: { err: null } }),
                }
              : { blockhash: "11111111111111111111111111111111" };
      return new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }));
    };
    const record = payment({
      network: SOLANA_DEVNET_NETWORK,
      payer: payer.address,
      payTo: recipient.address,
      asset: SOLANA_DEVNET_USDC,
      txHash: signature,
    });
    const issued = challenge({
      network: SOLANA_DEVNET_NETWORK,
      chainId: SOLANA_DEVNET_NETWORK.split(":", 2)[1],
      payTo: recipient.address,
      asset: SOLANA_DEVNET_USDC,
      expectedPayer: payer.address,
      unsignedPayloadHash: expectedHash,
      requirements,
      railId: "svm-solana-devnet",
    } as Partial<IssuedChallenge>);
    const exact = await reconcileKnownProtocolPayment(record, issued);
    assert.deepEqual(exact, {
      state: "settled",
      blockHeight: 42,
      blockHash: "11111111111111111111111111111111",
      confirmations: 1,
    });
    const mismatch = await reconcileKnownProtocolPayment(record, {
      ...issued,
      unsignedPayloadHash: "0".repeat(64),
    });
    assert.deepEqual(mismatch, {
      state: "mismatch",
      reason: "transaction_terms_mismatch",
    });
    omitMeta = true;
    assert.deepEqual(await reconcileKnownProtocolPayment(record, issued), {
      state: "pending",
    });
    omitMeta = false;
    statusSlot = 41;
    assert.deepEqual(await reconcileKnownProtocolPayment(record, issued), {
      state: "pending",
    });
    statusSlot = 42;
    statusError = { InstructionError: [2, "Custom"] };
    assert.deepEqual(await reconcileKnownProtocolPayment(record, issued), {
      state: "reverted",
      reason: "transaction_failed",
    });
  } finally {
    globalThis.fetch = originalFetch;
    if (originalRpc === undefined) delete process.env.SOLANA_DEVNET_RPC_URL;
    else process.env.SOLANA_DEVNET_RPC_URL = originalRpc;
  }
});

test("a finalized mismatch is persisted and returned instead of replaying stale pending state", async () => {
  const challengeId = crypto.randomUUID().replaceAll("-", "");
  const paymentId = `pay_${crypto.randomUUID().replaceAll("-", "")}`;
  const issued = challenge({
    nonce: challengeId,
    expectedPaymentId: paymentId,
  });
  const paymentPayload: PaymentPayload = {
    x402Version: 2,
    resource: {
      url: issued.resource,
      mimeType: "application/json",
    },
    accepted: issued.requirements!,
    payload: { opaque: "already-verified" },
  };
  const request = { challengeId, paymentId, paymentPayload };
  const fingerprint = protocolFingerprint(
    challengeId,
    paymentId,
    paymentPayload,
  );
  await saveChallenge({
    ...issued,
    requirementsHash: canonicalHash(issued.requirements),
    resourceInfo: paymentPayload.resource,
  });
  await savePayment(
    payment({
      paymentId,
      fingerprint,
      nonce: challengeId,
    }),
  );
  const result = await settleProtocolPayment(request, {
    reconcile: async () => ({
      state: "mismatch",
      reason: "transaction_terms_mismatch",
    }),
  });
  assert.equal(result.success, false);
  assert.equal(result.pending, false);
  assert.equal(result.errorReason, "transaction_terms_mismatch");
  const stored = await findPayment(paymentId);
  assert.equal(stored?.status, "failed");
  assert.equal(stored?.error, "transaction_terms_mismatch");
});
