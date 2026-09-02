"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getWallets } from "@wallet-standard/app";
import type {
  Wallet,
  WalletAccount,
  WalletWithFeatures,
} from "@wallet-standard/base";
import {
  StandardConnect,
  type StandardConnectFeature,
} from "@wallet-standard/features";
import {
  SolanaSignTransaction,
  type SolanaSignTransactionFeature,
} from "@solana/wallet-standard-features";
import {
  getAddress,
  getTypesForEIP712Domain,
  stringify,
  type TypedDataDomain,
} from "viem";
import { authorizationTypes } from "@x402/evm";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import type {
  PaymentPayload,
  PaymentRequired,
  PaymentRequirements,
} from "@x402/core/types";

const CHALLENGE_STORAGE_KEY = "x402.multichain.prepared";
const SIGNED_ATTEMPT_STORAGE_KEY = "x402.multichain.signedAttempt";

type RailId =
  | "evm-base-sepolia"
  | "evm-ethereum-mainnet"
  | "svm-solana-devnet"
  | "svm-solana-mainnet";
type Rail = {
  id: RailId | "gno-pearl";
  family: "evm" | "svm" | "gno";
  label: string;
  network: string;
  chain: string;
  asset: string;
  symbol: string;
  decimals: number;
  maxTimeoutSeconds: number;
  priceAtomic: string;
  recipient?: string;
  recipientMode: string;
  wallet: string;
  capabilities: string[];
  status: string;
  mainnet: boolean;
};
type Challenge = {
  challengeId: string;
  paymentId: string;
  rail: Rail;
  paymentRequired: PaymentRequired;
  unsignedPaymentPayload?: {
    x402Version: number;
    payload: { transaction?: string };
    extensions?: Record<string, unknown>;
  };
  expectedPayer: string;
};
type SignedAttempt = {
  challengeId: string;
  paymentId: string;
  paymentPayload: PaymentPayload;
};
type SolanaSigningWallet = WalletWithFeatures<
  StandardConnectFeature & SolanaSignTransactionFeature
>;
type Eip1193Provider = {
  request(args: {
    method: string;
    params?: readonly unknown[] | object;
  }): Promise<unknown>;
};
type Eip6963ProviderInfo = {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
};
type Eip6963ProviderDetail = {
  info: Eip6963ProviderInfo;
  provider: Eip1193Provider;
};
type EvmWalletOption = {
  id: string;
  label: string;
  provider: Eip1193Provider;
};

function isStoredChallenge(value: unknown): value is Challenge {
  const candidate = value as Partial<Challenge> | null;
  return Boolean(
    candidate &&
    typeof candidate.challengeId === "string" &&
    typeof candidate.paymentId === "string" &&
    typeof candidate.expectedPayer === "string" &&
    candidate.rail &&
    candidate.rail.id !== "gno-pearl" &&
    candidate.paymentRequired?.x402Version === 2 &&
    candidate.paymentRequired.accepts?.length === 1,
  );
}

