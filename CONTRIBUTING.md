# Contributing

Use issues for client compatibility and provider onboarding. Include client/version, transport, public callback pattern, requested scope, error code and redacted steps. Never include credentials or customer data. A template is available for provider integrations.

For changes, run `npm run check` on Node.js 22 or newer. `npm run probe` performs public read-only network checks and is useful for diagnosing discovery. New examples should use OAuth and obtain user consent; do not add embedded tokens, broad auto-approval or automatic write/run examples.

This repo documents the hosted service. Service behavior and new provider callback policies require a separate ProxyAI service review/release. Keep integration.json, the tool tables and client snippets consistent. Changing the source under plugin/ also requires rebuilding and validating its ZIP before publication; do not silently change a previously submitted artifact.
