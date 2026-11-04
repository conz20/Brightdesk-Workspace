'use strict';

const PRODUCT_SLUGS = Object.freeze({
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
});

const PLATFORM_SUFFIXES = Object.freeze({
  win32: { arch: 'x64', extension: 'exe' },
  darwin: { arch: 'universal', extension: 'dmg' },
  linux: { arch: 'x64', extension: 'AppImage' }
});

function createDesktopDownload({ productId, platform, version }) {
  const slug = PRODUCT_SLUGS[productId];
  if (!slug) throw new Error(`Brightdesk product "${productId}" is not available for desktop installation.`);
  const target = PLATFORM_SUFFIXES[platform];
  if (!target) throw new Error(`Desktop installer links are not supported on ${platform}.`);
  if (typeof version !== 'string' || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error('A valid release version is required to prepare a desktop installer.');
  }

  const filename = platform === 'linux'
    ? `brightdesk-${slug.toLowerCase()}-${version}-${target.arch}.${target.extension}`
    : `Brightdesk-${slug}-${version}-${target.arch}.${target.extension}`;
  const url = `https://github.com/connormolloy12/Brightdesk-suite/releases/latest/download/${encodeURIComponent(filename)}`;
  return { productId, platform, version, filename, url };
}

module.exports = { PRODUCT_SLUGS, PLATFORM_SUFFIXES, createDesktopDownload };
