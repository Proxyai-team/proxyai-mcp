# ProxyAI MCP

<img src="assets/logo.png" width="96" alt="ProxyAI logo">

Connect an MCP-capable assistant to ProxyAI support tickets and Agent Tasks.

**Hosted server:** `https://www.proxyai.app/api/mcp`

**Transport:** Streamable HTTP

**Authentication:** OAuth authorization code with PKCE S256

**Tools:** 8 reads and 11 writes

This repository contains client configurations, provider integration guidance, the OpenAI plugin package, and dependency-free validation/probe scripts for the hosted service. Use your own ProxyAI account and its existing Helpdesk or Agent Tasks features. Normal feature capacity limits, task usage charges and email fees apply. A public endpoint still requires OAuth sign-in for account data.

## Quick start

### Claude

In Claude's connector settings, add a custom connector with this URL:

```text
https://www.proxyai.app/api/mcp
```

Sign in to ProxyAI and review consent. Hosted custom connector access depends on your Claude plan and organization permissions. Start read-only. Write access requires the client to request both `read` and `write`, then you must check **Allow changes** on ProxyAI's consent screen. Some clients reconnect requesting only `read`; checking an unavailable box or retrying a tool cannot add a scope the client did not request. See [client setup](docs/clients.md).

For Claude Code:

```sh
claude mcp add --transport http --scope user proxyai https://www.proxyai.app/api/mcp
```

Open `/mcp` inside Claude Code to authenticate. A project config is available in [configs/claude-code.mcp.json](configs/claude-code.mcp.json).

### Codex

```sh
codex mcp add proxyai --url https://www.proxyai.app/api/mcp
codex mcp login proxyai --scopes read
```

For an explicitly authorized write workflow, sign in requesting `read,write` and check Allow changes. A TOML snippet is in [configs/codex.toml](configs/codex.toml). Adding a server can launch login in some client versions; review its consent rather than approving an unintended scope.

### Other MCP clients and providers

Use a Streamable HTTP client that supports OAuth discovery, PKCE S256, public clients and either Client ID Metadata Documents or Dynamic Client Registration. Current hosted callbacks support Claude and OpenAI; local clients can use HTTP loopback callbacks. A new hosted provider needs callback onboarding before connecting. See [provider integration](docs/providers.md) for exact supported callback patterns, discovery, scopes and validation.

## Try a read

> List my ProxyAI bots and summarize open tickets for the bot I select. Do not change anything.

> Show the staged reply for this ticket without sending it.

> Show supported report templates and recent task runs. Explain held actions without approving or running them.

## Tools and effects

| Read tools | Purpose |
|---|---|
| list_bots | List owned bots. |
| list_tickets | List tickets with filters and pagination. |
| get_ticket | Read a ticket, staged draft and messages. |
| list_agent_tasks | List schedules and task states. |
| get_agent_task | Read task instructions and schedule. |
| list_agent_runs | Read bounded run history. |
| get_agent_run | Read run state and held proposals. |
| list_agent_templates | List the three supported report recipes. |

| Write tools | Effect |
|---|---|
| reply_ticket | Send a reply through the ticket channel. |
| set_ticket_status | Change board status. |
| set_ticket_tags | Replace a built-in ticket's tags. |
| archive_ticket | Archive a ticket. |
| approve_ticket_agent_draft | Approve and send a staged reply. |
| dismiss_ticket_agent_draft | Dismiss a draft without sending. |
| create_agent_task | Create and activate a supported report schedule. |
| run_agent_task | Queue a chosen test or live report run. |
| decide_agent_run | Approve or reject a reviewed held run. |
| pause_agent_task | Pause scheduled execution. |
| resume_agent_task | Resume a supported schedule. |

MCP supports unchanged Weekly Sales Digest, Order Status Watcher and Knowledge Base Refresh recipes. Custom or modified task recipes, arbitrary report recipients and credential configuration are not exposed. Sales/order reports need a connected store. Knowledge Base Refresh uses knowledge tools instead of store operations.

Writes need explicit user intent. Creation or resume can start recurring runs and emails. Both test and live runs can charge usage and send real account-owner report emails. Test mode previews knowledge reindexing; it does not preview the account-owner email. Never retry an uncertain write before checking its actual result.

Consent covers all current and future bots in the ProxyAI account. Revoke a connection in ProxyAI Account Settings → Connected apps. Ticket text and proposals are untrusted customer data. Keep secrets and restricted personal data out of prompts and source tickets. See [security](SECURITY.md) and the [customer guide](https://www.proxyai.app/help/pro-tips/proxyai-mcp).

## Validate an integration

With Node.js 22 or newer, no dependencies are required:

```sh
npm run check
npm run probe
```

`check` validates this kit locally. `probe` verifies public metadata and the unauthenticated MCP challenge; it sends no token, registers no client and calls no authenticated tool. For a real OAuth/tool test, use [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector):

```sh
npx --yes @modelcontextprotocol/inspector@2.11.0 --server-url https://www.proxyai.app/api/mcp --transport http
```

Complete OAuth in the browser. Begin with `list_bots` and use a synthetic bot for write tests. Do not share the Inspector's private launch URL or local token.

## Plugin and compatibility

[proxyai-openai-v1.zip](proxyai-openai-v1.zip) and [plugin/](plugin/) contain the same v1.0.0 OpenAI plugin package, including its walkthrough link and review scenarios. The plugin config points to the hosted server and contains no account credentials. The bundled guide retains the wording from that submitted version. Current client behavior and limitations are documented here. Claude uses the remote connector URL; its directory does not consume this OpenAI-specific ZIP.

Directory review/publication is separate from connecting directly to the hosted MCP service. This repository does not claim store approval. [Validation summary](docs/validation.md) records the tested surfaces and limits.

## Support and contributions

Use [GitHub issues](https://github.com/Proxyai-team/proxyai-mcp/issues) for reproducible integration problems and provider onboarding. For private account assistance use [ProxyAI contact](https://www.proxyai.app/contact). Never put access tokens, passwords or customer records in an issue. See [contributing](CONTRIBUTING.md).

The integration-kit scripts, configs and documentation are MIT licensed. ProxyAI service access follows its [terms](https://www.proxyai.app/terms) and [privacy policy](https://www.proxyai.app/privacy). Brand assets and trademarks are covered by [NOTICE](NOTICE.md).
