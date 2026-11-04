#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { PRODUCT_SLUGS } = require('../src/desktop-downloads');

const PLATFORMS = Object.freeze({
  win: { arch: 'x64', extensions: ['exe'] },
  mac: { arch: 'universal', extensions: ['dmg', 'pkg', 'zip'] },
  linux: { arch: 'x64', extensions: ['AppImage', 'deb'] }
});

function sha256File(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function expectedFilename(productId, platform, version) {
  const slug = PRODUCT_SLUGS[productId];
  const target = PLATFORMS[platform];
  if (!slug || !target) throw new Error('An approved Brightdesk product and supported platform are required.');
  const base = platform === 'linux'
    ? `brightdesk-${slug.toLowerCase()}-${version}-${target.arch}`
    : `Brightdesk-${slug}-${version}-${target.arch}`;
  return target.extensions.map(extension => `${base}.${extension}`);
}

function verifyDesktopInstallers({ directory, platform, version, productId = null }) {
  const target = PLATFORMS[platform];
  if (!target) throw new Error(`Unsupported platform: ${platform}`);
  if (typeof version !== 'string' || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error('A valid release version is required for desktop installer verification.');
  }

  if (productId !== null && !PRODUCT_SLUGS[productId]) {
    throw new Error(`Unknown approved Brightdesk product: ${productId}`);
  }
  const selectedProducts = productId ? [[productId, PRODUCT_SLUGS[productId]]] : Object.entries(PRODUCT_SLUGS);
  const productResults = [];
  for (const [selectedProductId, slug] of selectedProducts) {
    const productDirectory = path.join(directory, selectedProductId);
    if (!fs.existsSync(productDirectory) || !fs.statSync(productDirectory).isDirectory()) {
      throw new Error(`Missing desktop installer output folder for Brightdesk ${slug}: ${productDirectory}`);
    }
    const expected = expectedFilename(selectedProductId, platform, version);
    const files = expected.map(filename => path.join(productDirectory, filename));
    const missing = files.filter(file => !fs.existsSync(file));
    if (missing.length) {
      throw new Error(`Missing Brightdesk ${slug} ${platform} installer(s): ${missing.map(file => path.basename(file)).join(', ')}`);
    }
    const rows = files.map(file => {
      const bytes = fs.statSync(file).size;
      if (bytes <= 0) throw new Error(`Desktop installer is empty: ${file}`);
      return {
        file: path.relative(directory, file).split(path.sep).join('/'),
        bytes,
        sha256: sha256File(file)
      };
    });
    const checksumFile = path.join(productDirectory, `Brightdesk-${selectedProductId}-SHA256SUMS-${platform.toUpperCase()}.txt`);
    fs.writeFileSync(checksumFile, `${rows.map(row => `${row.sha256}  ${path.basename(row.file)}`).join('\n')}\n`);
    productResults.push({ productId: selectedProductId, productName: slug, files: rows, checksumFile });
  }

  return {
    platform,
    version,
    productCount: productResults.length,
    products: productResults,
    fileCount: productResults.reduce((count, item) => count + item.files.length, 0)
  };
}

if (require.main === module) {
  const platform = process.argv[2];
  const root = path.resolve(__dirname, '..');
  const directory = path.resolve(process.argv[3] || path.join(root, 'release', 'apps'));
  const version = require('../package.json').version;
  const productId = process.argv[4] || null;
  try {
    const result = verifyDesktopInstallers({ directory, platform, version, productId });
    console.log(`Verified ${result.fileCount} desktop installer(s) for ${result.productCount} Brightdesk product(s) on ${platform}.`);
    for (const item of result.products) {
      console.log(`- Brightdesk ${item.productName}: ${item.files.length} installer(s); checksum: ${path.relative(directory, item.checksumFile)}`);
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { PLATFORMS, expectedFilename, sha256File, verifyDesktopInstallers };
