# Security policy

This repository is staging-safe by default. Do not enable a mainnet or fund-moving flag when reporting or reproducing a vulnerability.

Report vulnerabilities privately to the repository owner through GitHub Security Advisories. Include the affected route/package, prerequisites, proof of impact using mock or testnet assets, and a proposed embargo window. Do not include private keys, bearer tokens, prompts, uploaded private data or production database rows.

Supported security fixes target the current `main` release line. Operators must rotate any exposed secret, suspend affected agents/policies, preserve audit logs and follow the product runbook before restoring service. Mainnet unlock requires a separate security review and is not covered by the staging release.
