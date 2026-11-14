'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { PRODUCT_SLUGS } = require('../src/desktop-downloads');

test('Electron main process imports the shared Brightdesk product catalogue before validating its product ID', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'main.js'), 'utf8');
  assert.match(
    source,
    /const\s+\{\s*PRODUCT_SLUGS\s*\}\s*=\s*require\(['"]\.\/desktop-downloads['"]\);/
  );
  assert.deepEqual(Object.keys(PRODUCT_SLUGS).sort(), ["database","forms","lists","loop","notes","pages","planner","sheets","slides","todo"]);
});
