'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file));
const text = file => read(file).toString('utf8');

test('registers Inter variable faces from local files without network font services', () => {
  const html = text('src/index.html');
  const css = text('src/fonts.css');
  assert.match(html, /href="fonts\.css"/);
  assert.match(css, /font-family:\s*"Inter"/);
  assert.match(css, /font-weight:\s*100\s+900/);
  assert.match(css, /font-style:\s*normal/);
  assert.match(css, /font-style:\s*italic/);
  assert.match(css, /font-optical-sizing:\s*auto/);
  assert.match(css, /url\("\.\/assets\/fonts\/inter\/Inter\[opsz,wght\]\.ttf"\)/);
  assert.match(css, /url\("\.\/assets\/fonts\/inter\/Inter-Italic\[opsz,wght\]\.ttf"\)/);
  assert.doesNotMatch(css, /https?:\/\//);
});

test('includes verified Inter font binaries and the complete SIL OFL 1.1 notice', () => {
  const files = [
    ['src/assets/fonts/inter/Inter[opsz,wght].ttf', '29160a80ff49ddcab2c97711247e08b1fab27a484a329ce8b813d820dc559031'],
    ['src/assets/fonts/inter/Inter-Italic[opsz,wght].ttf', 'acd98e64795781b2058f07b18475e0ecee2a0fe2b42a49e2f9e37d0d6bf66ce6']
  ];
  for (const [file, expectedSha256] of files) {
    const bytes = read(file);
    assert.deepEqual([...bytes.subarray(0, 4)], [0, 1, 0, 0]);
    assert.ok(bytes.byteLength > 800000);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), expectedSha256);
  }
  assert.match(text('src/licenses/fonts/inter-OFL.txt'), /^Copyright 2020 The Inter Project Authors/);
  assert.match(text('src/licenses/fonts/inter-OFL.txt'), /SIL OPEN FONT LICENSE Version 1\.1/);
  assert.match(text('src/licenses/fonts/README.md'), /Inter 4\.1/);
});
