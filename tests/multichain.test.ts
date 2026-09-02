import test from "node:test";
import assert from "node:assert/strict";
import {
  authorizationTypes,
  eip3009ABI,
  PERMIT2_ADDRESS,
  permit2WitnessTypes,
} from "@x402/evm";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { ExactSvmScheme } from "@x402/svm/exact/client";
import type { FacilitatorClient } from "@x402/core/server";
import type {
  Network,
  PaymentPayload,
  PaymentRequirements,
  SettleResponse,
  SupportedResponse,
  VerifyResponse,
} from "@x402/core/types";
import { privateKeyToAccount } from "viem/accounts";
import {
  encodeFunctionData,
  keccak256,
  pad,
  stringToHex,
  toHex,
  verifyTypedData,
} from "viem";
import {
  createKeyPairSignerFromPrivateKeyBytes,
  getSignatureFromTransaction,
  getTransactionDecoder,
  getTransactionEncoder,
  partiallySignTransaction,
} from "@solana/kit";
import {
  BASE_SEPOLIA_NETWORK,
  BASE_SEPOLIA_USDC,
  createProtocolChallenge,
  ETHEREUM_MAINNET,
  ETHEREUM_USDC,
  mainnetReadiness,
  paymentRails,
  protocolFingerprint,
  railById,
  settleProtocolPayment,
  SOLANA_DEVNET_NETWORK,
  SOLANA_DEVNET_USDC,
  SOLANA_MAINNET,
  SOLANA_MAINNET_USDC,
  validateProtocolReview,
  verifyProtocolPayment,
} from "../lib/multichain.ts";
import {
  findAuthorizedSettledPayment,
  findPayment,
  savePayment,
} from "../lib/store.ts";
import { resourceHash } from "../lib/domain.ts";
import { G402SettlementAdapter } from "../packages/akash/src/settlement.ts";

const evmAccount = privateKeyToAccount(
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
);
const resource = "https://treasury.test/api/demo/multichain-paid-data";

