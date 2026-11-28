'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createDesktopDownload, PRODUCT_SLUGS } = require('../src/desktop-downloads');

const expected = {
  pages: 'Pages',
  sheets: 'Sheets',
  slides: 'Decks',
  notes: 'Notes',
  database: 'Database',
  forms: 'Forms',
  lists: 'Lists',
  planner: 'Planner',
  todo: 'To-Do',
  loop: 'Workspace'
};

test('desktop installer mapping covers exactly the approved Brightdesk products', () => {
  assert.deepEqual(PRODUCT_SLUGS, expected);
});

test('each Brightdesk product resolves to its release installer on Windows, macOS and Linux', () => {
  for (const [productId, slug] of Object.entries(expected)) {
    const cases = [
      ['win32', `Brightdesk-${slug}-0.1.0-x64.exe`],
      ['darwin', `Brightdesk-${slug}-0.1.0-universal.dmg`],
      ['linux', `brightdesk-${slug.toLowerCase()}-0.1.0-x64.AppImage`]
    ];
    for (const [platform, filename] of cases) {
      const result = createDesktopDownload({ productId, platform, version: '0.1.0' });
      assert.equal(result.filename, filename, `${productId} on ${platform}`);
      assert.equal(result.url, `https://github.com/conz20/Brightdesk-suite/releases/latest/download/${encodeURIComponent(filename)}`);
    }
  }
});

test('desktop installer download rejects names outside the approved Brightdesk catalogue', () => {
  assert.throws(() => createDesktopDownload({ productId: 'outlook', platform: 'darwin', version: '0.1.0' }), /not available/);
});

test('desktop installer download rejects unsupported operating systems', () => {
  assert.throws(() => createDesktopDownload({ productId: 'pages', platform: 'freebsd', version: '0.1.0' }), /not supported/);
});

test('desktop installer download validates the release version before building a URL', () => {
  assert.throws(() => createDesktopDownload({ productId: 'pages', platform: 'win32', version: '../latest' }), /valid release version/);
});

test('desktop installer verification can check one Brightdesk product', () => {
  const fs = require('node:fs');
  const os = require('node:os');
  const path = require('node:path');
  const { expectedFilename, verifyDesktopInstallers } = require('../scripts/verify-desktop-installers');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'brightdesk-one-product-'));
  try {
    const productDirectory = path.join(directory, 'pages');
    fs.mkdirSync(productDirectory, { recursive: true });
    for (const filename of expectedFilename('pages', 'mac', '0.1.0')) {
      fs.writeFileSync(path.join(productDirectory, filename), 'verified test installer');
    }
    const result = verifyDesktopInstallers({ directory, platform: 'mac', version: '0.1.0', productId: 'pages' });
    assert.equal(result.productCount, 1);
    assert.equal(result.products[0].productId, 'pages');
    assert.equal(result.fileCount, 3);
    assert.ok(fs.existsSync(path.join(productDirectory, 'Brightdesk-pages-SHA256SUMS-MAC.txt')));
    assert.throws(() => verifyDesktopInstallers({ directory, platform: 'mac', version: '0.1.0', productId: 'outlook' }), /approved Brightdesk product/);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
