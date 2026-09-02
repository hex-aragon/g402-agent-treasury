# WebMCP Challenge implementation

## Product claim

g402 Agent Treasury lets a person and an AI agent operate the same testnet payment workflow without giving the agent custody. The agent reads live infrastructure, finds relevant chain activity, prepares a strictly bounded x402 challenge, and opens the review screen. The person sees the same terms and decides whether to approve Adena. The agent can then verify the durable receipt.

This is not a simulated checkout. The existing application verifies the signed TM2 transaction, atomically claims the challenge and nonce in D1, broadcasts to GnoLand Pearl, unlocks a paid API response, and indexes the canonical receipt. The `g402pay` realm contract is source-complete but not deployed; it is not represented as a live feature.

## Human + agent flow

1. The agent calls `inspect_g402_gateway` and confirms that the deployment is healthy, fixed to Pearl, and mainnet is locked.
2. The agent calls `search_gno_activity` to inspect recent or matching canonical activity.
3. The agent calls `prepare_pearl_payment` with the user's Pearl Adena address.
4. The site writes an expiring challenge and updates the shared `/webmcp` page. No signature or transfer occurs.
5. The agent calls `open_payment_review`, which navigates the visible app to `/wallet`.
6. The human connects the exact Adena account shown in the prepared terms and clicks the signature button.
7. The existing verifier checks the signature, signer, network, recipient, amount, asset, nonce, expiry and resource binding before settlement.
8. The agent calls `get_payment_receipt` with the returned payment ID and reports the durable status, chain hash, block and confirmations.

## Why WebMCP materially improves this workflow

Without WebMCP, an agent must visually interpret multiple dashboards and the person must copy network state, addresses, payment IDs and transaction hashes between pages. With WebMCP, every machine action uses a named operation with a narrow JSON Schema, while the human sees the same prepared terms and remains the only signer. The boundary between preparation and authorization is explicit and testable.

## Implementation

- `app/WebMCPProvider.tsx` registers tools on the top-level page with `document.modelContext.registerTool`.
- One `AbortController` owns the registration lifecycle and prevents stale tools after remounts.
- `lib/webmcp.ts` owns tool schemas, bounded outputs, client-side validation and reusable safety predicates.
- Tool execution reuses same-origin application APIs and their existing server-side authorization, validation and, where configured, rate limits.
- `app/webmcp/WebMCPWorkbench.tsx` displays registration status, prepared terms and a session-scoped activity trail.
- `app/wallet/WalletClient.tsx` consumes the exact agent-prepared challenge and rechecks it before requesting a signature.
- `app/api/v1/payments/route.ts` supports exact payment ID lookup.

## Security boundaries

`prepare_pearl_payment` fails closed unless all of these are true:

- health is `ok`
- network is `gno:pearl-1`
- chain ID is `pearl-1`
- `locks.gnoMainnet` is exactly `true`
- settlement and self-test are enabled
- payment mode is `direct`
- asset is `gno.land/r/gnoland/wugnot`
- denomination is `ugnot`
- amount is exactly `1000`
- recipient equals the supplied Adena address
- resource is the same-origin `/api/demo/paid-data`

The WebMCP surface deliberately does not expose raw settlement, signed transaction input, internal index synchronization, arbitrary payment terms, policy administration, mainnet configuration, or the undeployed `g402pay` realm.

Chain-derived search and receipt tools use `untrustedContentHint: true`, omit raw memos and logs, and cap search results at five. Read-only annotations are applied only to operations without state changes.

## Test instructions

### ChatGPT in-app browser

1. Open the live `/webmcp` route in the latest ChatGPT desktop app.
2. Verify that the browser lists five Site tools.
3. Ask the suggested prompt from the README.
4. Confirm that prepared terms appear in the shared UI and say `Not submitted`.
5. Let the agent open review and confirm that signing is still reserved for the person.
6. To inspect a completed payment, give the agent an existing payment ID and ask it to verify the receipt.

### Chrome

1. Enable `chrome://flags/#enable-webmcp-testing` and relaunch Chrome.
2. Open `/webmcp` over HTTPS.
3. Inspect registered tools and their calls in DevTools → Application → WebMCP.
4. With the Adena extension set to `pearl-1` and funded with faucet WUGNOT, prepare a self-payment and open review.
5. Confirm the displayed address and 1,000 WUGNOT amount, approve the signature, and verify the resulting payment ID.
6. Test invalid wallet input, an expired prepared challenge, a mismatched Adena account and a canceled signature.

### Repository gates

```bash
npm test
npm run typecheck
npm run build
npm audit --audit-level=high
```

Live wallet acceptance requires a user-controlled Adena extension on Pearl and faucet WUGNOT. No private key is stored by the application.