async function withEnvironment<T>(
  values: Record<string, string>,
  action: () => Promise<T>,
): Promise<T> {
  const previous = new Map(
    Object.keys(values).map((key) => [key, process.env[key]]),
  );
  try {
    for (const [key, value] of Object.entries(values)) process.env[key] = value;
    return await action();
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

class MockFacilitator implements FacilitatorClient {
  verifyCalls = 0;
  settleCalls = 0;
  constructor(
    private readonly feePayer = "J2xccRtuG43drESLYznHhLhQkLTdfepcKYbiQ9BsJVaf",
  ) {}
  async getSupported(): Promise<SupportedResponse> {
    return {
      kinds: [
        { x402Version: 2, scheme: "exact", network: BASE_SEPOLIA_NETWORK },
        {
          x402Version: 2,
          scheme: "exact",
          network: SOLANA_DEVNET_NETWORK,
          extra: { feePayer: this.feePayer },
        },
      ],
      extensions: [],
      signers: {},
    };
  }
  async verify(
    payload: PaymentPayload,
    requirements: PaymentRequirements,
  ): Promise<VerifyResponse> {
    this.verifyCalls += 1;
    if (requirements.network.startsWith("eip155:")) {
      const raw = payload.payload as {
        authorization: {
          from: `0x${string}`;
          to: `0x${string}`;
          value: string;
          validAfter: string;
          validBefore: string;
          nonce: `0x${string}`;
        };
        signature: `0x${string}`;
      };
      const valid = await verifyTypedData({
        address: raw.authorization.from,
        domain: {
          name: String(requirements.extra.name),
          version: String(requirements.extra.version),
          chainId: Number(requirements.network.split(":", 2)[1]),
          verifyingContract: requirements.asset as `0x${string}`,
        },
        types: authorizationTypes,
        primaryType: "TransferWithAuthorization",
        message: {
          from: raw.authorization.from,
          to: raw.authorization.to,
          value: BigInt(raw.authorization.value),
          validAfter: BigInt(raw.authorization.validAfter),
          validBefore: BigInt(raw.authorization.validBefore),
          nonce: raw.authorization.nonce,
        },
        signature: raw.signature,
      });
      return {
        isValid: valid,
        payer: raw.authorization.from,
        invalidReason: valid ? undefined : "invalid_signature",
      };
    }
    return {
      isValid: true,
      payer: "GmaDrppBC7P5ARKV8g3djiwP89vz1jLK23V2GBjuAEGB",
    };
  }
  async settle(
    payload: PaymentPayload,
    requirements: PaymentRequirements,
  ): Promise<SettleResponse> {
    this.settleCalls += 1;
    const verified = await this.verify(payload, requirements);
    return {
      success: verified.isValid,
      transaction: requirements.network.startsWith("eip155:")
        ? `0x${"a".repeat(64)}`
        : "5".repeat(88),
      network: requirements.network,
      payer: verified.payer,
      amount: requirements.amount,
    };
  }
}

class EvmMainnetPendingFacilitator extends MockFacilitator {
  constructor(private readonly transactionId: `0x${string}`) {
    super();
  }

  override async getSupported(): Promise<SupportedResponse> {
    return {
      kinds: [{ x402Version: 2, scheme: "exact", network: ETHEREUM_MAINNET }],
      extensions: [],
      signers: {},
    };
  }

  override async settle(
    payload: PaymentPayload,
    requirements: PaymentRequirements,
  ): Promise<SettleResponse> {
    this.settleCalls += 1;
    const verified = await this.verify(payload, requirements);
    return {
      success: false,
      errorReason: "settlement_pending",
      transaction: this.transactionId,
      network: requirements.network,
      payer: verified.payer,
      amount: requirements.amount,
    };
  }
}

type SolanaKeyPairSigner = Awaited<
  ReturnType<typeof createKeyPairSignerFromPrivateKeyBytes>
>;

class SolanaMainnetPendingFacilitator extends MockFacilitator {
  settledTransaction = "";
  transactionId = "";

  constructor(
    private readonly feePayerSigner: SolanaKeyPairSigner,
    private readonly payer: string,
  ) {
    super(feePayerSigner.address);
  }

  override async getSupported(): Promise<SupportedResponse> {
    return {
      kinds: [
        {
          x402Version: 2,
          scheme: "exact",
          network: SOLANA_MAINNET,
          extra: { feePayer: this.feePayerSigner.address },
        },
      ],
      extensions: [],
      signers: {},
    };
  }

  override async verify(): Promise<VerifyResponse> {
    this.verifyCalls += 1;
    return { isValid: true, payer: this.payer };
  }

  override async settle(
    payload: PaymentPayload,
    requirements: PaymentRequirements,
  ): Promise<SettleResponse> {
    this.settleCalls += 1;
    const decoded = getTransactionDecoder().decode(
      Buffer.from(
        String((payload.payload as { transaction?: unknown }).transaction),
        "base64",
      ),
    );
    const signed = await partiallySignTransaction(
      [this.feePayerSigner.keyPair],
      decoded,
    );
    this.settledTransaction = Buffer.from(
      getTransactionEncoder().encode(signed),
    ).toString("base64");
    this.transactionId = getSignatureFromTransaction(signed);
    return {
      success: false,
      errorReason: "settlement_pending",
      transaction: this.transactionId,
      network: requirements.network,
      payer: this.payer,
      amount: requirements.amount,
    };
  }
}

class PostDispatchErrorFacilitator extends MockFacilitator {
  override async settle(
    _payload: PaymentPayload,
    _requirements: PaymentRequirements,
  ): Promise<SettleResponse> {
    this.settleCalls += 1;
    throw new Error("connection_closed_after_dispatch");
  }
}

class MalformedSuccessFacilitator extends MockFacilitator {
  override async settle(
    _payload: PaymentPayload,
    _requirements: PaymentRequirements,
  ): Promise<SettleResponse> {
    this.settleCalls += 1;
    return {
      success: true,
      transaction: "not-a-transaction",
      network: ETHEREUM_MAINNET,
      payer: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      amount: "1001",
    };
  }
}

class PayerSwapFacilitator extends MockFacilitator {
  override async verify(): Promise<VerifyResponse> {
    this.verifyCalls += 1;
    return {
      isValid: true,
      payer: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    };
  }
}

class PendingFacilitator extends MockFacilitator {
  override async settle(
    payload: PaymentPayload,
    requirements: PaymentRequirements,
  ): Promise<SettleResponse> {
    this.settleCalls += 1;
    const verified = await this.verify(payload, requirements);
    return {
      success: false,
      errorReason: "settlement_pending",
      transaction: `0x${"f".repeat(64)}`,
      network: requirements.network,
      payer: verified.payer,
      amount: requirements.amount,
    };
  }
}

class SvmFacilitator extends MockFacilitator {
  constructor(
    feePayer: string,
    private readonly payer: string,
  ) {
    super(feePayer);
  }

  override async verify(): Promise<VerifyResponse> {
    this.verifyCalls += 1;
    return { isValid: true, payer: this.payer };
  }
}

async function evmChallenge(
  facilitator = new MockFacilitator(),
  now = new Date(),
) {
  return createProtocolChallenge(
    { railId: "evm-base-sepolia", resource, walletAddress: evmAccount.address },
    { facilitator, now },
  );
}

async function evmPayload(
  challenge: Awaited<ReturnType<typeof evmChallenge>>,
  chainId = 84532,
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
      chainId,
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

test("registry exposes five rails and requires two independent gates per EVM/Solana mainnet", () => {
  const keys = [
    "X402_ALLOW_EVM_MAINNET",
    "X402_ENABLE_EVM_MAINNET_SETTLEMENT",
    "X402_ALLOW_SOLANA_MAINNET",
    "X402_ENABLE_SOLANA_MAINNET_SETTLEMENT",
  ] as const;
  const original = Object.fromEntries(
    keys.map((key) => [key, process.env[key]]),
  );
  try {
    for (const key of keys) delete process.env[key];
    assert.deepEqual(
      paymentRails().map((rail) => rail.id),
      [
        "gno-pearl",
        "evm-base-sepolia",
        "evm-ethereum-mainnet",
        "svm-solana-devnet",
        "svm-solana-mainnet",
      ],
    );
    assert.equal(railById("evm-base-sepolia").network, BASE_SEPOLIA_NETWORK);
    assert.equal(railById("svm-solana-devnet").asset, SOLANA_DEVNET_USDC);
    assert.throws(
      () => railById("evm-ethereum-mainnet"),
      /mainnet_rail_locked/,
    );
    assert.throws(() => railById("svm-solana-mainnet"), /mainnet_rail_locked/);
    assert.deepEqual(
      mainnetReadiness()
        .filter((item) => item.family !== "gno")
        .map(({ family, network, settlementEnabled }) => ({
          family,
          network,
          settlementEnabled,
        })),
      [
        { family: "evm", network: ETHEREUM_MAINNET, settlementEnabled: false },
        { family: "svm", network: SOLANA_MAINNET, settlementEnabled: false },
      ],
    );

    process.env.X402_ALLOW_EVM_MAINNET = "true";
    process.env.X402_ENABLE_EVM_MAINNET_SETTLEMENT = "false";
    process.env.X402_ALLOW_SOLANA_MAINNET = "true";
    process.env.X402_ENABLE_SOLANA_MAINNET_SETTLEMENT = "false";
    assert.equal(
      paymentRails().find((rail) => rail.id === "evm-ethereum-mainnet")?.status,
      "locked",
    );
    assert.equal(
      paymentRails().find((rail) => rail.id === "svm-solana-mainnet")?.status,
      "locked",
    );

    process.env.X402_ALLOW_EVM_MAINNET = "false";
    process.env.X402_ENABLE_EVM_MAINNET_SETTLEMENT = "true";
    process.env.X402_ALLOW_SOLANA_MAINNET = "false";
    process.env.X402_ENABLE_SOLANA_MAINNET_SETTLEMENT = "true";
    assert.equal(
      paymentRails().find((rail) => rail.id === "evm-ethereum-mainnet")?.status,
      "locked",
    );
    assert.equal(
      paymentRails().find((rail) => rail.id === "svm-solana-mainnet")?.status,
      "locked",
    );
  } finally {
    for (const key of keys) {
      const value = original[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test("Solana challenge treats a JSON-RPC error as unavailable infrastructure", async () => {
  const originalFetch = globalThis.fetch;
  const originalRecipient = process.env.X402_SOLANA_PAY_TO;
  const recipient = await createKeyPairSignerFromPrivateKeyBytes(
    new Uint8Array(32).fill(31),
  );
  process.env.X402_SOLANA_PAY_TO = recipient.address;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        error: { code: -32000, message: "provider rejected request" },
      }),
      { headers: { "content-type": "application/json" } },
    );
  try {
    await assert.rejects(
      () =>
        createProtocolChallenge(
          {
            railId: "svm-solana-devnet",
            resource,
            walletAddress: recipient.address,
          },
          { facilitator: new MockFacilitator() },
        ),
      /solana_rpc_unavailable/,
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalRecipient === undefined) delete process.env.X402_SOLANA_PAY_TO;
    else process.env.X402_SOLANA_PAY_TO = originalRecipient;
  }
});

test("Ethereum mainnet dual gates enable challenge, signature, settlement, and known-tx reconciliation", async () => {
  const recipient = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  const transaction = `0x${"6".repeat(64)}` as `0x${string}`;
  await withEnvironment(
    {
      X402_ALLOW_EVM_MAINNET: "true",
      X402_ENABLE_EVM_MAINNET_SETTLEMENT: "true",
      X402_FACILITATOR_URL: "https://facilitator.test",
      X402_ETHEREUM_PAY_TO: recipient,
      ETHEREUM_MAINNET_RPC_URL: "https://ethereum-mainnet-rpc.test",
    },
    async () => {
      const originalFetch = globalThis.fetch;
      const facilitator = new EvmMainnetPendingFacilitator(transaction);
      try {
        assert.equal(railById("evm-ethereum-mainnet").status, "sdk_ready");
        assert.equal(
          mainnetReadiness().find((item) => item.family === "evm")
            ?.settlementEnabled,
          true,
        );
        const challenge = await createProtocolChallenge(
          {
            railId: "evm-ethereum-mainnet",
            resource,
            walletAddress: evmAccount.address,
          },
          { facilitator },
        );
        assert.equal(
          challenge.paymentRequired.accepts[0].network,
          ETHEREUM_MAINNET,
        );
        assert.equal(challenge.paymentRequired.accepts[0].asset, ETHEREUM_USDC);
        assert.equal(challenge.paymentRequired.accepts[0].payTo, recipient);
        const paymentPayload = await evmPayload(challenge, 1);
        const request = {
          challengeId: challenge.challengeId,
          paymentId: challenge.paymentId,
          paymentPayload,
        };
        const verified = await verifyProtocolPayment(request, { facilitator });
        assert.equal(verified.isValid, true);
        assert.equal(verified.payer, evmAccount.address);

        const authorization = paymentPayload.payload.authorization as {
          from: `0x${string}`;
          to: `0x${string}`;
          value: string;
          validAfter: string;
          validBefore: string;
          nonce: `0x${string}`;
        };
        const input = encodeFunctionData({
          abi: eip3009ABI,
          functionName: "transferWithAuthorization",
          args: [
            authorization.from,
            authorization.to,
            BigInt(authorization.value),
            BigInt(authorization.validAfter),
            BigInt(authorization.validBefore),
            authorization.nonce,
            27,
            `0x${"2".repeat(64)}`,
            `0x${"3".repeat(64)}`,
          ],
        });
        const transferTopic = keccak256(
          stringToHex("Transfer(address,address,uint256)"),
        );
        globalThis.fetch = async (url, init) => {
          assert.equal(String(url), "https://ethereum-mainnet-rpc.test/");
          const rpc = JSON.parse(String(init?.body)) as { method: string };
          const result =
            rpc.method === "eth_chainId"
              ? "0x1"
              : rpc.method === "eth_getTransactionByHash"
                ? {
                    hash: transaction,
                    to: ETHEREUM_USDC,
                    input,
                    blockNumber: "0x63",
                    blockHash: `0x${"4".repeat(64)}`,
                  }
                : rpc.method === "eth_getTransactionReceipt"
                  ? {
                      transactionHash: transaction,
                      blockNumber: "0x63",
                      blockHash: `0x${"4".repeat(64)}`,
                      status: "0x1",
                      logs: [
                        {
                          address: ETHEREUM_USDC,
                          topics: [
                            transferTopic,
                            pad(authorization.from, { size: 32 }),
                            pad(authorization.to, { size: 32 }),
                          ],
                          data: toHex(BigInt(authorization.value), {
                            size: 32,
                          }),
                        },
                      ],
                    }
                  : { number: "0x64" };
          return new Response(
            JSON.stringify({ jsonrpc: "2.0", id: 1, result }),
          );
        };

        const pending = await settleProtocolPayment(request, { facilitator });
        assert.equal(pending.pending, true);
        assert.equal(pending.transaction, transaction);
        const reconciled = await settleProtocolPayment(request, {
          facilitator,
        });
        assert.equal(reconciled.success, true);
        assert.equal(reconciled.replayed, true);
        assert.equal(facilitator.settleCalls, 1);
        assert.ok(
          await findAuthorizedSettledPayment(
            challenge.paymentId,
            resourceHash("GET", resource),
          ),
        );
      } finally {
        globalThis.fetch = originalFetch;
      }
    },
  );
});

test("Solana mainnet dual gates enable challenge, signature, settlement, and known-tx reconciliation", async () => {
  const payer = await createKeyPairSignerFromPrivateKeyBytes(
    new Uint8Array(32).fill(27),
  );
  const recipient = await createKeyPairSignerFromPrivateKeyBytes(
    new Uint8Array(32).fill(28),
  );
  const feePayer = await createKeyPairSignerFromPrivateKeyBytes(
    new Uint8Array(32).fill(29),
  );
  await withEnvironment(
    {
      X402_ALLOW_SOLANA_MAINNET: "true",
      X402_ENABLE_SOLANA_MAINNET_SETTLEMENT: "true",
      X402_FACILITATOR_URL: "https://facilitator.test",
      X402_SOLANA_MAINNET_PAY_TO: recipient.address,
      SOLANA_MAINNET_RPC_URL: "https://solana-mainnet-rpc.test",
    },
    async () => {
      const originalFetch = globalThis.fetch;
      const facilitator = new SolanaMainnetPendingFacilitator(
        feePayer,
        payer.address,
      );
      const mint = new Uint8Array(82);
      mint[44] = 6;
      mint[45] = 1;
      let blockhashCall = 0;
      globalThis.fetch = async (url, init) => {
        assert.equal(String(url), "https://solana-mainnet-rpc.test/");
        const rpc = JSON.parse(String(init?.body)) as { method: string };
        const result =
          rpc.method === "getGenesisHash"
            ? SOLANA_MAINNET.split(":", 2)[1]
            : rpc.method === "getAccountInfo"
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
              : rpc.method === "getLatestBlockhash"
                ? {
                    context: { slot: 1 },
                    value: {
                      blockhash:
                        blockhashCall++ === 0
                          ? payer.address
                          : recipient.address,
                      lastValidBlockHeight: 1_000 + blockhashCall,
                    },
                  }
                : rpc.method === "getSignatureStatuses"
                  ? {
                      value: [
                        {
                          confirmationStatus: "finalized",
                          err: null,
                          slot: 77,
                        },
                      ],
                    }
                  : rpc.method === "getTransaction"
                    ? {
                        slot: 77,
                        transaction: [facilitator.settledTransaction, "base64"],
                        meta: { err: null },
                      }
                    : { blockhash: feePayer.address };
        return new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }));
      };
      try {
        assert.equal(railById("svm-solana-mainnet").status, "sdk_ready");
        assert.equal(
          mainnetReadiness().find((item) => item.family === "svm")
            ?.settlementEnabled,
          true,
        );
        const challenge = await createProtocolChallenge(
          {
            railId: "svm-solana-mainnet",
            resource,
            walletAddress: payer.address,
          },
          { facilitator },
        );
        assert.equal(
          challenge.paymentRequired.accepts[0].network,
          SOLANA_MAINNET,
        );
        assert.equal(
          challenge.paymentRequired.accepts[0].asset,
          SOLANA_MAINNET_USDC,
        );
        assert.equal(
          challenge.paymentRequired.accepts[0].payTo,
          recipient.address,
        );
        const reviewed = await validateProtocolReview({
          challengeId: challenge.challengeId,
          walletAddress: payer.address,
          paymentRequired: challenge.paymentRequired,
          unsignedPaymentPayload: challenge.unsignedPaymentPayload,
        });
        const decoded = getTransactionDecoder().decode(
          Buffer.from(
            String(reviewed.unsignedPaymentPayload?.payload.transaction),
            "base64",
          ),
        );
        const payerSigned = await partiallySignTransaction(
          [payer.keyPair],
          decoded,
        );
        const paymentPayload: PaymentPayload = {
          x402Version: 2,
          resource: challenge.paymentRequired.resource,
          accepted: challenge.paymentRequired.accepts[0],
          payload: {
            transaction: Buffer.from(
              getTransactionEncoder().encode(payerSigned),
            ).toString("base64"),
          },
        };
        const request = {
          challengeId: challenge.challengeId,
          paymentId: challenge.paymentId,
          paymentPayload,
        };
        const verified = await verifyProtocolPayment(request, { facilitator });
        assert.equal(verified.isValid, true);
        assert.equal(verified.payer, payer.address);
        const pending = await settleProtocolPayment(request, { facilitator });
        assert.equal(pending.pending, true);
        assert.equal(pending.transaction, facilitator.transactionId);
        const reconciled = await settleProtocolPayment(request, {
          facilitator,
        });
        assert.equal(reconciled.success, true);
        assert.equal(reconciled.replayed, true);
        assert.equal(facilitator.settleCalls, 1);
        assert.ok(
          await findAuthorizedSettledPayment(
            challenge.paymentId,
            resourceHash("GET", resource),
          ),
        );
      } finally {
        globalThis.fetch = originalFetch;
      }
    },
  );
});
test("gateway EVM client creates a valid EIP-3009 signature over exact server terms", async () => {
  const facilitator = new MockFacilitator(),
    challenge = await evmChallenge(facilitator),
    payload = await evmPayload(challenge);
  const result = await facilitator.verify(payload, payload.accepted);
  assert.equal(result.isValid, true);
  assert.equal(result.payer, evmAccount.address);
  assert.match(challenge.paymentId, /^pay_[a-f0-9]{32}$/);
  assert.notEqual(
    payload.accepted.payTo.toLowerCase(),
    evmAccount.address.toLowerCase(),
  );
  assert.equal(payload.accepted.asset, BASE_SEPOLIA_USDC);
  assert.equal(
    (payload.payload as { authorization: { value: string } }).authorization
      .value,
    "1000",
  );
  assert.equal(
    (payload.payload as { authorization: { nonce: string } }).authorization
      .nonce,
    payload.accepted.extra.authorizationNonce,
  );
});

test("EVM authorization binds the server nonce and rejects a substituted nonce before facilitator", async () => {
  const facilitator = new MockFacilitator();
  const first = await evmChallenge(facilitator);
  const second = await evmChallenge(facilitator);
  const payload = await evmPayload(first);
  assert.notEqual(first.paymentId, second.paymentId);
  assert.notEqual(
    first.paymentRequired.accepts[0].extra.authorizationNonce,
    second.paymentRequired.accepts[0].extra.authorizationNonce,
  );
  const raw = payload.payload as {
    authorization: Record<string, unknown>;
    signature: string;
  };
  const tampered: PaymentPayload = {
    ...payload,
    payload: {
      ...raw,
      authorization: {
        ...raw.authorization,
        nonce: `0x${"e".repeat(64)}`,
      },
    },
  };
  await assert.rejects(
    () =>
      settleProtocolPayment(
        {
          challengeId: first.challengeId,
          paymentId: first.paymentId,
          paymentPayload: tampered,
        },
        { facilitator },
      ),
    /signed_payload_binding_mismatch/,
  );
  assert.equal(facilitator.verifyCalls, 0);
  assert.equal(facilitator.settleCalls, 0);
});

test("official EVM client creates a cryptographically valid Permit2 payload", async () => {
  const requirements: PaymentRequirements = {
    scheme: "exact",
    network: BASE_SEPOLIA_NETWORK,
    asset: BASE_SEPOLIA_USDC,
    amount: "1000",
    payTo: evmAccount.address,
    maxTimeoutSeconds: 300,
    extra: { assetTransferMethod: "permit2" },
  };
  const created = await new ExactEvmScheme(evmAccount).createPaymentPayload(
    2,
    requirements,
  );
  const raw = created.payload as {
    permit2Authorization: {
      from: `0x${string}`;
      permitted: { token: `0x${string}`; amount: string };
      spender: `0x${string}`;
      nonce: string;
      deadline: string;
      witness: { to: `0x${string}`; validAfter: string };
    };
    signature: `0x${string}`;
  };
  const valid = await verifyTypedData({
    address: raw.permit2Authorization.from,
    domain: {
      name: "Permit2",
      chainId: 84532,
      verifyingContract: PERMIT2_ADDRESS,
    },
    types: permit2WitnessTypes,
    primaryType: "PermitWitnessTransferFrom",
    message: {
      permitted: {
        token: raw.permit2Authorization.permitted.token,
        amount: BigInt(raw.permit2Authorization.permitted.amount),
      },
      spender: raw.permit2Authorization.spender,
      nonce: BigInt(raw.permit2Authorization.nonce),
      deadline: BigInt(raw.permit2Authorization.deadline),
      witness: {
        to: raw.permit2Authorization.witness.to,
        validAfter: BigInt(raw.permit2Authorization.witness.validAfter),
      },
    },
    signature: raw.signature,
  });
  assert.equal(valid, true);
});

test("official SVM client signs a sponsored v0 classic SPL transaction with mocked RPC", async () => {
  const originalFetch = globalThis.fetch;
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
  const mintBase64 = Buffer.from(mint).toString("base64");
  globalThis.fetch = async (_input, init) => {
    const request = JSON.parse(String(init?.body)) as {
      id: string;
      method: string;
    };
    const result =
      request.method === "getAccountInfo"
        ? {
            context: { slot: 1 },
            value: {
              data: [mintBase64, "base64"],
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
    return new Response(
      JSON.stringify({ jsonrpc: "2.0", id: request.id, result }),
      { headers: { "content-type": "application/json" } },
    );
  };
  try {
    const requirements: PaymentRequirements = {
      scheme: "exact",
      network: SOLANA_DEVNET_NETWORK,
      asset: SOLANA_DEVNET_USDC,
      amount: "1000",
      payTo: recipient.address,
      maxTimeoutSeconds: 60,
      extra: {
        feePayer: feePayer.address,
        memo: `g402:test:${"a".repeat(64)}`,
      },
    };
    const created = await new ExactSvmScheme(payer, {
      rpcUrl: "https://rpc.test",
    }).createPaymentPayload(2, requirements);
    const transaction = getTransactionDecoder().decode(
      Buffer.from(
        String((created.payload as { transaction: string }).transaction),
        "base64",
      ),
    );
    assert.equal(
      Object.values(transaction.signatures).filter(Boolean).length,
      1,
    );
    assert.ok(transaction.signatures[payer.address]);
    assert.equal(transaction.signatures[feePayer.address], null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Solana review refreshes the blockhash and only the refreshed signed message settles", async () => {
  const originalFetch = globalThis.fetch;
  const originalRecipient = process.env.X402_SOLANA_PAY_TO;
  const payer = await createKeyPairSignerFromPrivateKeyBytes(
    new Uint8Array(32).fill(17),
  );
  const recipient = await createKeyPairSignerFromPrivateKeyBytes(
    new Uint8Array(32).fill(18),
  );
  const feePayer = await createKeyPairSignerFromPrivateKeyBytes(
    new Uint8Array(32).fill(19),
  );
  const mint = new Uint8Array(82);
  mint[44] = 6;
  mint[45] = 1;
  let blockhashCall = 0;
  process.env.X402_SOLANA_PAY_TO = recipient.address;
  globalThis.fetch = async (_input, init) => {
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
              blockhash:
                blockhashCall++ === 0 ? payer.address : recipient.address,
              lastValidBlockHeight: 1000 + blockhashCall,
            },
          };
    return new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }));
  };
  try {
    const facilitator = new SvmFacilitator(feePayer.address, payer.address);
    const challenge = await createProtocolChallenge(
      {
        railId: "svm-solana-devnet",
        resource,
        walletAddress: payer.address,
      },
      { facilitator },
    );
    const initialUnsigned = challenge.unsignedPaymentPayload!;
    const reviewed = await validateProtocolReview({
      challengeId: challenge.challengeId,
      walletAddress: payer.address,
      paymentRequired: challenge.paymentRequired,
      unsignedPaymentPayload: initialUnsigned,
    });
    assert.ok(reviewed.unsignedPaymentPayload?.payload.transaction);
    assert.notEqual(
      initialUnsigned.payload.transaction,
      reviewed.unsignedPaymentPayload.payload.transaction,
    );
    const sign = async (encoded: unknown): Promise<PaymentPayload> => {
      const decoded = getTransactionDecoder().decode(
        Buffer.from(String(encoded), "base64"),
      );
      const signed = await partiallySignTransaction([payer.keyPair], decoded);
      return {
        x402Version: 2,
        resource: challenge.paymentRequired.resource,
        accepted: challenge.paymentRequired.accepts[0],
        payload: {
          transaction: Buffer.from(
            getTransactionEncoder().encode(signed),
          ).toString("base64"),
        },
      };
    };
    const stale = await sign(initialUnsigned.payload.transaction);
    await assert.rejects(
      () =>
        settleProtocolPayment(
          {
            challengeId: challenge.challengeId,
            paymentId: challenge.paymentId,
            paymentPayload: stale,
          },
          { facilitator },
        ),
      /signed_payload_binding_mismatch/,
    );
    assert.equal(facilitator.verifyCalls, 0);
    const fresh = await sign(
      reviewed.unsignedPaymentPayload.payload.transaction,
    );
    const settled = await settleProtocolPayment(
      {
        challengeId: challenge.challengeId,
        paymentId: challenge.paymentId,
        paymentPayload: fresh,
      },
      { facilitator },
    );
    assert.equal(settled.success, true);
    assert.equal(facilitator.settleCalls, 1);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalRecipient === undefined) delete process.env.X402_SOLANA_PAY_TO;
    else process.env.X402_SOLANA_PAY_TO = originalRecipient;
  }
});

