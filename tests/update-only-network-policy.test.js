'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, 'src', file), 'utf8');
const app = read('app.js');
const main = read('main.js');
const preload = read('preload.js');

test('product UI does not offer separate desktop installer downloads', () => {
  assert.doesNotMatch(app, /Download desktop (?:installer|version)/i);
  assert.doesNotMatch(app, /downloadDesktopInstaller|downloadStandaloneApp/);
});

test('renderer bridge and main process do not expose external installer downloads', () => {
  assert.doesNotMatch(preload, /downloadDesktopInstaller|downloadStandaloneApp|downloads:(desktop-installer|standalone-app)/);
  assert.doesNotMatch(main, /downloads:(desktop-installer|standalone-app)/);
  assert.match(main, /target\.origin !== 'https:\/\/help\.brightdesk\.com'/);
  assert.match(main, /!allowedBrightdeskHelpPaths\.has\(target\.pathname\)/);
  assert.match(main, /target\.search \|\| target\.hash/);
  assert.deepEqual(main.match(/shell\.openExternal\s*\([^)]*\)/g) || [], ['shell.openExternal(target.href)']);
  assert.match(main, /setWindowOpenHandler\(\(\{ url \}\) => \{ openBrightdeskHelp\(url\); return \{ action: 'deny' \}; \}\)/);
});

test('official update checking remains available', () => {
  assert.match(main, /checkForUpdates/);
  assert.match(preload, /updates:check/);
});
