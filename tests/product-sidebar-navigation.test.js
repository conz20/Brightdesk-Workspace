'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
test('product navigation supports expanded and compact desktop states', () => {
  const html = read('src/index.html');
  const js = read('src/app.js');
  const css = read('src/styles.css');
  const shellCss = read('src/product-window.css');
  assert.ok(html.includes('id="sidebar-toggle"'));
  assert.ok(html.includes('aria-controls="sidebar-nav"'));
  assert.ok(js.includes('function setSidebarState(state)'));
  assert.match(js, /window\.innerWidth\s*<=\s*1007/);
  assert.match(js, /classList\.toggle\('is-compact', compact\)/);
  assert.doesNotMatch(js, /mobileSidebarOpen|is-open-mobile|is-minimal|sidebar-mobile-open|innerWidth\s*<=\s*640/);
  assert.doesNotMatch(css, /\.sidebar\.is-minimal|\.sidebar\.is-open-mobile|body\.sidebar-mobile-open/);
  assert.doesNotMatch(shellCss, /is-open-mobile|is-minimal|sidebar-mobile-open|max-width:\s*640px/);
});
test('compact product navigation keeps its labels available to assistive technology', () => {
  const shellCss = read('src/product-window.css');
  const rule = shellCss.match(/html\.is-product-window \.sidebar\.is-compact \.nav > span\s*\{([^}]*)\}/);
  assert.ok(rule);
  assert.match(rule[1], /clip:\s*rect\(/);
  assert.doesNotMatch(rule[1], /display:\s*none/);
});
