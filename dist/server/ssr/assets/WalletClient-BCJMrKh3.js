import { D as __toESM, t as require_jsx_runtime, y as require_react } from "../index.js";
//#region lib/adena.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
function getAdena() {
	if (typeof window === "undefined" || !window.adena) throw new Error("adena_not_installed");
	return window.adena;
}
async function connectAdena() {
	const provider = getAdena(), connection = await provider.AddEstablish("g402 Agent Wallet");
	if (connection.status !== "success") throw new Error(connection.message || "adena_connection_rejected");
	const account = await provider.GetAccount();
	if (account.status !== "success") throw new Error(account.message || "adena_account_unavailable");
	return account.data;
}
async function signG402Payment(account, requirements, paymentId) {
	if (account.chainId !== requirements.extra.chainId) throw new Error("adena_network_mismatch");
	const memo = `g402:${paymentId}:${requirements.extra.nonce}:${requirements.extra.resourceHash}`;
	const message = !requirements.asset.includes("/") ? {
		type: "/bank.MsgSend",
		value: {
			from_address: account.address,
			to_address: requirements.payTo,
			amount: `${requirements.amount}${requirements.extra.denom}`
		}
	} : {
		type: "/vm.m_call",
		value: {
			caller: account.address,
			send: "",
			max_deposit: "",
			pkg_path: requirements.asset,
			func: "Transfer",
			args: [requirements.payTo, requirements.amount]
		}
	};
	const provider = getAdena();
	if (!provider.SignTx) throw new Error("adena_signtx_unavailable");
	const response = await provider.SignTx({
		messages: [message],
		memo
	}, true);
	if (response.status !== "success" || !response.data.encodedTransaction) throw new Error(response.message || "adena_signature_rejected");
	const envelope = {
		encodedTransaction: response.data.encodedTransaction,
		chainId: account.chainId,
		accountNumber: account.account_number,
		sequence: account.sequence
	}, bytes = new TextEncoder().encode(JSON.stringify(envelope));
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
//#endregion
//#region app/wallet/WalletClient.tsx
var import_jsx_runtime = require_jsx_runtime();
function WalletClient() {
	const [account, setAccount] = (0, import_react.useState)(null), [error, setError] = (0, import_react.useState)(""), [signed, setSigned] = (0, import_react.useState)("");
	async function connect() {
		setError("");
		try {
			setAccount(await connectAdena());
		} catch (e) {
			setError(e instanceof Error ? e.message : "wallet_error");
		}
	}
	async function signSample() {
		if (!account) return;
		setError("");
		try {
			const response = await fetch("/api/demo/paid-data", { cache: "no-store" }), body = await response.json();
			if (response.status !== 402 || !body.paymentRequirements) throw new Error("challenge_unavailable");
			const paymentId = `pay_${crypto.randomUUID().replaceAll("-", "")}`, signedTx = await signG402Payment(account, body.paymentRequirements, paymentId);
			setSigned(JSON.stringify({
				paymentPayload: {
					x402Version: 2,
					scheme: "exact",
					network: body.paymentRequirements.network,
					payload: {
						signedTx,
						payer: account.address,
						paymentId,
						createdAt: Math.floor(Date.now() / 1e3)
					}
				},
				paymentRequirements: body.paymentRequirements
			}, null, 2));
		} catch (e) {
			setError(e instanceof Error ? e.message : "signing_failed");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid twoCol",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card feature",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "eyebrow",
					children: "NON-CUSTODIAL"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Adena Wallet" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "키는 브라우저 확장 프로그램을 떠나지 않습니다. g402는 승인된 서명 문서만 받습니다." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "button",
					onClick: connect,
					children: account ? "Connected" : "Connect Adena"
				}),
				account && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "button secondary spaced",
					onClick: signSample,
					children: "Sign sample payment"
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "failed",
					children: error
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "card feature",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Current account" }), account ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "statusLine",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Address" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", {
						className: "mono",
						children: [
							account.address.slice(0, 10),
							"…",
							account.address.slice(-6)
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "statusLine",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Network" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: account.chainId })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "statusLine",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sequence" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: account.sequence })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "statusLine",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Balance" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: account.coins })]
				})
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Connect Adena to load account state." })]
		})]
	}), signed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "card feature",
		style: { marginTop: 14 },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Signed facilitator request" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				"Submit this envelope to ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mono",
					children: "/api/v1/verify"
				}),
				", then ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mono",
					children: "/api/v1/settle"
				}),
				"."
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				className: "code",
				children: signed
			})
		]
	})] });
}
//#endregion
export { WalletClient as default };