test("settled replay returns before facilitator verification and challenge expiry checks", async () => {
  const realDateNow = Date.now;
  let clock = realDateNow();
  const facilitator = new MockFacilitator();
  const challenge = await evmChallenge(facilitator, new Date(clock));
  const paymentPayload = await evmPayload(challenge);
  const request = {
    challengeId: challenge.challengeId,
    paymentId: challenge.paymentId,
    paymentPayload,
  };
  try {
    Date.now = () => clock;
    const first = await settleProtocolPayment(request, { facilitator });
    assert.equal(first.success, true);
    assert.equal(facilitator.settleCalls, 1);

    clock += 301_000;
    const replayFacilitator = new MockFacilitator();
    const replay = await settleProtocolPayment(request, {
      facilitator: replayFacilitator,
    });
    assert.equal(replay.success, true);
    assert.equal(replay.replayed, true);
    assert.equal(replayFacilitator.verifyCalls, 0);
    assert.equal(replayFacilitator.settleCalls, 0);
  } finally {
    Date.now = realDateNow;
  }
  const stored = await findPayment(challenge.paymentId);
  assert.equal(stored?.network, BASE_SEPOLIA_NETWORK);
  assert.equal(stored?.asset, BASE_SEPOLIA_USDC);
  assert.equal(stored?.amount, "1000");
  assert.ok(
    await findAuthorizedSettledPayment(
      challenge.paymentId,
      resourceHash("GET", resource),
    ),
  );
  assert.equal(
    await findAuthorizedSettledPayment(challenge.paymentId, "f".repeat(64)),
    null,
  );
});

