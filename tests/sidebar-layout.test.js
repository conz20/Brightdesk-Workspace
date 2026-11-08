import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const css=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
test('desktop sidebar is slim and retains captions',()=>{assert.match(css,/\.sidebar\s*\{[^}]*width:\s*192px/);assert.match(css,/\.nav\s+small\s*\{[^}]*display:\s*block/)});
test('mobile sidebar retains labels and captions',()=>{assert.match(css,/\.nav\s+small\s*\{display:block\}/);assert.match(css,/\.sidebar-bottom\s*\{display:flex\}/)});
