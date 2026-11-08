'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
test('product navigation collapses accessibly while preserving original SVG icons',()=>{
 const html=read('src/index.html'),js=read('src/app.js'),css=read('src/styles.css');
 assert.ok(html.includes('id="sidebar-toggle"'));
 assert.ok(html.includes('aria-label="Brightdesk Pages" title="Brightdesk Pages"'));
 assert.ok(html.includes('<svg class="app-icon manager-icon" viewBox="0 0 24 24"'));
 assert.ok(js.includes('function setSidebarCompact(compact)')&&js.includes('sidebarPreference'));
 assert.ok(js.includes('aria-expanded'));
 assert.ok(css.includes('width: 76px;')&&css.includes('.sidebar.is-compact .brand > div'));
 assert.ok(css.includes('@media (prefers-reduced-motion: reduce)'));
});