test("twenty concurrent retries trigger exactly one facilitator settlement", async () => {
  const facilitator = new MockFacilitator(),
    challenge = await evmChallenge(facilitator),
    paymentPayload = await evmPayload(challenge);
  const results = await Promise.all(
    Array.from({ length: 20 }, () =>
      settleProtocolPayment(
        {
          challengeId: challenge.challengeId,
          paymentId: challenge.paymentId,
          paymentPayload,
        },
        { facilitator },
      ),
    ),
  );
  assert.equal(results.filter((result) => result.success).length >= 1, true);
  assert.equal(facilitator.settleCalls, 1);
});

test("challenge rejects network, asset, amount, recipient and resource tampering before facilitator", async () => {
  const changes: Array<(payload: PaymentPayload) => PaymentPayload> = [
    (payload) => ({
      ...payload,
      accepted: { ...payload.accepted, network: "eip155:1" as Network },
    }),
    (payload) => ({
      ...payload,
      accepted: { ...payload.accepted, asset: `0x${"1".repeat(40)}` },
    }),
    (payload) => ({
      ...payload,
      accepted: { ...payload.accepted, amount: "1001" },
    }),
    (payload) => ({
      ...payload,
      accepted: { ...payload.accepted, payTo: `0x${"2".repeat(40)}` },
    }),
    (payload) => ({
      ...payload,
      resource: { ...payload.resource!, url: "https://attacker.test/data" },
    }),
  ];
  for (const change of changes) {
    const facilitator = new MockFacilitator(),
      challenge = await evmChallenge(facilitator),
      original = await evmPayload(challenge),
      paymentPayload = change(structuredClone(original));
    await assert.rejects(
      () =>
        settleProtocolPayment(
          {
            challengeId: challenge.challengeId,
            paymentId: challenge.paymentId,
            paymentPayload,
          },
          { facilitator },
        ),
      /challenge_mismatch|unsupported_payment|mainnet_rail_locked/,
    );
    assert.equal(facilitator.verifyCalls, 0);
    assert.equal(facilitator.settleCalls, 0);
  }
});

