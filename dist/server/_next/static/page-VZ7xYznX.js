import{t as e}from"./framework~index~page~page~page~layout~page~page~app-page-cache-render~app-page-cache~app-ro~k5bcuqg2-BpfaLvtX.js";var t=e();function n(){return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(`div`,{className:`pageHead`,children:[(0,t.jsx)(`div`,{className:`eyebrow`,children:`x402 v2 integration`}),(0,t.jsx)(`h1`,{children:`Facilitator API`}),(0,t.jsx)(`p`,{children:`challenge는 서버에서 발급·저장되며, verify와 settle은 동일한 조건만 허용합니다.`})]}),(0,t.jsxs)(`div`,{className:`grid twoCol`,children:[(0,t.jsxs)(`div`,{className:`card feature`,children:[(0,t.jsx)(`h3`,{children:`1. Issue terms`}),(0,t.jsx)(`pre`,{className:`code`,children:`POST /api/v1/challenges
Content-Type: application/json

{
  "resource": "https://api.example.com/weather",
  "method": "GET",
  "amount": "1000",
  "payTo": "g1..."
}`}),(0,t.jsx)(`p`,{className:`mutedText`,children:"`payTo` is accepted only while self-test mode is enabled. Merchant mode uses the server-configured address."})]}),(0,t.jsxs)(`div`,{className:`card feature`,children:[(0,t.jsx)(`h3`,{children:`2. Verify and settle`}),(0,t.jsx)(`pre`,{className:`code`,children:`POST /api/v1/verify
POST /api/v1/settle
Content-Type: application/json

{
  "paymentPayload": { "...": "Adena signed Tx" },
  "paymentRequirements": { "...": "issued terms" }
}`})]}),(0,t.jsxs)(`div`,{className:`card feature`,children:[(0,t.jsx)(`h3`,{children:`3. Read the canonical scan`}),(0,t.jsx)(`pre`,{className:`code`,children:`GET /api/v1/scan?q=<tx|payment|address|height>
GET /api/v1/payments?limit=50
GET /api/health`})]}),(0,t.jsxs)(`div`,{className:`card feature`,children:[(0,t.jsx)(`h3`,{children:`Security model`}),(0,t.jsx)(`p`,{children:`D1 원자적 nonce 선점, payment ID idempotency, resource hash, exact asset rail, TM2 서명 검증, RPC chain ID pinning과 reorg rollback을 적용합니다.`})]})]}),(0,t.jsxs)(`div`,{className:`card feature`,style:{marginTop:14},children:[(0,t.jsx)(`h3`,{children:`Current deployment`}),(0,t.jsxs)(`div`,{className:`statusLine`,children:[(0,t.jsx)(`span`,{children:`Network`}),(0,t.jsx)(`b`,{children:`gno:pearl-1`})]}),(0,t.jsxs)(`div`,{className:`statusLine`,children:[(0,t.jsx)(`span`,{children:`Payment rail`}),(0,t.jsx)(`b`,{children:`WUGNOT direct transfer`})]}),(0,t.jsxs)(`div`,{className:`statusLine`,children:[(0,t.jsx)(`span`,{children:`Mainnet`}),(0,t.jsx)(`b`,{className:`pending`,children:`Locked`})]}),(0,t.jsxs)(`div`,{className:`statusLine`,children:[(0,t.jsx)(`span`,{children:`Contract realm mode`}),(0,t.jsx)(`b`,{children:`Available after g402pay deployment`})]})]})]})}export{n as default};