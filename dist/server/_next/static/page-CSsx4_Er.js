import{t as e}from"./framework~index~page~page~page~layout~page~page~page~page~app-page-cache-render~app-page-ca~jprfbz99-BpfaLvtX.js";var t=e(),n=[{name:`Base Sepolia`,detail:`EIP-6963/EIP-1193 · USDC · EIP-3009/EIP-712`,status:`SDK-ready`,tone:`ready`},{name:`Solana Devnet`,detail:`Wallet Standard · USDC · v0 transaction`,status:`SDK-ready`,tone:`ready`},{name:`Gno Pearl`,detail:`Adena · WUGNOT · native v1`,status:`Native adapter`,tone:`ready`},{name:`Ethereum mainnet`,detail:`Dual gates · recipient · production facilitator`,status:`Locked`,tone:`pending`},{name:`Solana mainnet`,detail:`Dual gates · recipient ATA · RPC · facilitator`,status:`Locked`,tone:`pending`}];function r(){return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(`div`,{className:`pageHead`,children:[(0,t.jsx)(`div`,{className:`eyebrow`,children:`x402 v2 + native Gno v1`}),(0,t.jsx)(`h1`,{children:`Chain-neutral facilitator API`}),(0,t.jsx)(`p`,{children:`EVM과 Solana는 같은 v2 challenge/review/verify/settle 계약을 사용합니다. 공식 x402 package는 protocol type, facilitator client, EVM definition과 SVM Exact payload 생성에 사용하며, EVM 지갑 서명은 viem/EIP-1193으로 조립합니다. Gno Pearl은 native v1 경로를 유지합니다.`})]}),(0,t.jsxs)(`div`,{className:`grid twoCol`,children:[(0,t.jsxs)(`div`,{className:`card feature`,children:[(0,t.jsx)(`h3`,{children:`1. Discover rails`}),(0,t.jsx)(`pre`,{className:`code`,children:`GET /api/v2/rails`}),(0,t.jsx)(`p`,{className:`mutedText`,children:`다섯 rail의 network, asset, amount, recipient, wallet, status와 독립된 mainnet readiness를 반환합니다. facilitator secret은 노출하지 않고 origin만 반환합니다.`})]}),(0,t.jsxs)(`div`,{className:`card feature`,children:[(0,t.jsx)(`h3`,{children:`2. Issue wallet-bound terms`}),(0,t.jsx)(`pre`,{className:`code`,children:`POST /api/v2/challenges
Content-Type: application/json

{
  "railId": "evm-base-sepolia",
  "walletAddress": "0x...",
  "resourceId": "weather"
}`}),(0,t.jsx)(`p`,{className:`mutedText`,children:`서버가 challengeId, paymentId와 EVM nonce를 발급합니다. 클라이언트는 이를 새로 만들지 않고 그대로 반환해야 합니다. 201 응답은 structured paymentRequired와 Payment-Required header를 포함하며, Solana에는 공식 SVM Exact client로 만든 unsigned payload도 포함됩니다.`})]}),(0,t.jsxs)(`div`,{className:`card feature`,children:[(0,t.jsx)(`h3`,{children:`3. Revalidate before signing`}),(0,t.jsx)(`pre`,{className:`code`,children:`POST /api/v2/review
Content-Type: application/json

{
  "challengeId": "...",
  "walletAddress": "...",
  "paymentRequired": { "...": "issued terms" },
  "unsignedPaymentPayload": { "...": "Solana only" }
}`}),(0,t.jsx)(`p`,{className:`mutedText`,children:`저장된 payer, resource, requirements와 기존 Solana message hash를 먼저 확인합니다. Solana는 같은 challenge/payment ID를 유지하면서 최신 blockhash로 payload를 다시 만들고 hash를 원자적으로 교체합니다. 지갑은 review 응답의 refreshed payload만 서명합니다.`})]}),(0,t.jsxs)(`div`,{className:`card feature`,children:[(0,t.jsx)(`h3`,{children:`4. Verify and settle`}),(0,t.jsx)(`pre`,{className:`code`,children:`POST /api/v2/verify
POST /api/v2/settle
Content-Type: application/json

{
  "challengeId": "...",
  "paymentId": "pay_...",
  "paymentPayload": { "...": "wallet-signed x402 v2 payload" }
}`}),(0,t.jsx)(`p`,{className:`mutedText`,children:`settle은 서버 발급 payment ID를 원자적으로 선점합니다. transaction hash가 있는 pending의 동일 retry는 facilitator를 다시 호출하지 않고 finalized chain data를 검증합니다. hash 없는 unknown outcome은 중복 결제를 피하기 위해 manual pending으로 남습니다.`})]}),(0,t.jsxs)(`div`,{className:`card feature`,children:[(0,t.jsx)(`h3`,{children:`5. Retry the paid resource`}),(0,t.jsx)(`pre`,{className:`code`,children:`GET /api/demo/multichain-paid-data
X-Payment-Id: pay_...

GET /api/v2/payments?paymentId=pay_...`}),(0,t.jsx)(`p`,{className:`mutedText`,children:`첫 GET은 402 discovery 응답입니다. 완전한 EVM/Solana Payment-Required는 payer가 필요한 challenge preflight에서 발급됩니다. 정확한 settled facilitator record만 리소스를 엽니다.`})]}),(0,t.jsxs)(`div`,{className:`card feature`,children:[(0,t.jsx)(`h3`,{children:`Gno Pearl native API`}),(0,t.jsx)(`pre`,{className:`code`,children:`POST /api/v1/challenges
POST /api/v1/verify
POST /api/v1/settle
GET  /api/v1/payments?paymentId=...
GET  /api/v1/scan?q=...`}),(0,t.jsx)(`p`,{className:`mutedText`,children:`Adena가 TM2 transaction을 서명하고 서버가 signer, WUGNOT transfer, memo, nonce, expiry와 resource binding을 검증합니다. g402pay realm은 아직 chain에 배포되지 않았습니다.`})]})]}),(0,t.jsxs)(`div`,{className:`card feature`,style:{marginTop:14},children:[(0,t.jsx)(`h3`,{children:`Rail status`}),n.map(e=>(0,t.jsxs)(`div`,{className:`statusLine`,children:[(0,t.jsxs)(`span`,{children:[e.name,` · `,e.detail]}),(0,t.jsx)(`b`,{className:e.tone===`pending`?`pending`:void 0,children:e.status})]},e.name)),(0,t.jsx)(`p`,{className:`mutedText`,style:{marginTop:14},children:`SDK-ready는 official package compatibility와 deterministic mock 검증 상태를 뜻합니다. EVM/Solana real-wallet settlement는 아직 release acceptance 항목입니다. Known pending transaction만 RPC로 독립 reconciliation할 수 있으며, Mainnet은 두 개의 gate와 운영 설정 없이는 challenge 발급 단계에서 거부됩니다.`})]}),(0,t.jsxs)(`div`,{className:`card feature`,style:{marginTop:14},children:[(0,t.jsx)(`h3`,{children:`WebMCP surface`}),(0,t.jsx)(`p`,{children:`최상위 페이지는 rail discovery, testnet preparation, Gno health/search, Pearl preparation, human review navigation, receipt lookup을 위한 일곱 개 tool을 등록합니다. Agent는 mainnet을 켜거나 wallet을 대신 서명할 수 없습니다.`})]})]})}export{r as default};