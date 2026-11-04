'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

test('repository is pinned to its approved Brightdesk Workspace identity and Node.js runtime', () => {
  assert.equal(pkg.brightdeskAppId, 'loop');
  assert.equal(pkg.version, '0.1.0');
  assert.equal(pkg.engines.node, '24.22.2');
  assert.equal(pkg.build.appId, 'org.brightdesk.loop');
  assert.equal(pkg.build.productName, 'Brightdesk Workspace');
});

test('product build and verification scripts use matching product-specific paths', () => {
  for (const platform of ['win', 'mac', 'linux']) {
    assert.equal(pkg.scripts[`dist:${platform}`], `npm run native:build && npm run verify:licenses && node scripts/build-app.js loop ${platform}`);
    assert.equal(pkg.scripts[`verify:desktop:${platform}`], `node scripts/verify-desktop-installers.js ${platform} release/apps loop`);
    assert.equal(pkg.scripts[`release:verify:${platform}`], `npm run verify:desktop:${platform}`);
  }
  assert.equal(fs.existsSync(path.join(root, 'scripts', 'verify-standalone-apps.js')), false);
  assert.doesNotMatch(Object.values(pkg.scripts).join('\n'), /verify-standalone-apps\.js/);
});

test('Rust verification checks formatting without silently rewriting source', () => {
  assert.match(pkg.scripts['rust:check'], /cargo fmt .*-- --check/);
  assert.match(pkg.scripts['rust:check'], /cargo clippy/);
  assert.match(pkg.scripts['rust:check'], /npm run rust:test/);
  assert.match(pkg.scripts['rust:check'], /npm run native:build/);
  const toolchain = fs.readFileSync(path.join(root, 'rust-toolchain.toml'), 'utf8');
  assert.match(toolchain, /channel\s*=\s*"1\.99\.1"/);
});