test("review rejects payer, recipient, and resource substitutions before wallet signing", async () => {
  const facilitator = new MockFacilitator();
  const challenge = await evmChallenge(facilitator);
  const base = {
    challengeId: challenge.challengeId,
    walletAddress: challenge.expectedPayer,
    paymentRequired: challenge.paymentRequired,
  };
  assert.equal((await validateProtocolReview(base)).approved, true);
  const substitutions = [
    {
      ...base,
      walletAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    },
    {
      ...base,
      paymentRequired: {
        ...challenge.paymentRequired,
        accepts: [
          {
            ...challenge.paymentRequired.accepts[0],
            payTo: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
          },
        ],
      },
    },
    {
      ...base,
      paymentRequired: {
        ...challenge.paymentRequired,
        resource: {
          ...challenge.paymentRequired.resource,
          url: "https://attacker.test/data",
        },
      },
    },
  ];
  for (const substituted of substitutions)
    await assert.rejects(
      () => validateProtocolReview(substituted),
      /challenge_mismatch|review_terms_mismatch/,
    );
  assert.equal(facilitator.verifyCalls, 0);
  assert.equal(facilitator.settleCalls, 0);
});

test("payload from challenge A cannot be settled with challenge B", async () => {
  const facilitator = new MockFacilitator();
  const challengeA = await evmChallenge(facilitator);
  const challengeB = await evmChallenge(facilitator);
  const paymentPayloadA = await evmPayload(challengeA);
  await assert.rejects(
    () =>
      settleProtocolPayment(
        {
          challengeId: challengeB.challengeId,
          paymentId: challengeB.paymentId,
          paymentPayload: paymentPayloadA,
        },
        { facilitator },
      ),
    /challenge_mismatch/,
  );
  assert.equal(facilitator.verifyCalls, 0);
  assert.equal(facilitator.settleCalls, 0);
});

