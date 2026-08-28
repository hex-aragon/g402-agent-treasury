# Filecoin/IPFS gateway runbook

Start with FILECOIN_MOCK=true, Calibration, and all pay/mainnet flags false. Apply migrations and test raw upload, search and retrieval. Configure IPFS API and gateway independently from the Filecoin Pay adapter so an IPFS outage cannot move funds.

For CID mismatch, disable uploads immediately and preserve both byte digests and provider response. For pending commitments, keep retrieval policy explicit: uploaded content is not durable until active proof state. The receipt worker retries pending adapter states and marks rejected commitments degraded.

For payment-channel incidents, disable FILECOIN_ENABLE_PAYCH, revoke the Lotus token and inspect channel funds/lanes. Never log the Lotus token or client plaintext. For overdue retention, mark expired before unpin/repair; deletion is an explicit future policy, not automatic here.

Mainnet promotion requires a live Calibration Filecoin Pin/Synapse sidecar contract test, funded test USDFC/FIL wallet, proof reconciliation over multiple periods, payment rail caps, restore test, large-upload architecture and two-person approval for FILECOIN_ALLOW_MAINNET.

Alert on CID mismatch (immediate), commitment failure, proof degradation, receipt backlog over 15 minutes, retrieval integrity failure, Lotus error rate above 1%, and objects active beyond configured expiry.
