# Client setup

Use `https://www.proxyai.app/api/mcp` and Streamable HTTP. There is no separate SSE URL. A browser GET returning 405 is expected; authenticated MCP uses POST. Do not add a raw bearer token to committed configuration.

## Claude hosted

Add the URL through your account's custom connector settings, sign in to ProxyAI, review the account and return address, and Connect. Managed organizations can require owner/admin setup. Plan availability and UI labels can change. Follow [Claude's custom connector instructions](https://claude.com/docs/connectors/custom/add-unlisted).

The hosted identity `https://claude.ai/oauth/mcp-oauth-client-metadata` and callback `https://claude.ai/api/mcp/auth_callback` have been exercised. Initial connections may request only read. If writes return insufficient_scope, the client must initiate a fresh authorization requesting `scope=read write`, and the user must explicitly select Allow changes. Do not reuse an old authorization URL or edit its state, redirect_uri, client_id, resource or PKCE values. Use the client's documented scope controls; if none exist, keep read-only access and report the client/version through an issue. The observed test workaround used explicit scope selection in a fresh OAuth URL with user consent; it is not an automatic upgrade feature.

## Claude Code

```sh
claude mcp add --transport http --scope user proxyai https://www.proxyai.app/api/mcp
```

Run `/mcp` in an interactive Claude Code session to authenticate. Alternatively merge the server entry from `configs/claude-code.mcp.json` into your project `.mcp.json`; do not overwrite other configured servers. The command syntax was checked against installed client help and [official documentation](https://code.claude.com/docs/en/mcp). This command reference alone does not claim an end-to-end Claude Code rehearsal.

## Codex

```sh
codex mcp add proxyai --url https://www.proxyai.app/api/mcp
codex mcp login proxyai --scopes read
```

To enable a user-authorized write workflow:

```sh
codex mcp login proxyai --scopes read,write
```

Check Allow changes in the new consent flow. If add already initiated login, complete or cancel that flow before initiating another. Merge `configs/codex.toml` into your existing configuration as an alternative to add; do not replace unrelated settings. Command flags were checked against installed client help and [official MCP documentation](https://learn.chatgpt.com/docs/extend/mcp?surface=cli).

## Errors

- `insufficient_scope`: new read/write authorization and explicit consent are needed; retry alone cannot widen permission.
- `invalid_redirect_uri`: compare the exact callback with [provider policy](providers.md). New hosted providers need onboarding.
- `addon_required`: check the selected bot's Helpdesk or Agent Tasks features in ProxyAI.
- `unsupported_task`: use one of the three unchanged supported report recipes.
- `restricted_content`: inspect the source in the dashboard. Do not rephrase a secret to bypass filtering.
- Pending or unknown write result: inspect the ticket/run and activity before retrying.
