'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');

const root = path.resolve(__dirname, '..');
const helperPath = path.join(root, 'src/vendor/brightdesk-common-libs/json-storage.js');
const provenancePath = path.join(root, 'src/vendor/brightdesk-common-libs/UPSTREAM.json');
const expectedGitBlobSha = 'c32eed522d283bcf24aeda25729c79f655b37497';
const loadStorage = () => require(helperPath);

test('vendored JSON storage file matches the pinned Common-Libs Git blob', () => {
  const source = fs.readFileSync(helperPath);
  const header = Buffer.from('blob ' + source.length + '\0');
  const actual = createHash('sha1').update(Buffer.concat([header, source])).digest('hex');
  assert.equal(actual, expectedGitBlobSha);
});

test('vendored provenance records the exact upstream Common-Libs revision', () => {
  const upstream = JSON.parse(fs.readFileSync(provenancePath, 'utf8'));
  assert.deepEqual(upstream, {
    repository: 'conz20/Brightdesk-Common-Libs',
    commit: '5adecbc4d1e4236a1587bd295addeb706f1aab86',
    sourcePath: 'src/browser/json-storage.js',
    apiVersion: '0.1',
    gitBlobSha: expectedGitBlobSha
  });
});

test('local renderer loads the vendored helper before app.js', () => {
  const html = fs.readFileSync(path.join(root, 'src/index.html'), 'utf8');
  const vendorTag = '<script src="vendor/brightdesk-common-libs/json-storage.js"></script>';
  const vendorIndex = html.indexOf(vendorTag);
  const appIndex = html.indexOf('<script src="app.js"></script>');
  assert.ok(vendorIndex >= 0, 'vendored helper script must be present');
  assert.ok(appIndex > vendorIndex, 'helper must load before app.js');
  assert.doesNotMatch(vendorTag, /https?:\/\//, 'helper must be loaded locally');
});

test('renderer uses the shared adapter without changing established storage keys', () => {
  const app = fs.readFileSync(path.join(root, 'src/app.js'), 'utf8');
  assert.match(app, /commonJsonStorage\.cloneJsonValue/);
  assert.match(app, /commonJsonStorage\.readJsonValue\(localStorage,\s*['"]brightdesk-docs-v3['"]/);
  assert.match(app, /fallbackKeys:\s*\[['"]brightdesk-docs-v2['"]\]/);
  assert.match(app, /commonJsonStorage\.writeJsonValue\(localStorage,\s*['"]brightdesk-docs-v3['"],\s*state\.docs\)/);
  assert.match(app, /commonJsonStorage\.readJsonValue\(localStorage,\s*['"]brightdesk-app-setup-v1['"]/);
  assert.match(app, /commonJsonStorage\.writeJsonValue\(localStorage,\s*['"]brightdesk-app-setup-v1['"],/);
});

test('legacy documents remain readable and are saved under the current local key', () => {
  const api = loadStorage();
  const values = new Map([['brightdesk-docs-v2', JSON.stringify({ pages: { title: 'Existing local document' } })]]);
  const storage = {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); }
  };
  const loaded = api.readJsonValue(storage, 'brightdesk-docs-v3', {
    fallbackKeys: ['brightdesk-docs-v2'],
    fallbackValue: null
  });
  assert.deepEqual(loaded, { pages: { title: 'Existing local document' } });
  assert.equal(values.has('brightdesk-docs-v2'), true);
  api.writeJsonValue(storage, 'brightdesk-docs-v3', loaded);
  assert.deepEqual(JSON.parse(values.get('brightdesk-docs-v3')), loaded);
});

test('malformed local JSON fails closed without deleting the stored bytes', () => {
  const api = loadStorage();
  const raw = '{bad json';
  const values = new Map([['brightdesk-docs-v3', raw]]);
  const storage = { getItem(key) { return values.has(key) ? values.get(key) : null; } };
  assert.throws(() => api.readJsonValue(storage, 'brightdesk-docs-v3'), /Invalid JSON stored under key brightdesk-docs-v3/);
  assert.equal(values.get('brightdesk-docs-v3'), raw);
});
