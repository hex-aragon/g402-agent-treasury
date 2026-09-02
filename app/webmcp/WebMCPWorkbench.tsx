"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  decodePreparedMultichainPayment,
  decodePreparedWebMCPPayment,
  WEBMCP_EVENTS,
  WEBMCP_STORAGE,
  WEBMCP_TOOL_CATALOG,
  type PreparedMultichainPayment,
  type PreparedWebMCPPayment,
  type WebMCPActivity,
} from "@/lib/webmcp";

type SupportState = {
  state: "checking" | "ready" | "partial" | "unavailable" | "error";
  count: number;
};

function readActivities(): WebMCPActivity[] {
  try {
    const parsed: unknown = JSON.parse(
      sessionStorage.getItem(WEBMCP_STORAGE.activity) || "[]",
    );
    return Array.isArray(parsed)
      ? (parsed.slice(0, 8) as WebMCPActivity[])
      : [];
  } catch {
    return [];
  }
}

function supportFromDocument(): SupportState {
  const value = document.documentElement.dataset.webmcp;
  const count = Number(document.documentElement.dataset.webmcpCount || 0);
  if (value === "ready")
    return {
      state: "ready",
      count:
        Number.isInteger(count) && count > 0
          ? count
          : WEBMCP_TOOL_CATALOG.length,
    };
  if (value === "partial")
    return {
      state: "partial",
      count: Number.isInteger(count) && count > 0 ? count : 1,
    };
  if (value === "unavailable") return { state: "unavailable", count: 0 };
  if (value === "error") return { state: "error", count: 0 };
  return { state: "checking", count: 0 };
}

function short(value: string) {
  return value.length > 24 ? `${value.slice(0, 11)}…${value.slice(-9)}` : value;
}

