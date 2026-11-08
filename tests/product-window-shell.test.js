const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..', 'src');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'product-window.css'), 'utf8');
test('an individual product launch selects the focused product window', () => {
  assert.match(app, /if \(launchAppId\) document\.documentElement\.classList\.add\('is-product-window'\)/);
  assert.match(app, /Boolean\(launchAppId\)/);
  assert.match(app, /PRODUCT WORKSPACE/);
});
test('the product window hides the Suite rail and keeps its own workspace', () => {
  assert.match(html, /href="product-window\.css"/);
  assert.match(css, /html\.is-product-window \.sidebar\s*\{display:none!important\}/);
  assert.match(css, /html\.is-product-window \.workspace\s*\{[^}]*flex:1 1 auto/s);
});
