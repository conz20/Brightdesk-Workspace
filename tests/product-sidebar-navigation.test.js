'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
test('product navigation adapts between expanded, compact and minimal states',()=>{
 const html=read('src/index.html'),js=read('src/app.js'),css=read('src/styles.css'),shellCss=read('src/product-window.css');
 assert.ok(html.includes('id="sidebar-toggle"')&&html.includes('aria-controls="sidebar-nav"'));
 assert.ok(html.includes('aria-label="Brightdesk Pages" title="Brightdesk Pages"'));
 assert.ok(html.includes('<svg class="app-icon manager-icon" viewBox="0 0 24 24"'));
 assert.ok(js.includes('function setSidebarState(state)')&&js.includes('mobileSidebarOpen'));
 assert.ok(js.includes('window.innerWidth <= 640')&&js.includes('window.innerWidth <= 1007'));
 assert.ok(css.includes('width: 232px;')&&css.includes('width: 76px;'));
 assert.ok(css.includes('.sidebar.is-minimal')&&css.includes('.sidebar.is-open-mobile'));
 assert.ok(css.includes('@media (prefers-reduced-motion: reduce)'));
  assert.ok(shellCss.includes('html.is-product-window .sidebar.is-open-mobile'));
  assert.ok(shellCss.includes('position:fixed;inset:0 auto 0 0'));
});
