'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

function expectedArtifactName() {
  const slugs = { slides: 'decks', todo: 'to-do', loop: 'workspace' };
  const slug = slugs[pkg.brightdeskAppId] || pkg.brightdeskAppId;
  return 'brightdesk-' + slug + '-${version}-${arch}.${ext}';
}

test('Linux package and AppImage artifacts use the product-specific name', () => {
  const expected = expectedArtifactName();
  assert.equal(pkg.build.linux.artifactName, expected);
  assert.equal(pkg.build.appImage.artifactName, expected);
});

test('shared electron-builder config uses the same product-specific Linux names', () => {
  const previous = process.env.BRIGHTDESK_APP_ID;
  process.env.BRIGHTDESK_APP_ID = pkg.brightdeskAppId;
  const configPath = path.join(root, 'electron-builder.app.config.js');
  delete require.cache[require.resolve(configPath)];
  const config = require(configPath);
  if (previous === undefined) delete process.env.BRIGHTDESK_APP_ID;
  else process.env.BRIGHTDESK_APP_ID = previous;
  assert.equal(config.linux.artifactName, expectedArtifactName());
  assert.equal(config.appImage.artifactName, expectedArtifactName());
});
