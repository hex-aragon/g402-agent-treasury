import{t as e}from"./framework~index~page~page~page~page~page~layout~page~page~page~page~app-page-cache-render~a~e7envese-BpfaLvtX.js";var t=e();function n(){return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(`div`,{className:`pageHead`,children:[(0,t.jsx)(`div`,{className:`eyebrow`,children:`Integration`}),(0,t.jsx)(`h1`,{children:`One HTTP round trip.`}),(0,t.jsx)(`p`,{children:`A resource server returns 402; the client signs locally; g402 verifies and settles.`})]}),(0,t.jsxs)(`div`,{className:`grid twoCol`,children:[(0,t.jsxs)(`div`,{className:`card feature`,children:[(0,t.jsx)(`h3`,{children:`1. Declare payment terms`}),(0,t.jsx)(`pre`,{className:`code`,children:`{
  "scheme": "exact",
  "network": "gno:staging",
  "asset": "gno.land/r/gnoland/wugnot",
  "amount": "1000",
  "payTo": "g1…"
}`})]}),(0,t.jsxs)(`div`,{className:`card feature`,children:[(0,t.jsx)(`h3`,{children:`2. Verify and settle`}),(0,t.jsx)(`pre`,{className:`code`,children:`POST /api/v1/verify
Authorization: Bearer <server-key>

POST /api/v1/settle
Idempotency-Key: pay_…`})]}),(0,t.jsxs)(`div`,{className:`card feature`,children:[(0,t.jsx)(`h3`,{children:`Fail closed`}),(0,t.jsx)(`p`,{children:`Settlement is disabled by default. Mainnet requires a second explicit production lock and supported chain transfers.`})]}),(0,t.jsxs)(`div`,{className:`card feature`,children:[(0,t.jsx)(`h3`,{children:`Idempotent by design`}),(0,t.jsx)(`p`,{children:`Payment identifiers are unique and persisted before any settlement result is served.`})]})]})]})}export{n as default};