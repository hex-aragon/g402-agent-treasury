"use client";

import { useEffect, useState } from "react";
import { connectAdena, signG402Payment, type AdenaAccount } from "@/lib/adena";
import type { PaymentRequirements } from "@/lib/domain";
import {
  decodePreparedWebMCPPayment,
  isSafePreparedWebMCPPayment,
  isSafeWebMCPHealth,
  WEBMCP_STORAGE,
  type PreparedWebMCPPayment,
} from "@/lib/webmcp";

type Receipt = { paymentId: string; transaction?: string; data?: unknown };

export default function WalletClient() {
  const [account, setAccount] = useState<AdenaAccount | null>(null);
  const [error, setError] = useState("");
  const [signed, setSigned] = useState("");
  const [phase, setPhase] = useState("idle");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [prepared, setPrepared] = useState<PreparedWebMCPPayment | null>(null);

  useEffect(() => {
    setPrepared(decodePreparedWebMCPPayment(sessionStorage.getItem(WEBMCP_STORAGE.preparedPayment)));
  }, []);

  async function connect() {
    setError("");
    try {
      setAccount(await connectAdena());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "wallet_error");
    }
  }

  async function loadPreparedRequirements(): Promise<PaymentRequirements | null> {
    if (!prepared) return null;
    if (!account || !isSafePreparedWebMCPPayment(prepared, account.address, window.location.origin)) {
      throw new Error("prepared_terms_expired_or_wallet_mismatch");
    }
    const response = await fetch("/api/health", { cache: "no-store" });
    const health: unknown = await response.json();
    if (!response.ok || !isSafeWebMCPHealth(health)) throw new Error("pearl_safety_check_failed");
    return prepared.paymentRequirements;
  }

  async function issueSelfTestChallenge(): Promise<PaymentRequirements> {
    if (!account) throw new Error("wallet_not_connected");
    const response = await fetch(`/api/demo/paid-data?payTo=${encodeURIComponent(account.address)}`, { cache: "no-store" });
    const body = await response.json() as { paymentRequirements?: PaymentRequirements; error?: string };
    if (response.status !== 402 || !body.paymentRequirements) throw new Error(body.error || "challenge_unavailable");
    return body.paymentRequirements;
  }

  async function runPayment() {
    if (!account) return;
    setError("");
    setReceipt(null);
    try {
      setPhase(prepared ? "safety check" : "challenge");
      const requirements = await loadPreparedRequirements() || await issueSelfTestChallenge();
      const paymentId = `pay_${crypto.randomUUID().replaceAll("-", "")}`;
      setPhase("awaiting human signature");
      const signedTx = await signG402Payment(account, requirements, paymentId);
      const request = {
        paymentPayload: {
          x402Version: 2 as const,
          scheme: "exact" as const,
          network: requirements.network,
          payload: { signedTx, payer: account.address, paymentId, createdAt: Math.floor(Date.now() / 1000) },
        },
        paymentRequirements: requirements,
      };
      setSigned(JSON.stringify(request, null, 2));
      setPhase("verifying");
      const verified = await fetch("/api/v1/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(request) });
      const verification = await verified.json() as { isValid?: boolean; invalidReason?: string; error?: string };
      if (!verified.ok || !verification.isValid) throw new Error(verification.invalidReason || verification.error || "verification_failed");
      setPhase("settling");
      const settled = await fetch("/api/v1/settle", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(request) });
      const settlement = await settled.json() as { success?: boolean; pending?: boolean; transaction?: string; errorReason?: string; error?: string };
      if (!settled.ok && !settlement.pending) throw new Error(settlement.errorReason || settlement.error || "settlement_failed");
      if (!settlement.success) {
        setReceipt({ paymentId, transaction: settlement.transaction });
        setPhase("pending");
        return;
      }
      setPhase("unlocking");
      const paid = await fetch("/api/demo/paid-data", { headers: { "x-payment-id": paymentId }, cache: "no-store" });
      const data: unknown = await paid.json();
      if (!paid.ok) throw new Error(typeof data === "object" && data && "error" in data ? String(data.error) : "paid_resource_failed");
      setReceipt({ paymentId, transaction: settlement.transaction, data });
      setPhase("complete");
      if (prepared) {
        sessionStorage.removeItem(WEBMCP_STORAGE.preparedPayment);
        setPrepared(null);
      }
    } catch (cause) {
      setPhase("failed");
      setError(cause instanceof Error ? cause.message : "payment_failed");
    }
  }

  const busy = !["idle", "complete", "failed", "pending"].includes(phase);
  const preparedExpired = Boolean(prepared && prepared.paymentRequirements.extra.expiresAt * 1000 <= Date.now());

  return <>
    {prepared && <div className={`card agentPreparedWallet ${preparedExpired ? "warning" : ""}`}>
      <div>
        <div className="eyebrow">PREPARED THROUGH WEBMCP</div>
        <h3>Human approval required</h3>
        <p>The agent prepared these terms but cannot sign or transfer. Confirm them before Adena opens.</p>
      </div>
      <div className="preparedTerms">
        <span><small>NETWORK</small><b>{prepared.paymentRequirements.extra.chainId}</b></span>
        <span><small>AMOUNT</small><b>{prepared.paymentRequirements.amount} WUGNOT</b></span>
        <span><small>RECIPIENT</small><b className="mono">{prepared.paymentRequirements.payTo.slice(0, 10)}…{prepared.paymentRequirements.payTo.slice(-6)}</b></span>
        <span><small>STATUS</small><b className={preparedExpired ? "failed" : "pending"}>{preparedExpired ? "Expired" : "Not signed"}</b></span>
      </div>
    </div>}
    <div className="grid twoCol">
      <div className="card feature">
        <div className="eyebrow">LIVE PEARL FLOW</div>
        <h3>Adena → Facilitator → Gno</h3>
        <p>{prepared ? "Connect the exact wallet shown above. The reviewed challenge is consumed verbatim—no replacement terms are created." : "발급된 challenge를 Adena에서 서명하고, 서버가 서명·nonce·수취인·금액을 검증한 뒤 Pearl 테스트넷에 브로드캐스트합니다."}</p>
        <button className="button" onClick={connect}>{account ? "Wallet connected" : "Connect Adena"}</button>
        {account && <button className="button secondary spaced" onClick={runPayment} disabled={busy || preparedExpired}>
          {busy ? `Running: ${phase}` : prepared ? "Review & request Adena signature" : "Run paid API test"}
        </button>}
        {error && <p className="failed">{error}</p>}
        {phase === "pending" && <p className="pending">트랜잭션 결과 확인 대기 중입니다. Scan에서 동기화하세요.</p>}
      </div>
      <div className="card feature">
        <h3>Current account</h3>
        {account ? <>
          <div className="statusLine"><span>Address</span><b className="mono">{account.address.slice(0, 10)}…{account.address.slice(-6)}</b></div>
          <div className="statusLine"><span>Network</span><b>{account.chainId}</b></div>
          <div className="statusLine"><span>Account</span><b>{account.accountNumber}</b></div>
          <div className="statusLine"><span>Sequence</span><b>{account.sequence}</b></div>
          <div className="statusLine"><span>Balance</span><b>{account.coins}</b></div>
        </> : <p>Connect Adena to load account state.</p>}
      </div>
    </div>
    {receipt && <div className="card feature successCard">
      <div className="eyebrow">{phase === "complete" ? "PAYMENT COMPLETE" : "BROADCAST PENDING"}</div>
      <h3>{receipt.paymentId}</h3>
      <div className="statusLine"><span>Transaction</span><b className="mono">{receipt.transaction || "pending"}</b></div>
      {receipt.data !== undefined && <pre className="code">{JSON.stringify(receipt.data, null, 2)}</pre>}
    </div>}
    {signed && <details className="card feature requestEnvelope"><summary>Signed facilitator request</summary><pre className="code">{signed}</pre></details>}
  </>;
}