test("verified payer substitution is rejected before settlement", async () => {
  const facilitator = new PayerSwapFacilitator();
  const challenge = await evmChallenge(facilitator);
  const paymentPayload = await evmPayload(challenge);
  await assert.rejects(
    () =>
      settleProtocolPayment(
        {
          challengeId: challenge.challengeId,
          paymentId: challenge.paymentId,
          paymentPayload,
        },
        { facilitator },
      ),
    /payer_mismatch/,
  );
  assert.equal(facilitator.verifyCalls, 1);
  assert.equal(facilitator.settleCalls, 0);
});

test("the server-issued payment ID is mandatory before facilitator verification", async () => {
  const facilitator = new MockFacilitator(),
    challenge = await evmChallenge(facilitator),
    paymentPayload = await evmPayload(challenge);
  await assert.rejects(
    () =>
      settleProtocolPayment(
        {
          challengeId: challenge.challengeId,
          paymentId: `pay_${crypto.randomUUID().replaceAll("-", "")}`,
          paymentPayload,
        },
        { facilitator },
      ),
    /challenge_mismatch/,
  );
  assert.equal(facilitator.verifyCalls, 0);
  assert.equal(facilitator.settleCalls, 0);
  const settled = await settleProtocolPayment(
    {
      challengeId: challenge.challengeId,
      paymentId: challenge.paymentId,
      paymentPayload,
    },
    { facilitator },
  );
  assert.equal(settled.success, true);
  assert.equal(facilitator.settleCalls, 1);
});

