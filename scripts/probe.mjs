import assert from 'node:assert/strict';

const origin = 'https://www.proxyai.app';
const endpoint = `${origin}/api/mcp`;
async function request(url, options = {}) {
  return fetch(url, { ...options, redirect: 'error', signal: AbortSignal.timeout(15000) });
}
async function metadata(path) {
  const response = await request(`${origin}${path}`);
  assert.equal(response.status, 200, `${path}: expected 200`);
  return response.json();
}

try {
  const resource = await metadata('/.well-known/oauth-protected-resource');
  assert.equal(resource.resource, endpoint);
  assert.ok(resource.authorization_servers.includes(origin));
  assert.ok(resource.scopes_supported.includes('read'));
  assert.ok(resource.scopes_supported.includes('write'));
  const auth = await metadata('/.well-known/oauth-authorization-server');
  assert.equal(auth.issuer, origin);
  assert.ok(auth.code_challenge_methods_supported.includes('S256'));
  assert.ok(auth.token_endpoint_auth_methods_supported.includes('none'));
  assert.ok(auth.grant_types_supported.includes('authorization_code'));
  assert.ok(auth.grant_types_supported.includes('refresh_token'));
  assert.equal(new URL(auth.registration_endpoint).origin, origin);

  const response = await request(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {
      protocolVersion: '2025-11-25', capabilities: {},
      clientInfo: { name: 'proxyai-public-metadata-probe', version: '1.0.0' },
    } }),
  });
  assert.equal(response.status, 401, 'Unauthenticated initialize must require OAuth');
  assert.ok(response.headers.get('www-authenticate')?.includes(
    `resource_metadata="${origin}/.well-known/oauth-protected-resource"`));
  assert.equal((await request(endpoint)).status, 405, 'Browser GET is not the MCP transport');
  console.log('PASS: public OAuth discovery, PKCE/public-client metadata, MCP 401 challenge and GET 405.');
  console.log('No client registration, token exchange, authenticated tool call or task run performed.');
} catch (error) {
  console.error(`FAIL: ${error.message}`);
  process.exitCode = 1;
}