export default function WebMCPWorkbench() {
  const [support, setSupport] = useState<SupportState>({
    state: "checking",
    count: 0,
  });
  const [prepared, setPrepared] = useState<PreparedWebMCPPayment | null>(null);
  const [multichain, setMultichain] =
    useState<PreparedMultichainPayment | null>(null);
  const [activity, setActivity] = useState<WebMCPActivity[]>([]);

  useEffect(() => {
    setSupport(supportFromDocument());
    setPrepared(
      decodePreparedWebMCPPayment(
        sessionStorage.getItem(WEBMCP_STORAGE.preparedPayment),
      ),
    );
    setMultichain(
      decodePreparedMultichainPayment(
        sessionStorage.getItem(WEBMCP_STORAGE.preparedMultichainPayment),
      ),
    );
    setActivity(readActivities());
    const onReady = (event: Event) => {
      const detail = (
        event as CustomEvent<{ supported: boolean; count: number }>
      ).detail;
      setSupport(
        detail.supported
          ? {
              state:
                detail.count === WEBMCP_TOOL_CATALOG.length
                  ? "ready"
                  : detail.count > 0
                    ? "partial"
                    : "error",
              count: detail.count,
            }
          : { state: "unavailable", count: 0 },
      );
    };
    const onPrepared = (event: Event) =>
      setPrepared((event as CustomEvent<PreparedWebMCPPayment>).detail);
    const onMultichainPrepared = (event: Event) =>
      setMultichain((event as CustomEvent<PreparedMultichainPayment>).detail);
    const onActivity = () => setActivity(readActivities());
    window.addEventListener(WEBMCP_EVENTS.ready, onReady);
    window.addEventListener(WEBMCP_EVENTS.preparedPayment, onPrepared);
    window.addEventListener(
      WEBMCP_EVENTS.preparedMultichainPayment,
      onMultichainPrepared,
    );
    window.addEventListener(WEBMCP_EVENTS.activity, onActivity);
    const fallback = window.setTimeout(
      () => setSupport(supportFromDocument()),
      500,
    );
    return () => {
      window.clearTimeout(fallback);
      window.removeEventListener(WEBMCP_EVENTS.ready, onReady);
      window.removeEventListener(WEBMCP_EVENTS.preparedPayment, onPrepared);
      window.removeEventListener(
        WEBMCP_EVENTS.preparedMultichainPayment,
        onMultichainPrepared,
      );
      window.removeEventListener(WEBMCP_EVENTS.activity, onActivity);
    };
  }, []);

  const expired = prepared
    ? prepared.paymentRequirements.extra.expiresAt * 1000 <= Date.now()
    : false;
  const supportLabel =
    support.state === "ready"
      ? `${support.count} tools registered`
      : support.state === "partial"
        ? `${support.count} tools registered`
        : support.state === "unavailable"
          ? "WebMCP browser required"
          : support.state === "error"
            ? "Registration failed"
            : "Checking browser support";

  return (
    <>
      <section className="webmcpStatus card">
        <div>
          <div className="eyebrow">LIVE BROWSER CAPABILITY</div>
          <h2>Agent tools</h2>
          <p>
            이 페이지를 연 에이전트는 화면을 추측하지 않고 EVM·Solana·Gno 결제
            레일과 영수증을 구조화된 도구로 직접 다룹니다.
          </p>
        </div>
        <div className={`capabilityBadge ${support.state}`}>
          <span className="pulse" />
          {supportLabel}
        </div>
      </section>

      <section className="webmcpFlow">
        {WEBMCP_TOOL_CATALOG.map((tool, index) => (
          <article className="flowStep" key={tool.name}>
            <span className="stepNumber">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <span className="toolKind">{tool.kind}</span>
              <h3>{tool.title}</h3>
              <code>{tool.name}</code>
              <p>{tool.description}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="grid webmcpPanels">
        <div className="card agentPrompt">
          <div className="sectionTitle">
            <h2>Try with your agent</h2>
            <span>copy as a prompt</span>
          </div>
          <p>
            “List every payment rail and confirm all mainnets are locked.
            Prepare a Base Sepolia or Solana Devnet payment for my connected
            wallet, then open the human review screen.”
          </p>
          <small>
            The agent prepares immutable terms. Only you can approve the wallet
            signature.
          </small>
        </div>
        <div
          className={`card preparedCard ${multichain || (prepared && !expired) ? "active" : ""}`}
        >
          <div className="sectionTitle">
            <h2>Prepared by agent</h2>
            <span>
              {multichain
                ? "awaiting human"
                : prepared
                  ? expired
                    ? "expired"
                    : "awaiting human"
                  : "empty"}
            </span>
          </div>
          {multichain ? (
            <>
              <div className="statusLine">
                <span>Rail</span>
                <b>{multichain.rail.id}</b>
              </div>
              <div className="statusLine">
                <span>Network</span>
                <b className="mono">
                  {short(multichain.paymentRequired.accepts[0].network)}
                </b>
              </div>
              <div className="statusLine">
                <span>Amount</span>
                <b>
                  {multichain.paymentRequired.accepts[0].amount}{" "}
                  {multichain.rail.symbol}
                </b>
              </div>
              <div className="statusLine">
                <span>Transfer</span>
                <b className="pending">Not submitted</b>
              </div>
              <Link className="button reviewButton" href="/pay?source=webmcp">
                Review in wallet
              </Link>
            </>
          ) : prepared ? (
            <>
              <div className="statusLine">
                <span>Network</span>
                <b>{prepared.paymentRequirements.extra.chainId}</b>
              </div>
              <div className="statusLine">
                <span>Amount</span>
                <b>{prepared.paymentRequirements.amount} WUGNOT</b>
              </div>
              <div className="statusLine">
                <span>Recipient</span>
                <b className="mono">
                  {short(prepared.paymentRequirements.payTo)}
                </b>
              </div>
              <div className="statusLine">
                <span>Transfer</span>
                <b className="pending">Not submitted</b>
              </div>
              {!expired ? (
                <Link
                  className="button reviewButton"
                  href="/wallet?source=webmcp"
                >
                  Review in Adena
                </Link>
              ) : (
                <p className="failed">Ask the agent to prepare fresh terms.</p>
              )}
            </>
          ) : (
            <p className="emptyState">
              A prepared quote appears here when the agent calls{" "}
              <code>prepare_agent_payment</code>.
            </p>
          )}
        </div>
      </section>

      <section className="card activityPanel">
        <div className="sectionTitle">
          <h2>Shared activity</h2>
          <span>{activity.length} recent calls</span>
        </div>
        {activity.length ? (
          <div className="activity">
            {activity.map((item) => (
              <div className="activityItem" key={item.id}>
                <i
                  className={`dot ${item.status === "error" ? "errorDot" : ""}`}
                />
                <div>
                  <p>
                    <code>{item.tool}</code> · {item.summary}
                  </p>
                  <small>{new Date(item.at).toLocaleString()}</small>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="emptyState">
            Tool calls will appear here so the human and agent share the same
            audit trail.
          </p>
        )}
      </section>
    </>
  );
}
