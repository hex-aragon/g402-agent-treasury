export default function Developers(){return <><div className="pageHead"><div className="eyebrow">Integration</div><h1>One HTTP round trip.</h1><p>A resource server returns 402; the client signs locally; g402 verifies and settles.</p></div><div className="grid twoCol"><div className="card feature"><h3>1. Declare payment terms</h3><pre className="code">{`{
  "scheme": "exact",
  "network": "gno:staging",
  "asset": "gno.land/r/gnoland/wugnot",
  "amount": "1000",
  "payTo": "g1…"
}`}</pre></div><div className="card feature"><h3>2. Verify and settle</h3><pre className="code">{`POST /api/v1/verify
Authorization: Bearer <server-key>

POST /api/v1/settle
Idempotency-Key: pay_…`}</pre></div><div className="card feature"><h3>Fail closed</h3><p>Settlement is disabled by default. Mainnet requires a second explicit production lock and supported chain transfers.</p></div><div className="card feature"><h3>Idempotent by design</h3><p>Payment identifiers are unique and persisted before any settlement result is served.</p></div></div></>}
