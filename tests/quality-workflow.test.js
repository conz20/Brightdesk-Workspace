'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const workflowPath = path.resolve(__dirname, '..', '.github', 'workflows', 'quality.yml');

test('routine product quality checks use the private macOS runner, not hosted billing', () => {
  const workflow = fs.readFileSync(workflowPath, 'utf8');
  assert.match(workflow, /runs-on: \[self-hosted, macOS, ARM64\]/);
  assert.doesNotMatch(workflow, /ubuntu-latest|windows-latest|macos-latest/);
});

test('quality workflow actions are pinned to immutable commit SHAs', () => {
  const workflow = fs.readFileSync(workflowPath, 'utf8');
  for (const line of workflow.split(/\r?\n/)) {
    const match = /^\s*uses:\s*([^\s#]+)/.exec(line);
    if (!match) continue;
    assert.match(match[1], /@[0-9a-f]{40}$/, 'workflow action must be SHA-pinned: ' + match[1]);
  }
  assert.match(workflow, /node-version: 24\.22\.2/);
  assert.match(workflow, /toolchain: 1\.99\.1/);
  assert.match(workflow, /npm run rust:check/);
  assert.match(workflow, /BRIGHTDESK_REQUIRE_NATIVE_ENGINE: "1"/);
  assert.match(workflow, /npm test/);
});