test("a generic error after settlement dispatch stays pending and is never re-settled", async () => {
  const facilitator = new PostDispatchErrorFacilitator();
  const challenge = await evmChallenge(facilitator);
  const paymentPayload = await evmPayload(challenge);
  const request = {
    challengeId: challenge.challengeId,
    paymentId: challenge.paymentId,
    paymentPayload,
  };
  const first = await settleProtocolPayment(request, { facilitator });
  assert.equal(first.success, false);
  assert.equal(first.pending, true);
  assert.equal(facilitator.settleCalls, 1);
  assert.equal((await findPayment(challenge.paymentId))?.status, "broadcast");

  const replayFacilitator = new MockFacilitator();
  const replay = await settleProtocolPayment(request, {
    facilitator: replayFacilitator,
  });
  assert.equal(replay.replayed, true);
  assert.equal(replay.pending, true);
  assert.equal(replayFacilitator.verifyCalls, 0);
  assert.equal(replayFacilitator.settleCalls, 0);
  assert.equal(
    await findAuthorizedSettledPayment(
      challenge.paymentId,
      resourceHash("GET", resource),
    ),
    null,
  );
});

test("a known pending transaction is reconciled without another facilitator settlement", async () => {
  const facilitator = new PendingFacilitator();
  const challenge = await evmChallenge(facilitator);
  const paymentPayload = await evmPayload(challenge);
  const request = {
    challengeId: challenge.challengeId,
    paymentId: challenge.paymentId,
    paymentPayload,
  };
  const pending = await settleProtocolPayment(request, { facilitator });
  assert.equal(pending.pending, true);
  assert.equal(facilitator.settleCalls, 1);
  const reconciled = await settleProtocolPayment(request, {
    facilitator,
    reconcile: async () => ({
      state: "settled",
      blockHeight: 123,
      blockHash: `0x${"1".repeat(64)}`,
      confirmations: 1,
    }),
  });
  assert.equal(reconciled.success, true);
  assert.equal(reconciled.replayed, true);
  assert.equal(facilitator.settleCalls, 1);
  assert.ok(
    await findAuthorizedSettledPayment(
      challenge.paymentId,
      resourceHash("GET", resource),
    ),
  );
});

