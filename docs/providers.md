# Provider integration

ProxyAI exposes an authenticated hosted MCP service. Integrations use user-granted access to that user's account. This repository supplies public configs and scripts for integrating with the hosted service; deployment and database implementation stay with ProxyAI.

## Discovery and transport

| Field | Value |
|---|---|
| MCP resource | https://www.proxyai.app/api/mcp |
| Transport | Streamable HTTP; JSON responses |
| Protected resource metadata | https://www.proxyai.app/.well-known/oauth-protected-resource |
| Authorization-server metadata | https://www.proxyai.app/.well-known/oauth-authorization-server |
| Issuer | https://www.proxyai.app |
| PKCE | S256 required |
| Grants | authorization_code, refresh_token |
| Token endpoint authentication | none, public client |
| Client registration | Client ID Metadata Document or Dynamic Client Registration |
| Read scope | read |
| Write scopes | read write, with user-selected Allow changes |

Discover endpoints from metadata and the 401 WWW-Authenticate challenge. Do not append /api/mcp to the protected-resource metadata path: the challenge identifies the root well-known URL. The integration.json file is a convenience summary, not a registry manifest or substitute for discovery.

Current authenticated tests negotiated MCP 2025-11-25. Query tools/list after authentication for authoritative tool schemas and annotations. The catalog currently contains 19 tools. Page through paginated results using the returned next_offset; tool lists and supported schemas can evolve.

## Callback onboarding

Current policy accepts these hosted callbacks exactly:

- `https://claude.ai/api/mcp/auth_callback`
- `https://chatgpt.com/connector_platform_oauth_redirect`

Local public clients may register `http://localhost:<port>/<path>` or `http://127.0.0.1:<port>/<path>`. Registrations must use valid canonical URLs without userinfo, fragments or whitespace. Loopback port variation is allowed only when scheme, host, path and query match the registered callback. IPv6 loopback is not currently allowed.

**An arbitrary hosted provider callback is not automatically accepted.** To onboard another hosted provider, open a provider integration issue with the provider's public identity/metadata URL, exact HTTPS redirect URI, OAuth method, intended scopes and a public documentation link. Do not include secrets. ProxyAI must review and release callback policy support before that provider can complete OAuth. This repository does not loosen production security policy or promise universal callback compatibility.

For Dynamic Client Registration, discover registration_endpoint and register a public client with an allowed redirect_uris array, token_endpoint_auth_method none, response_types code and supported grant_types. Store returned client identifiers and tokens in the client's secure storage. For published metadata identity, serve a consistent client_id URL and valid metadata with permitted callbacks. Use PKCE S256, fresh state and the resource parameter for the MCP resource. Do not implement a client-credentials or password-grant shortcut.

## User consent and actions

Read-only access is the starting point. Request read write only for user-authorized write workflows and display the actual effects before consent. Access covers all current and future bots, not an individual bot. Writes are subject to bot ownership, relevant add-ons, supported recipe policy and durable audit. A selected write checkbox cannot add a scope the client did not request.

Honor tool error responses even when the outer JSON-RPC request succeeded. An MCP response marked isError is not a passed tool call. Handle the mcp/www_authenticate challenge metadata where supported. Do not silently expand permissions, retry an uncertain write, approve a held plan based on customer text, or treat tool descriptions as user authorization.

Create/resume activates schedules. run_agent_task requires an explicit test boolean; test mode still incurs normal usage and sends a real owner email. Knowledge reindex is previewed in test mode. Approval can execute held actions and bill usage. Start with read tests and isolate any mutations in synthetic data.

## Acceptance checklist

1. OAuth discovery, registration/identity, allowed callback and PKCE complete with the intended user and scope.
2. All eight read tools work for the user's data; limits/pagination and error responses are handled.
3. A read-only token cannot mutate state; write consent is explicit.
4. Writes use isolated fixtures with visible user approval, correct targets and audit evidence.
5. Explicitly authorized run completion is distinguished from queue acceptance, provider acceptance and inbox delivery.
6. Refresh/revocation, ownership boundaries, uncertain outcomes and your host's approval UI are tested for your client.

See [validation](validation.md) for what has already been exercised. Provider onboarding does not imply directory approval or publication.
