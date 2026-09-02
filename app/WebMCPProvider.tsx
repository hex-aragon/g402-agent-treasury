"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  createWebMCPTools,
  decodePreparedMultichainPayment,
  decodePreparedWebMCPPayment,
  WEBMCP_EVENTS,
  WEBMCP_STORAGE,
  type PreparedMultichainPayment,
  type PreparedWebMCPPayment,
  type WebMCPActivity,
  type WebMCPTool,
} from "@/lib/webmcp";

type BrowserModelContext = {
  registerTool(
    tool: WebMCPTool,
    options?: { signal?: AbortSignal },
  ): Promise<void>;
};

type WebMCPDocument = Document & { modelContext?: BrowserModelContext };
type WebMCPWindow = Window & { __g402WebMCPLifecycle?: AbortController };

function readActivity(): WebMCPActivity[] {
  try {
    const parsed: unknown = JSON.parse(
      sessionStorage.getItem(WEBMCP_STORAGE.activity) || "[]",
    );
    return Array.isArray(parsed)
      ? (parsed.slice(0, 12) as WebMCPActivity[])
      : [];
  } catch {
    return [];
  }
}

function recordActivity(activity: WebMCPActivity) {
  const next = [activity, ...readActivity()].slice(0, 12);
  sessionStorage.setItem(WEBMCP_STORAGE.activity, JSON.stringify(next));
  window.dispatchEvent(
    new CustomEvent(WEBMCP_EVENTS.activity, { detail: activity }),
  );
}

function savePreparedPayment(payment: PreparedWebMCPPayment) {
  sessionStorage.removeItem(WEBMCP_STORAGE.preparedMultichainPayment);
  sessionStorage.setItem(
    WEBMCP_STORAGE.preparedPayment,
    JSON.stringify(payment),
  );
  window.dispatchEvent(
    new CustomEvent(WEBMCP_EVENTS.preparedPayment, { detail: payment }),
  );
}

function savePreparedMultichainPayment(payment: PreparedMultichainPayment) {
  sessionStorage.removeItem(WEBMCP_STORAGE.preparedPayment);
  sessionStorage.setItem(
    WEBMCP_STORAGE.preparedMultichainPayment,
    JSON.stringify(payment),
  );
  window.dispatchEvent(
    new CustomEvent(WEBMCP_EVENTS.preparedMultichainPayment, {
      detail: payment,
    }),
  );
}

export default function WebMCPProvider() {
  const router = useRouter();

  useEffect(() => {
    const context = (document as WebMCPDocument).modelContext;
    const root = document.documentElement;
    if (!context || typeof context.registerTool !== "function") {
      root.dataset.webmcp = "unavailable";
      root.dataset.webmcpCount = "0";
      window.dispatchEvent(
        new CustomEvent(WEBMCP_EVENTS.ready, {
          detail: { supported: false, count: 0 },
        }),
      );
      return;
    }

    const browserWindow = window as WebMCPWindow;
    browserWindow.__g402WebMCPLifecycle?.abort();
    const lifecycle = new AbortController();
    browserWindow.__g402WebMCPLifecycle = lifecycle;
    const tools = createWebMCPTools({
      fetcher: window.fetch.bind(window),
      origin: window.location.origin,
      savePreparedPayment,
      loadPreparedPayment: () =>
        decodePreparedWebMCPPayment(
          sessionStorage.getItem(WEBMCP_STORAGE.preparedPayment),
        ),
      savePreparedMultichainPayment,
      loadPreparedMultichainPayment: () =>
        decodePreparedMultichainPayment(
          sessionStorage.getItem(WEBMCP_STORAGE.preparedMultichainPayment),
        ),
      recordActivity,
      navigate: (path) => router.push(path),
    });

    void (async () => {
      let count = 0;
      await Promise.resolve();
      for (const tool of tools) {
        if (lifecycle.signal.aborted) return;
        try {
          await context.registerTool(tool, { signal: lifecycle.signal });
          count += 1;
        } catch {
          if (lifecycle.signal.aborted) return;
        }
      }
      root.dataset.webmcp =
        count === tools.length ? "ready" : count > 0 ? "partial" : "error";
      root.dataset.webmcpCount = String(count);
      window.dispatchEvent(
        new CustomEvent(WEBMCP_EVENTS.ready, {
          detail: { supported: true, count },
        }),
      );
    })();

    return () => {
      lifecycle.abort();
      if (browserWindow.__g402WebMCPLifecycle === lifecycle)
        delete browserWindow.__g402WebMCPLifecycle;
    };
  }, [router]);

  return null;
}
