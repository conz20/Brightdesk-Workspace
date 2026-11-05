'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

test('Workspace identity and pinned runtime are consistent', () => {
  assert.equal(pkg.brightdeskAppId, 'loop');
  assert.equal(pkg.version, '0.1.0');
  assert.equal(pkg.engines.node, '24.22.2');
  assert.equal(pkg.build.appId, 'org.brightdesk.loop');
  assert.equal(pkg.build.productName, 'Brightdesk Workspace');
});

test('each platform build includes the native engine and licence verification', () => {
  for (const platform of ['win', 'mac', 'linux']) {
    assert.equal(
      pkg.scripts[`dist:${platform}`],
      `npm run native:build && npm run verify:licenses && node scripts/build-app.js loop ${platform}`
    );
    assert.equal(pkg.scripts[`dist:app:${platform}`], `npm run dist:${platform}`);
    assert.equal(
      pkg.scripts[`verify:desktop:${platform}`],
      `node scripts/verify-desktop-installers.js ${platform} release/apps loop`
    );
    assert.equal(pkg.scripts[`verify:app:${platform}`], `npm run verify:desktop:${platform}`);
  }
  assert.equal(fs.existsSync(path.join(root, 'scripts', 'verify-desktop-installers.js')), true);
});

test('electron-builder uses Workspace-specific installer names on all platforms', () => {
  const configPath = path.join(root, 'electron-builder.app.config.js');
  const previousId = process.env.BRIGHTDESK_APP_ID;
  try {
    process.env.BRIGHTDESK_APP_ID = 'loop';
    delete require.cache[require.resolve(configPath)];
    const config = require(configPath);
    assert.equal(config.appId, 'org.brightdesk.loop');
    assert.equal(config.productName, 'Brightdesk Workspace');
    assert.equal(config.extraMetadata.brightdeskAppId, 'loop');
    assert.equal(config.win.artifactName, 'Brightdesk-Workspace-${version}-${arch}.${ext}');
    assert.equal(config.mac.artifactName, 'Brightdesk-Workspace-${version}-${arch}.${ext}');
    assert.equal(config.linux.artifactName, 'brightdesk-workspace-${version}-${arch}.${ext}');
    assert.equal(config.appImage.artifactName, config.linux.artifactName);
    assert.ok(config.asarUnpack.includes('native/brightdesk_engine.node'));
  } finally {
    if (previousId === undefined) delete process.env.BRIGHTDESK_APP_ID;
    else process.env.BRIGHTDESK_APP_ID = previousId;
    delete require.cache[require.resolve(configPath)];
  }
  assert.equal(pkg.build.appImage.artifactName, 'brightdesk-workspace-${version}-${arch}.${ext}');
});

test('Rust checks are read-only and use the committed lockfile', () => {
  const command = pkg.scripts['rust:check'];
  assert.match(command, /cargo fmt .*-- --check/);
  assert.match(command, /cargo clippy .*--locked/);
  assert.match(command, /npm run rust:test/);
  assert.match(pkg.scripts['rust:test'], /^cargo test .*--locked$/);
  assert.match(command, /npm run native:build/);
  assert.doesNotMatch(command, /npm run rust:fmt/);
  const toolchain = fs.readFileSync(path.join(root, 'rust-toolchain.toml'), 'utf8');
  assert.match(toolchain, /channel\s*=\s*"1\.99\.1"/);
});