function isStoredSignedAttempt(
  value: unknown,
  challenge: Challenge,
): value is SignedAttempt {
  const candidate = value as Partial<SignedAttempt> | null;
  return Boolean(
    candidate &&
    candidate.challengeId === challenge.challengeId &&
    candidate.paymentId === challenge.paymentId &&
    candidate.paymentPayload?.x402Version === 2 &&
    candidate.paymentPayload.accepted &&
    candidate.paymentPayload.payload,
  );
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

function isEip6963ProviderDetail(
  value: unknown,
): value is Eip6963ProviderDetail {
  const candidate = value as Partial<Eip6963ProviderDetail> | null;
  const info = candidate?.info as Partial<Eip6963ProviderInfo> | undefined;
  return Boolean(
    candidate &&
    info &&
    typeof info.uuid === "string" &&
    typeof info.name === "string" &&
    typeof info.icon === "string" &&
    typeof info.rdns === "string" &&
    typeof candidate.provider?.request === "function",
  );
}

function isSolanaSigningWallet(wallet: Wallet): wallet is SolanaSigningWallet {
  const connect = wallet.features[StandardConnect] as
    StandardConnectFeature[typeof StandardConnect] | undefined;
  const sign = wallet.features[SolanaSignTransaction] as
    SolanaSignTransactionFeature[typeof SolanaSignTransaction] | undefined;
  return (
    typeof connect?.connect === "function" &&
    typeof sign?.signTransaction === "function" &&
    sign.supportedTransactionVersions.includes(0)
  );
}

function bytesFromBase64(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function base64FromBytes(value: Uint8Array): string {
  let binary = "";
  for (const byte of value) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function formatAtomicAmount(value: string, decimals: number): string {
  if (!/^[0-9]+$/.test(value) || decimals < 0) return value;
  const padded = value.padStart(decimals + 1, "0");
  const whole = padded.slice(0, -decimals) || "0";
  if (decimals === 0) return whole;
  const fraction = padded.slice(-decimals).replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole;
}

async function jsonPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const value = (await response.json()) as T & {
    error?: string;
    errorReason?: string;
    errorMessage?: string;
  };
  if (!response.ok && response.status !== 202)
    throw new Error(
      value.error ||
        value.errorReason ||
        value.errorMessage ||
        `request_${response.status}`,
    );
  return value;
}

async function createInjectedEvmSigner(
  provider: Eip1193Provider,
  chain: {
    id: number;
    name: string;
    rpcUrl: string;
    explorerUrl: string;
  },
) {
  const expectedChainId = chain.id;
  let chainId = await provider.request({ method: "eth_chainId" });
  if (typeof chainId !== "string") throw new Error("wallet_chain_unavailable");
  if (BigInt(chainId) !== BigInt(expectedChainId)) {
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${expectedChainId.toString(16)}` }],
      });
    } catch (cause) {
      const code =
        typeof cause === "object" && cause && "code" in cause
          ? Number((cause as { code?: unknown }).code)
          : undefined;
      if (code !== 4902) throw cause;
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${expectedChainId.toString(16)}`,
            chainName: chain.name,
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: [chain.rpcUrl],
            blockExplorerUrls: [chain.explorerUrl],
          },
        ],
      });
    }
    chainId = await provider.request({ method: "eth_chainId" });
  }
  if (
    typeof chainId !== "string" ||
    BigInt(chainId) !== BigInt(expectedChainId)
  )
    throw new Error("wrong_wallet_network");
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  if (!Array.isArray(accounts) || typeof accounts[0] !== "string")
    throw new Error("wallet_account_unavailable");
  const signerAddress = getAddress(accounts[0]);
  return {
    address: signerAddress,
    async signTypedData({
      domain,
      types,
      primaryType,
      message,
    }: Parameters<
      ConstructorParameters<typeof ExactEvmScheme>[0]["signTypedData"]
    >[0]) {
      const rpcTypes = {
        ...types,
        EIP712Domain: getTypesForEIP712Domain({
          domain: domain as TypedDataDomain,
        }),
      };
      const signature = await provider.request({
        method: "eth_signTypedData_v4",
        params: [
          signerAddress,
          stringify({ domain, types: rpcTypes, primaryType, message }),
        ],
      });
      if (
        typeof signature !== "string" ||
        !/^0x(?:[0-9a-fA-F]{2})+$/.test(signature)
      )
        throw new Error("invalid_wallet_signature");
      const [afterChain, afterAccounts] = await Promise.all([
        provider.request({ method: "eth_chainId" }),
        provider.request({ method: "eth_accounts" }),
      ]);
      if (
        typeof afterChain !== "string" ||
        BigInt(afterChain) !== BigInt(expectedChainId) ||
        !Array.isArray(afterAccounts) ||
        typeof afterAccounts[0] !== "string" ||
        getAddress(afterAccounts[0]) !== signerAddress
      )
        throw new Error("wallet_changed_during_approval");
      return signature as `0x${string}`;
    },
  };
}

