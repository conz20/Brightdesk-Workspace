'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'src');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const shellCss = fs.readFileSync(path.join(root, 'product-window.css'), 'utf8');

test('individual product launch opens its focused workspace', () => {
  assert.match(app, /if \(launchAppId\) document\.documentElement\.classList\.add\('is-product-window'\)/);
  assert.match(app, /Boolean\(launchAppId\)/);
  assert.match(app, /PRODUCT WORKSPACE/);
});

test('product window retains its labelled navigation and fills the workspace', () => {
  assert.match(html, /href="product-window\.css"/);
  assert.match(shellCss, /html\.is-product-window body\s*\{[^}]*display:\s*flex;/s);
  assert.match(shellCss, /html\.is-product-window \.sidebar\s*\{[^}]*display:\s*flex\s*!important;/s);
  assert.doesNotMatch(shellCss, /html\.is-product-window \.sidebar\s*\{\s*display:\s*none/i);
  assert.match(shellCss, /html\.is-product-window \.workspace\s*\{[^}]*flex:\s*1 1 auto/s);
});
