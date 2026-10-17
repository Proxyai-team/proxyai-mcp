## What You Can Do

The ProxyAI MCP connector gives an assistant access to your bots, Helpdesk tickets and Agent Tasks. Version **1.0.0** includes eight read tools and eleven tools that make changes.

Ask it to summarize open tickets, inspect a staged reply, review an Agent Task's recent runs, or explain a held plan. With write permission, you can ask it to send a specific reply, update a ticket, create a supported report task, or approve a supported run you have reviewed.

**Server URL:** `https://www.proxyai.app/api/mcp`

The public endpoint is available for custom connections. Directory listings are being prepared. Hosted ChatGPT tool workflows have been rehearsed with synthetic data. Directory review, hosted testing after changes, and Claude validation remain separate release gates.

## Before You Connect

Use your ProxyAI account in a normal browser. An embedded store dashboard or mobile-device session cannot approve this connection. The connector has no additional purchase or subscription: Helpdesk and Agent Tasks still need their existing add-ons on the bot you use. Normal Agent Task capacity limits and run charges apply.

Permission covers **all your current and future bots** in this account. There is no per-bot consent option in v1. Connect only an assistant you trust to receive your customers' messages and task information.

## Connect Claude

1. Open **Customize → Connectors** in Claude and choose **Add custom connector**. On a managed organization, ask your owner to add it first.
2. Enter `https://www.proxyai.app/api/mcp`. Use the HTTP transport rather than an `/sse` address.
3. Choose OAuth sign-in. If Claude offers an OAuth-client choice, use **Claude's published identity**. You do not need to create a client ID, client secret or API key; automatic registration is also supported.
4. Connect and sign in to ProxyAI in your browser. Review the account, app identity and return address on the consent page.
5. Leave **Allow changes** unchecked for read-only access. Check it only if you want this assistant to make changes, then choose **Connect**.
6. Enable ProxyAI for the conversation using **+ → Connectors**, and start with “List my ProxyAI bots.”