export default function MultichainPayClient() {
  const [rails, setRails] = useState<Rail[]>([]);
  const [selected, setSelected] = useState<RailId>("evm-base-sepolia");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [evmProvider, setEvmProvider] = useState<Eip1193Provider | null>(null);
  const [evmAddress, setEvmAddress] = useState("");
  const [eip6963Providers, setEip6963Providers] = useState<
    Eip6963ProviderDetail[]
  >([]);
  const [fallbackEvmProvider, setFallbackEvmProvider] =
    useState<Eip1193Provider | null>(null);
  const [evmProviderChoiceId, setEvmProviderChoiceId] = useState("");
  const [solanaWallet, setSolanaWallet] = useState<SolanaSigningWallet | null>(
    null,
  );
  const [solanaAccount, setSolanaAccount] = useState<WalletAccount | null>(
    null,
  );
  const [solanaWallets, setSolanaWallets] = useState<SolanaSigningWallet[]>([]);
  const [solanaWalletChoice, setSolanaWalletChoice] =
    useState<SolanaSigningWallet | null>(null);
  const [phase, setPhase] = useState("idle");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<Record<string, unknown> | null>(null);
  const [signedAttempt, setSignedAttempt] = useState<SignedAttempt | null>(
    null,
  );
  const selectedRail = useMemo(
    () => rails.find((rail) => rail.id === selected),
    [rails, selected],
  );
  const evmWalletOptions = useMemo<EvmWalletOption[]>(() => {
    if (eip6963Providers.length > 0) {
      return eip6963Providers.map(({ info, provider }) => ({
        id: info.uuid,
        label: `${info.name} · ${info.rdns}`,
        provider,
      }));
    }
    return fallbackEvmProvider
      ? [
          {
            id: "window.ethereum",
            label: "Browser injected wallet",
            provider: fallbackEvmProvider,
          },
        ]
      : [];
  }, [eip6963Providers, fallbackEvmProvider]);
  const selectedEvmChain = useMemo(
    () =>
      selectedRail?.id === "evm-ethereum-mainnet"
        ? {
            id: 1,
            name: "Ethereum Mainnet",
            rpcUrl: "https://ethereum-rpc.publicnode.com",
            explorerUrl: "https://etherscan.io",
          }
        : {
            id: 84532,
            name: "Base Sepolia",
            rpcUrl: "https://sepolia.base.org",
            explorerUrl: "https://sepolia.basescan.org",
          },
    [selectedRail],
  );
  const selectedSolanaChain =
    selectedRail?.id === "svm-solana-mainnet"
      ? "solana:mainnet"
      : "solana:devnet";

  function rememberChallenge(value: Challenge) {
    setChallenge(value);
    sessionStorage.setItem(CHALLENGE_STORAGE_KEY, JSON.stringify(value));
  }

  function forgetSignedAttempt() {
    setSignedAttempt(null);
    sessionStorage.removeItem(SIGNED_ATTEMPT_STORAGE_KEY);
  }

  function rememberSignedAttempt(value: SignedAttempt) {
    setSignedAttempt(value);
    sessionStorage.setItem(SIGNED_ATTEMPT_STORAGE_KEY, JSON.stringify(value));
  }

  function clearCompletedSession() {
    setSignedAttempt(null);
    sessionStorage.removeItem(CHALLENGE_STORAGE_KEY);
    sessionStorage.removeItem(SIGNED_ATTEMPT_STORAGE_KEY);
  }

  useEffect(() => {
    fetch("/api/v2/rails", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`rails_${response.status}`);
        return (await response.json()) as { rails?: Rail[] };
      })
      .then((body) => {
        if (!Array.isArray(body.rails) || body.rails.length === 0)
          throw new Error("rails_empty");
        setRails(body.rails);
      })
      .catch(() => setError("rails_unavailable"));
    try {
      const raw = sessionStorage.getItem(CHALLENGE_STORAGE_KEY);
      if (raw) {
        const prepared = JSON.parse(raw) as unknown;
        if (isStoredChallenge(prepared)) {
          const signedRaw = sessionStorage.getItem(SIGNED_ATTEMPT_STORAGE_KEY);
          const restoredAttempt = signedRaw
            ? (JSON.parse(signedRaw) as unknown)
            : null;
          setChallenge(prepared);
          setSelected(prepared.rail.id as RailId);
          if (isStoredSignedAttempt(restoredAttempt, prepared)) {
            setSignedAttempt(restoredAttempt);
            setPhase("signed payment ready to retry");
          } else {
            sessionStorage.removeItem(SIGNED_ATTEMPT_STORAGE_KEY);
            setPhase("restored challenge");
          }
        } else {
          sessionStorage.removeItem(CHALLENGE_STORAGE_KEY);
          sessionStorage.removeItem(SIGNED_ATTEMPT_STORAGE_KEY);
        }
      }
    } catch {
      sessionStorage.removeItem(CHALLENGE_STORAGE_KEY);
      sessionStorage.removeItem(SIGNED_ATTEMPT_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const announceProvider = (event: Event) => {
      const detail = (event as CustomEvent<unknown>).detail;
      if (!isEip6963ProviderDetail(detail)) return;
      setEip6963Providers((current) => {
        if (
          current.some((candidate) => candidate.info.uuid === detail.info.uuid)
        )
          return current;
        return [...current, detail];
      });
    };
    window.addEventListener("eip6963:announceProvider", announceProvider);
    setFallbackEvmProvider(window.ethereum || null);
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    return () =>
      window.removeEventListener("eip6963:announceProvider", announceProvider);
  }, []);

  useEffect(() => {
    const registry = getWallets();
    const refresh = () => {
      const compatible = registry.get().filter(isSolanaSigningWallet);
      setSolanaWallets(compatible);
      setSolanaWalletChoice((current) =>
        current && compatible.includes(current)
          ? current
          : compatible.length === 1
            ? compatible[0]
            : null,
      );
    };
    refresh();
    const offRegister = registry.on("register", refresh);
    const offUnregister = registry.on("unregister", refresh);
    return () => {
      offRegister();
      offUnregister();
    };
  }, []);

  async function prepareEvm() {
    setError("");
    setReceipt(null);
    setPhase("connecting EVM wallet");
    try {
      if (!selectedRail || selectedRail.family !== "evm")
        throw new Error("evm_rail_unavailable");
      const wallet =
        evmWalletOptions.length === 1
          ? evmWalletOptions[0]
          : evmWalletOptions.find(
              (candidate) => candidate.id === evmProviderChoiceId,
            ) || null;
      if (!wallet)
        throw new Error(
          evmWalletOptions.length > 1
            ? "select_evm_wallet"
            : "eip1193_wallet_not_found",
        );
      const signer = await createInjectedEvmSigner(
        wallet.provider,
        selectedEvmChain,
      );
      setEvmProvider(wallet.provider);
      setEvmAddress(signer.address);
      if (
        challenge?.rail.id === selected &&
        [
          "prepared by agent",
          "restored challenge",
          "signed payment ready to retry",
        ].includes(phase)
      ) {
        if (
          !challenge.expectedPayer ||
          challenge.expectedPayer.toLowerCase() !== signer.address.toLowerCase()
        )
          throw new Error("prepared_challenge_wallet_mismatch");
        setPhase("awaiting human approval");
        return;
      }
      setPhase("creating bound challenge");
      const created = await jsonPost<Challenge>("/api/v2/challenges", {
        railId: selected,
        walletAddress: signer.address,
        resourceId: "weather",
      });
      rememberChallenge(created);
      forgetSignedAttempt();
      setPhase("awaiting human approval");
    } catch (cause) {
      setPhase("failed");
      setError(cause instanceof Error ? cause.message : "evm_prepare_failed");
    }
  }

  async function prepareSolana() {
    setError("");
    setReceipt(null);
    setPhase("connecting Solana wallet");
    try {
      if (!selectedRail || selectedRail.family !== "svm")
        throw new Error("solana_rail_unavailable");
      const wallets = getWallets().get().filter(isSolanaSigningWallet);
      setSolanaWallets(wallets);
      const wallet =
        wallets.length === 1
          ? wallets[0]
          : solanaWalletChoice && wallets.includes(solanaWalletChoice)
            ? solanaWalletChoice
            : null;
      if (!wallet)
        throw new Error(
          wallets.length > 1
            ? "select_solana_wallet"
            : "wallet_standard_wallet_not_found",
        );
      const { accounts } = await wallet.features[StandardConnect].connect();
      const account = accounts.find(
        (candidate) =>
          candidate.chains.includes(selectedSolanaChain) &&
          candidate.features.includes(SolanaSignTransaction),
      );
      if (!account) throw new Error("solana_account_unavailable");
      setSolanaWallet(wallet);
      setSolanaAccount(account);
      if (
        challenge?.rail.id === selected &&
        [
          "prepared by agent",
          "restored challenge",
          "signed payment ready to retry",
        ].includes(phase)
      ) {
        if (
          !challenge.expectedPayer ||
          challenge.expectedPayer !== account.address
        )
          throw new Error("prepared_challenge_wallet_mismatch");
        setPhase("awaiting human approval");
        return;
      }
      setPhase("building official x402 transaction");
      const created = await jsonPost<Challenge>("/api/v2/challenges", {
        railId: selected,
        walletAddress: account.address,
        resourceId: "weather",
      });
      if (!created.unsignedPaymentPayload?.payload.transaction)
        throw new Error("unsigned_solana_transaction_missing");
      rememberChallenge(created);
      forgetSignedAttempt();
      setPhase("awaiting human approval");
    } catch (cause) {
      setPhase("failed");
      setError(
        cause instanceof Error ? cause.message : "solana_prepare_failed",
      );
    }
  }

  function assertTerms(
    accepted: PaymentRequirements,
    rail: Rail,
    payer: string,
    prepared: Challenge,
  ) {
    const sameAsset =
      rail.family === "evm"
        ? accepted.asset.toLowerCase() === rail.asset.toLowerCase()
        : accepted.asset === rail.asset;
    const sameRecipient =
      rail.family === "evm"
        ? accepted.payTo.toLowerCase() === rail.recipient?.toLowerCase()
        : accepted.payTo === rail.recipient;
    const expectedResource = `${window.location.origin}/api/demo/multichain-paid-data`;
    const extra = accepted.extra as Record<string, unknown>;
    const memo = String(extra.memo || "");
    const resourceHash = String(
      extra.resourceHash || memo.split(":", 3)[2] || "",
    );
    if (
      prepared.rail.id !== rail.id ||
      accepted.scheme !== "exact" ||
      accepted.network !== rail.network ||
      !sameAsset ||
      accepted.amount !== rail.priceAtomic ||
      !sameRecipient ||
      accepted.maxTimeoutSeconds !== rail.maxTimeoutSeconds ||
      prepared.paymentRequired.resource?.url !== expectedResource ||
      !/^pay_[a-f0-9]{32}$/.test(prepared.paymentId) ||
      !/^[a-f0-9]{64}$/.test(resourceHash) ||
      !prepared.expectedPayer
    )
      throw new Error("prepared_terms_tampered");
    if (
      rail.family === "evm"
        ? payer.toLowerCase() !== prepared.expectedPayer.toLowerCase()
        : payer !== prepared.expectedPayer
    )
      throw new Error("wallet_changed_during_approval");
    if (
      rail.family === "evm" &&
      (extra.assetTransferMethod !== "eip3009" ||
        extra.name !==
          (rail.id === "evm-ethereum-mainnet" ? "USD Coin" : "USDC") ||
        extra.version !== "2" ||
        extra.g402ChallengeId !== prepared.challengeId ||
        !/^0x[0-9a-fA-F]{64}$/.test(String(extra.authorizationNonce || "")) ||
        !/^[0-9]{10,12}$/.test(String(extra.validBefore || "")))
    )
      throw new Error("prepared_terms_tampered");
    if (
      rail.family === "svm" &&
      (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(String(extra.feePayer || "")) ||
        memo !== `g402:${prepared.challengeId}:${resourceHash}`)
    )
      throw new Error("prepared_terms_tampered");
  }

  async function approveAndSettle() {
    if (!challenge || challenge.rail.id === "gno-pearl") return;
    setError("");
    setReceipt(null);
    try {
      const accepted = challenge.paymentRequired.accepts[0];
      const paymentId = challenge.paymentId;
      let paymentPayload: PaymentPayload | null =
        signedAttempt?.challengeId === challenge.challengeId &&
        signedAttempt.paymentId === paymentId
          ? signedAttempt.paymentPayload
          : null;
      if (!selectedRail || selectedRail.id !== challenge.rail.id)
        throw new Error("prepared_rail_unavailable");
      let payer: string;
      let evmSigner: Awaited<
        ReturnType<typeof createInjectedEvmSigner>
      > | null = null;
      if (challenge.rail.family === "evm") {
        if (!evmProvider) throw new Error("reconnect_evm_wallet");
        evmSigner = await createInjectedEvmSigner(
          evmProvider,
          selectedEvmChain,
        );
        payer = evmSigner.address;
      } else {
        if (!solanaWallet || !solanaAccount)
          throw new Error("reconnect_solana_wallet");
        payer = solanaAccount.address;
      }
      assertTerms(accepted, selectedRail, payer, challenge);
      let unsignedPaymentPayload = challenge.unsignedPaymentPayload;
      if (!paymentPayload) {
        setPhase("validating server-bound terms");
        const reviewed = await jsonPost<{
          approved: true;
          unsignedPaymentPayload?: Challenge["unsignedPaymentPayload"];
        }>("/api/v2/review", {
          challengeId: challenge.challengeId,
          walletAddress: payer,
          paymentRequired: challenge.paymentRequired,
          ...(challenge.rail.family === "svm"
            ? { unsignedPaymentPayload: challenge.unsignedPaymentPayload }
            : {}),
        });
        if (challenge.rail.family === "svm") {
          if (!reviewed.unsignedPaymentPayload?.payload.transaction)
            throw new Error("refreshed_solana_transaction_missing");
          unsignedPaymentPayload = reviewed.unsignedPaymentPayload;
          rememberChallenge({ ...challenge, unsignedPaymentPayload });
        }
      }
      if (!paymentPayload && challenge.rail.family === "evm") {
        if (!evmSigner) throw new Error("reconnect_evm_wallet");
        setPhase("confirm EIP-712 signature in wallet");
        const authorizationNonce = accepted.extra?.authorizationNonce;
        const validBefore = accepted.extra?.validBefore;
        const name = accepted.extra?.name;
        const version = accepted.extra?.version;
        if (
          typeof authorizationNonce !== "string" ||
          !/^0x[0-9a-fA-F]{64}$/.test(authorizationNonce) ||
          typeof validBefore !== "string" ||
          typeof name !== "string" ||
          typeof version !== "string"
        )
          throw new Error("invalid_server_authorization_terms");
        const authorization = {
          from: evmSigner.address,
          to: getAddress(accepted.payTo),
          value: accepted.amount,
          validAfter: "0",
          validBefore,
          nonce: authorizationNonce as `0x${string}`,
        };
        const signature = await evmSigner.signTypedData({
          domain: {
            name,
            version,
            chainId: selectedEvmChain.id,
            verifyingContract: getAddress(accepted.asset),
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
        const created = {
          x402Version: 2,
          payload: { authorization, signature },
        };
        paymentPayload = {
          ...created,
          x402Version: 2,
          resource: challenge.paymentRequired.resource,
          accepted,
        };
      } else if (!paymentPayload) {
        if (
          !solanaWallet ||
          !solanaAccount ||
          !unsignedPaymentPayload?.payload.transaction
        )
          throw new Error("reconnect_solana_wallet");
        setPhase("confirm Solana transaction in wallet");
        const outputs = await solanaWallet.features[
          SolanaSignTransaction
        ].signTransaction({
          account: solanaAccount,
          chain: selectedSolanaChain,
          transaction: bytesFromBase64(
            unsignedPaymentPayload.payload.transaction,
          ),
        });
        if (outputs.length !== 1 || !outputs[0]?.signedTransaction?.length)
          throw new Error("invalid_wallet_signature");
        paymentPayload = {
          x402Version: 2,
          resource: challenge.paymentRequired.resource,
          accepted,
          payload: {
            transaction: base64FromBytes(outputs[0].signedTransaction),
          },
        };
      }
      if (!paymentPayload) throw new Error("signed_payment_payload_missing");
      rememberSignedAttempt({
        challengeId: challenge.challengeId,
        paymentId,
        paymentPayload,
      });
      setPhase("facilitator verify + settle");
      const settlement = await jsonPost<Record<string, unknown>>(
        "/api/v2/settle",
        { challengeId: challenge.challengeId, paymentId, paymentPayload },
      );
      if (settlement.pending) {
        setReceipt({ paymentId, ...settlement });
        setPhase("settlement pending");
        return;
      }
      if (!settlement.success)
        throw new Error(String(settlement.errorReason || "settlement_failed"));
      setPhase("unlocking resource");
      const paid = await fetch("/api/demo/multichain-paid-data", {
        headers: { "x-payment-id": paymentId },
        cache: "no-store",
      });
      const data = (await paid.json()) as Record<string, unknown>;
      if (!paid.ok)
        throw new Error(String(data.error || "paid_resource_failed"));
      setReceipt({ paymentId, ...settlement, data });
      setPhase("complete");
      clearCompletedSession();
    } catch (cause) {
      setPhase("failed");
      setError(cause instanceof Error ? cause.message : "payment_failed");
    }
  }

  const busy = ![
    "idle",
    "failed",
    "complete",
    "awaiting human approval",
    "prepared by agent",
    "restored challenge",
    "signed payment ready to retry",
    "settlement pending",
  ].includes(phase);
  const accepted = challenge?.paymentRequired.accepts[0];

  return (
    <>
      {error && !selectedRail && <div className="errorBanner">{error}</div>}
      <section className="railGrid">
        {rails.map((rail) => {
          const contents = (
            <>
              <span className={`chainIcon ${rail.family}`}>
                {rail.family === "evm"
                  ? "Ξ"
                  : rail.family === "svm"
                    ? "S"
                    : "g"}
              </span>
              <span>
                <small>{rail.chain}</small>
                <b>{rail.label}</b>
                <em>
                  {rail.symbol} · {rail.wallet}
                  {rail.family === "gno" ? " · dedicated flow" : ""}
                </em>
              </span>
              <i
                className={
                  rail.status.endsWith("ready") ? "success" : "pending"
                }
              >
                {rail.status === "native_ready"
                  ? "NATIVE READY"
                  : rail.status === "sdk_ready"
                    ? "SDK READY"
                    : rail.status === "locked"
                      ? "LOCKED"
                      : "SETUP"}
              </i>
            </>
          );
          if (rail.family === "gno") {
            return (
              <Link
                key={rail.id}
                className="card railCard"
                href="/wallet"
                aria-label="Open the dedicated Gno Adena payment flow"
              >
                {contents}
              </Link>
            );
          }
          return (
            <button
              key={rail.id}
              className={`card railCard ${selected === rail.id ? "selected" : ""}`}
              disabled={rail.mainnet && rail.status !== "sdk_ready"}
              onClick={() => setSelected(rail.id as RailId)}
            >
              {contents}
            </button>
          );
        })}
      </section>

      {selectedRail && (
        <section className="grid payLayout">
          <div className="card approvalPanel">
            <div className="sectionTitle">
              <div>
                <div className="eyebrow">01 · CONNECT & PREPARE</div>
                <h2>{selectedRail.label}</h2>
              </div>
              <span className="badge pending">
                {selectedRail.mainnet ? "MAINNET OPT-IN" : "TESTNET"}
              </span>
            </div>
            <p>
              Wallet address is bound before the server issues terms. The agent
              cannot choose a token, recipient, RPC, or facilitator URL.
            </p>
            {selectedRail.family === "evm" && evmWalletOptions.length > 1 && (
              <div className="termRows">
                <div>
                  <span>EVM wallet</span>
                  <select
                    className="button secondary"
                    aria-label="Select an EVM wallet"
                    value={evmProviderChoiceId}
                    onChange={(event) => {
                      setEvmProviderChoiceId(event.target.value);
                      setEvmProvider(null);
                      setEvmAddress("");
                    }}
                  >
                    <option value="">Choose wallet</option>
                    {evmWalletOptions.map((wallet) => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            {selectedRail.family === "svm" && solanaWallets.length > 1 && (
              <div className="termRows">
                <div>
                  <span>Solana wallet</span>
                  <select
                    className="button secondary"
                    aria-label="Select a Solana wallet"
                    value={
                      solanaWalletChoice
                        ? String(solanaWallets.indexOf(solanaWalletChoice))
                        : ""
                    }
                    onChange={(event) => {
                      const next = event.target.value
                        ? solanaWallets[Number(event.target.value)] || null
                        : null;
                      setSolanaWalletChoice(next);
                      setSolanaWallet(null);
                      setSolanaAccount(null);
                    }}
                  >
                    <option value="">Choose wallet</option>
                    {solanaWallets.map((wallet, index) => (
                      <option key={`${wallet.name}-${index}`} value={index}>
                        {wallet.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            <div className="capabilityList">
              {selectedRail.capabilities.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <button
              className="button"
              disabled={busy || selectedRail.status !== "sdk_ready"}
              onClick={
                selectedRail.family === "evm" ? prepareEvm : prepareSolana
              }
            >
              {challenge?.rail.id === selected &&
              phase === "signed payment ready to retry"
                ? `Connect ${selectedRail.wallet} to resume payment`
                : challenge?.rail.id === selected &&
                    ["prepared by agent", "restored challenge"].includes(phase)
                  ? `Connect ${selectedRail.wallet} to restored terms`
                  : challenge?.rail.id === selected
                    ? "Issue fresh challenge"
                    : `Connect ${selectedRail.wallet}`}
            </button>
            <Link className="button secondary spaced" href="/wallet">
              Open dedicated Gno / Adena flow
            </Link>
            {error && <div className="errorBanner">{error}</div>}
          </div>
          <div
            className={`card approvalPanel termsPanel ${accepted ? "ready" : ""}`}
          >
            <div className="sectionTitle">
              <div>
                <div className="eyebrow">02 · HUMAN REVIEW</div>
                <h2>Payment terms</h2>
              </div>
              <span className={accepted ? "success" : "mutedText"}>
                {phase}
              </span>
            </div>
            {accepted ? (
              <>
                <div className="termRows">
                  <div>
                    <span>Network</span>
                    <b className="mono">{accepted.network}</b>
                  </div>
                  <div>
                    <span>Asset</span>
                    <b className="mono">{accepted.asset}</b>
                  </div>
                  <div>
                    <span>Amount</span>
                    <b>
                      {formatAtomicAmount(
                        accepted.amount,
                        challenge?.rail.decimals || 0,
                      )}{" "}
                      {challenge?.rail.symbol}
                    </b>
                    <small className="mutedText">
                      {accepted.amount} atomic units
                    </small>
                  </div>
                  <div>
                    <span>Recipient</span>
                    <b className="mono">{accepted.payTo}</b>
                  </div>
                  <div>
                    <span>Resource</span>
                    <b className="mono">
                      {challenge?.paymentRequired.resource.url}
                    </b>
                  </div>
                </div>
                <button
                  className="button reviewButton"
                  disabled={busy || challenge?.rail.id !== selected}
                  onClick={approveAndSettle}
                >
                  Approve in wallet & settle
                </button>
              </>
            ) : (
              <p className="emptyState">
                Connect a wallet to receive one server-bound, short-lived x402
                challenge.
              </p>
            )}
          </div>
        </section>
      )}

      <section className="grid safetyGrid">
        <div className="card">
          <div className="eyebrow">MAINNET BOUNDARY</div>
          <h3>Mainnets are independently locked by default</h3>
          <p>
            Ethereum and Solana mainnet routes require an independent opt-in, a
            chain-specific recipient, RPC configuration and a compatible
            production facilitator. Gno keeps its own separate lock.
          </p>
        </div>
        <div className="card">
          <div className="eyebrow">HUMAN-IN-THE-LOOP</div>
          <h3>No server-held payer keys</h3>
          <p>
            EIP-712 or the Solana v0 transaction is signed in the connected
            wallet. The server receives only the signed x402 payload.
          </p>
        </div>
      </section>

      {receipt && (
        <section className="card successCard">
          <div className="eyebrow">
            {phase === "complete" ? "RESOURCE UNLOCKED" : "PAYMENT RECEIPT"}
          </div>
          <pre className="code">{JSON.stringify(receipt, null, 2)}</pre>
        </section>
      )}
    </>
  );
}
