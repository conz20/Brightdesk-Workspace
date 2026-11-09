import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('desktop navigation uses a slim rail and keeps every label and caption visible', () => {
  assert.match(css, /\.sidebar\s*\{[^}]*width:\s*192px/);
  assert.match(css, /\.nav\s+small\s*\{[^}]*display:\s*block/);
  assert.match(css, /\.nav\s+small\s*\{[^}]*white-space:\s*normal/);
  assert.ok(css.lastIndexOf('.nav small{display:block') > css.lastIndexOf('.nav small{display:none'));
});

test('embedded product navigation rails use the same desktop width', () => {
  for (const name of ['todo', 'lists', 'forms', 'planner', 'database', 'workspace']) {
    assert.ok(css.includes('.' + name + '-sidebar{width:192px;min-width:192px}'), name + ' sidebar must be 192px');
    assert.ok(css.includes('.' + name + '-app{grid-template-columns:192px minmax(0,1fr)}'), name + ' content grid must match its sidebar');
  }
  assert.ok(css.includes('.todo-sidebar h2{display:block'), 'To Do navigation heading must remain visible');
});