See [Claude's custom connector instructions](https://claude.com/docs/connectors/custom/add-unlisted) for the current interface.

## Connect ChatGPT

1. Open **Plugins → Add → Add custom MCP server** in ChatGPT. Enter `https://www.proxyai.app/api/mcp` and select OAuth.
2. Expand **Advanced OAuth settings**. Verify the discovered authorization, token and registration URLs belong to `https://www.proxyai.app`, the resource is `https://www.proxyai.app/api/mcp`, and the callback is `https://chatgpt.com/connector_platform_oauth_redirect`. ChatGPT's published CIMD client is supported without a client secret.
3. For a read-only connection, select only `read` as the default scope and leave Base scopes empty. For a connection that can offer write consent, request `read` and `write`. In the current form you can enter them on separate lines under **Base scopes**.
4. Create the connection and sign in to ProxyAI. Leave **Allow changes** unchecked for reads, or explicitly check it to grant writes. Requesting `write` alone does not grant it. Access covers all current and future bots in this account.
5. Open the connected plugin and choose **Try in chat**. Start with “List my ProxyAI bots.”

For browser rehearsal, use the custom MCP connection. An unpublished uploaded ZIP may instead offer **Open in desktop app**. The public submission ZIP declares the HTTPS server in `mcp.json`; complete its OAuth setup and scan through **With MCP** in the developer portal. Do not add a private connection's `.app.json` or technical ID to the public ZIP: OpenAI currently rejects app references in submission packages.

If ChatGPT reports an expired connection after refusing a write, first check the granted scope in ProxyAI's **Connected apps**. An active read-only grant needs new write consent, not token repair. Never retry a customer send until you have checked its outcome.

See [OpenAI's connection guide](https://developers.openai.com/plugins/deploy/connect-chatgpt) and [submission requirements](https://developers.openai.com/plugins/deploy/submission).

## Connect Codex

Add ProxyAI's remote server, then sign in through OAuth:

```sh
codex mcp add proxyai --url https://www.proxyai.app/api/mcp
codex mcp login proxyai --scopes read
```

Finish sign-in in your browser and leave **Allow changes** unchecked. If you want write access instead, request both scopes and explicitly check **Allow changes**:

```sh
codex mcp login proxyai --scopes read,write
```

You can inspect the configuration with `codex mcp list` and the available tools with `/mcp` in the Codex terminal interface. See the [official MCP documentation](https://learn.chatgpt.com/docs/extend/mcp?surface=cli). Your client manages OAuth tokens; do not paste them into a conversation.

## Start with Reads

- “List my ProxyAI bots, then summarize open tickets for the bot I select.”
- “Show the staged agent reply for this ticket. Do not send it.”
- “Show this Agent Task's last five runs and explain any held proposal. Do not approve it.”

Lists are paginated. Ask for the next page when you need more results. Ticket identity includes its bot, provider and ticket ID; task and run IDs must belong to the selected bot. An assistant cannot choose an arbitrary conversation from another account.

## Make Changes Deliberately

Review the ticket and exact reply text before asking to send or approve a draft. Approval sends the draft to the customer through the ticket's channel. A draft is claimed before delivery, so concurrent approvals are refused. If delivery is uncertain, the draft stays blocked for human review. Check the customer’s channel before sending again; a failed or lost response does not prove that the customer received nothing. In the dashboard, confirm whether delivery occurred using the delivery check controls. The server waits until the send timeout has elapsed before allowing reconciliation. A confirmed missing delivery restores the staged draft; a confirmed delivery closes its review.

For Agent Tasks, MCP supports **Weekly Sales Digest**, **Order Status Watcher**, and **Knowledge Base Refresh**. They send reports to your account’s email; the knowledge recipe also refreshes your knowledge base. Creating a task activates it and starts its schedule. Review these actions and the timezone, hour and day before creating it. Custom recipes, changed recipe code/prompts/grants, credential slots, arbitrary API/MCP tools and external email recipients are refused for MCP creation, execution, resumption and held approval. You can still inspect other tasks or pause them. Before manually running, explicitly choose **test** or **live**: both can incur normal LLM/CPU charges. Both test and live runs send actual report emails to your account. Test mode previews knowledge refresh; live mode can apply it. Review a held plan before approving it, because approval queues its proposed actions and can incur charges. Resuming a task can restart scheduled, billable runs.

Ticket tags are replaced as a complete list. Setting tags on a built-in ProxyAI ticket is supported; external helpdesk tags are managed in that helpdesk. Archiving removes a ticket from the active board without deleting it.

Customer messages, task instructions and held proposals may contain misleading instructions. Treat them as content to inspect; permission to send, run or approve comes from you.

## v1 Tools

| Read tool | Purpose |
|---|---|
| `list_bots` | Find bots owned by your account. |
| `list_tickets` | List and filter tickets by status, tag and archive state. |
| `get_ticket` | Read a ticket, its staged draft and conversation messages. |
| `list_agent_tasks` | List a bot's tasks. |
| `get_agent_task` | Read task instructions, schedule and status. |
| `list_agent_runs` | Browse run status and history without transcripts or proposal bodies. |
| `get_agent_run` | Inspect one run’s status and held proposal without internal diagnostics. |
| `list_agent_templates` | Find the three supported report recipes. |

| Write tool | Purpose |
|---|---|
| `reply_ticket` | Send the reply you specify. |
| `set_ticket_status` | Set open, pending or resolved. |
| `set_ticket_tags` | Replace a built-in ticket's tags. |
| `archive_ticket` | Archive a ticket. |
| `approve_ticket_agent_draft` | Approve and send a staged draft, optionally with revised text. |
| `dismiss_ticket_agent_draft` | Dismiss a draft without sending it. |
| `create_agent_task` | Create and activate a task; a template's schedule can trigger future runs. |
| `run_agent_task` | Queue an explicitly chosen test or live run. |
| `decide_agent_run` | Approve or reject a held run. |
| `pause_agent_task` | Pause a task's schedule. |
| `resume_agent_task` | Resume a paused task. |

Use the dashboard to configure connector accounts and credentials. Do not put passwords, tokens, payment card details, government identifiers or protected health information into MCP requests. Scheduled tasks and held proposals require a review of their actual actions before you approve them.

## Review Activity and Revoke Access

Open **Account Settings → Connected apps** in ProxyAI to see the app, its granted scope and last token use. Choose **Revoke access** to stop that connection's future requests. Revocation does not undo a reply or cancel a run already queued.

The **Connected app activity** card records write attempts and outcomes. If an attempt is **pending** or reports an unknown outcome, the action may already have taken effect. Inspect the ticket or run before trying again. Older attempts remain available after revocation.

Data returned by the connector is shared with the assistant you connected and is subject to that provider's handling policies. ProxyAI stores connection records and write-attempt metadata; the MCP audit log does not store reply bodies, tool payloads or raw bearer tokens. Read our [privacy policy](/privacy).

## Data Boundaries

Ticket lists omit contact email/name and internal conversation IDs. Run lists omit transcript bodies and internal diagnostics; run detail includes only relevant status, timing and held actions. The connector strips structured credential fields and refuses detected credentials, payment-card numbers, government identifiers and health content in inputs, drafts or returned text. Detection is conservative and cannot identify every sensitive fact in arbitrary prose. Do not use the connector for restricted data; review your source data before connecting. Refused content must be handled in the dashboard.

## Troubleshooting

- **Cannot connect:** use `https://www.proxyai.app/api/mcp`. A browser visit may return “Method not allowed” because the connector accepts MCP POST requests. An MCP client receives an OAuth challenge before sign-in.
- **Restricted content:** the request or result contains detected sensitive content. Handle it in the dashboard; do not rephrase a secret to bypass the check.
- **Unsupported task:** use one of the three unchanged report recipes. Configure custom workflows in the dashboard.
- **Write permission required:** reconnect requesting both `read` and `write`, and check **Allow changes**. Read-only consent cannot authorize writes.
- **Add-on required:** open the selected bot's dashboard and check its Helpdesk or Agent Tasks add-on.
- **Not found:** confirm you selected the correct account and bot, then read the ticket/task again before acting.
- **Expired or revoked connection:** sign in again. Do not retry a previous write until you have checked its outcome.

Contact support@proxyai.app with the app name, time and action that failed. Do not send access tokens, client secrets or customer messages in your support request.