test("a malformed facilitator success tuple stays pending and cannot unlock the resource", async () => {
  const facilitator = new MalformedSuccessFacilitator();
  const challenge = await evmChallenge(facilitator);
  const paymentPayload = await evmPayload(challenge);
  const result = await settleProtocolPayment(
    {
      challengeId: challenge.challengeId,
      paymentId: challenge.paymentId,
      paymentPayload,
    },
    { facilitator },
  );
  assert.equal(result.success, false);
  assert.equal(result.pending, true);
  const stored = await findPayment(challenge.paymentId);
  assert.equal(stored?.status, "broadcast");
  assert.equal(stored?.error, "facilitator_response_mismatch");
  assert.equal(
    await findAuthorizedSettledPayment(
      challenge.paymentId,
      resourceHash("GET", resource),
    ),
    null,
  );
});

test("payment envelopes over 500KB fail before facilitator verification", async () => {
  const facilitator = new MockFacilitator();
  const challenge = await evmChallenge(facilitator);
  const paymentPayload = await evmPayload(challenge);
  await assert.rejects(
    () =>
      settleProtocolPayment(
        {
          challengeId: challenge.challengeId,
          paymentId: challenge.paymentId,
          paymentPayload: {
            ...paymentPayload,
            payload: {
              ...paymentPayload.payload,
              padding: "x".repeat(500_001),
            },
          },
        },
        { facilitator },
      ),
    /payment_envelope_too_large/,
  );
  assert.equal(facilitator.verifyCalls, 0);
  assert.equal(facilitator.settleCalls, 0);
});

test("expired server challenge and unknown top-level fields fail closed", async () => {
  const facilitator = new MockFacilitator(),
    challenge = await evmChallenge(facilitator, new Date(Date.now() - 301_000)),
    paymentPayload = await evmPayload(challenge);
  await assert.rejects(
    () =>
      settleProtocolPayment(
        {
          challengeId: challenge.challengeId,
          paymentId: `pay_${crypto.randomUUID().replaceAll("-", "")}`,
          paymentPayload,
        },
        { facilitator },
      ),
    /challenge_expired/,
  );
  await assert.rejects(() =>
    settleProtocolPayment(
      {
        challengeId: challenge.challengeId,
        paymentId: `pay_${crypto.randomUUID().replaceAll("-", "")}`,
        paymentPayload,
        facilitatorUrl: "https://attacker.test",
      },
      { facilitator },
    ),
  );
});

test("fingerprint binds challenge, payment ID, accepted terms and signed payload", async () => {
  const challenge = await evmChallenge(),
    payload = await evmPayload(challenge);
  const a = protocolFingerprint(
    challenge.challengeId,
    "pay_1234567890abcdef",
    payload,
  );
  const b = protocolFingerprint(
    challenge.challengeId,
    "pay_1234567890abcdeg",
    payload,
  );
  const c = protocolFingerprint(challenge.challengeId, "pay_1234567890abcdef", {
    ...payload,
    payload: { ...payload.payload, signature: `0x${"0".repeat(130)}` },
  });
  assert.notEqual(a, b);
  assert.notEqual(a, c);
  assert.match(a, /^[a-f0-9]{64}$/);
});

test("service settlement adapter binds quote, network, asset, amount, recipient and confirmations", async () => {
  const paymentId = `pay_${crypto.randomUUID().replaceAll("-", "")}`;
  const expected = {
    quoteId: crypto.randomUUID(),
    network: BASE_SEPOLIA_NETWORK,
    asset: BASE_SEPOLIA_USDC,
    amount: "1000",
    payTo: evmAccount.address,
    agentId: crypto.randomUUID(),
    minConfirmations: 2,
  };
  await savePayment({
    id: crypto.randomUUID(),
    paymentId,
    fingerprint: crypto.randomUUID().replaceAll("-", "").padEnd(64, "a"),
    nonce: `nonce_${crypto.randomUUID().replaceAll("-", "")}`,
    txHash: `0x${"b".repeat(64)}`,
    network: expected.network,
    payer: evmAccount.address,
    payTo: expected.payTo,
    asset: expected.asset,
    amount: expected.amount,
    status: "settled",
    error: null,
    source: "facilitator",
    confirmations: 2,
    serviceQuoteId: expected.quoteId,
    agentId: expected.agentId,
    createdAt: new Date().toISOString(),
  });
  const adapter = new G402SettlementAdapter();
  assert.equal((await adapter.verify(paymentId, expected)).valid, true);
  const mutations = [
    { ...expected, quoteId: crypto.randomUUID() },
    { ...expected, network: "eip155:1" },
    { ...expected, asset: `0x${"1".repeat(40)}` },
    { ...expected, amount: "1001" },
    { ...expected, payTo: `0x${"2".repeat(40)}` },
    { ...expected, agentId: crypto.randomUUID() },
    { ...expected, minConfirmations: 3 },
  ];
  for (const changed of mutations)
    assert.equal((await adapter.verify(paymentId, changed)).valid, false);
});

test("chain-observed rows can never unlock a paid resource", async () => {
  const paymentId = `pay_${crypto.randomUUID().replaceAll("-", "")}`,
    expectedHash = "c".repeat(64);
  await savePayment({
    id: crypto.randomUUID(),
    paymentId,
    fingerprint: "d".repeat(64),
    nonce: `nonce_${crypto.randomUUID().replaceAll("-", "")}`,
    txHash: "CHAIN_ONLY",
    network: "gno:pearl-1",
    payer: `g1${"q".repeat(38)}`,
    payTo: `g1${"p".repeat(38)}`,
    asset: "gno.land/r/gnoland/wugnot",
    amount: "1000",
    status: "settled",
    error: null,
    source: "chain",
    resourceHash: expectedHash,
    createdAt: new Date().toISOString(),
  });
  assert.equal(
    await findAuthorizedSettledPayment(paymentId, expectedHash),
    null,
  );
});
