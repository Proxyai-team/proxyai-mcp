import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const json = async (path) => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const integration = await json('integration.json');
const endpoint = 'https://www.proxyai.app/api/mcp';
assert.equal(integration.endpoint, endpoint);
assert.equal(integration.transport, 'streamable-http');
assert.deepEqual(integration.authentication.scopes, ['read', 'write']);
assert.equal(integration.authentication.pkce, 'S256');
assert.equal(integration.tools.read.length, 8);
assert.equal(integration.tools.write.length, 11);
assert.equal(new Set([...integration.tools.read, ...integration.tools.write]).size, 19);

const claude = await json('configs/claude-code.mcp.json');
assert.deepEqual(claude.mcpServers.proxyai, { type: 'http', url: endpoint });
const portable = await json('configs/agent-plugin.mcp.json');
assert.deepEqual(portable.mcpServers.proxyai, { type: 'streamable-http', url: endpoint });
assert.deepEqual(await json('plugin/mcp.json'), portable);
assert.match(await readFile(new URL('configs/codex.toml', root), 'utf8'),
  /\[mcp_servers\.proxyai\]\nurl = "https:\/\/www\.proxyai\.app\/api\/mcp"/);

const manifest = await json('plugin/plugin.json');
assert.equal(manifest.name, 'proxyai');
assert.equal(manifest.version, integration.version);
const review = manifest.extensions['com.openai'].review;
assert.equal(new URL(review.demo_recording_url).protocol, 'https:');
assert.equal(review.test_cases.positive.length, 5);
assert.equal(review.test_cases.negative.length, 3);
for (const [path, expected] of Object.entries(await json('checksums.json'))) {
  const digest = createHash('sha256').update(await readFile(new URL(path, root))).digest('hex');
  assert.equal(digest, expected, `${path} checksum mismatch`);
}
for (const path of ['README.md', 'SECURITY.md', 'CONTRIBUTING.md', 'docs/clients.md',
  'docs/providers.md', 'docs/validation.md']) {
  const text = await readFile(new URL(path, root), 'utf8');
  for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
    const target = match[1];
    if (/^[a-z]+:|^#/i.test(target)) continue;
    await access(new URL(target.split('#')[0], new URL(path, root)));
  }
}
console.log('PASS: client configs, OAuth summary, 19-tool catalog, plugin metadata, checksums and local doc links.');
