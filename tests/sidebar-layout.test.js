import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const css=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
test('desktop sidebar is slim and retains captions',()=>{assert.match(css,/\.sidebar\s*\{[^}]*width:\s*192px/);assert.match(css,/\.nav\s+small\s*\{[^}]*display:\s*block/)});
test('mobile sidebar retains labels and captions',()=>{assert.match(css,/\.nav\s+small\s*\{display:block\}/);assert.match(css,/\.sidebar-bottom\s*\{display:flex\}/)});


test('embedded product navigation rails stay slim and retain their labels', () => {
  for (const name of ['todo','lists','forms','planner','database','workspace']) {
    assert.ok(css.includes('.' + name + '-sidebar{width:192px;min-width:192px}'), name + ' sidebar must be 192px');
    assert.ok(css.includes('.' + name + '-app{grid-template-columns:192px minmax(0,1fr)}'), name + ' content grid must match its sidebar');
  }
  assert.ok(css.lastIndexOf('.todo-sidebar h2{display:block') > css.lastIndexOf('.todo-sidebar h2{display:none'));
  assert.ok(css.lastIndexOf('.nav small{display:block') > css.lastIndexOf('.nav small{display:none'));
});


test('embedded navigation stacks into readable full-width mobile rails', () => {
  const responsive = css.slice(css.lastIndexOf('@media(max-width:760px){'));
  assert.ok(responsive.includes('.todo-app,.lists-app,.forms-app,.planner-app,.database-app,.workspace-app{grid-template-columns:1fr}'), 'all embedded product layouts must stack on mobile');
  assert.ok(responsive.includes('.todo-sidebar,.lists-sidebar,.forms-sidebar,.planner-sidebar,.database-sidebar,.workspace-sidebar{width:100%;min-width:0}'), 'all embedded navigation rails must fit the mobile viewport');
  assert.match(responsive, /\.nav small\{display:block/);
  assert.match(responsive, /\.todo-sidebar h2\{display:block/);
});
