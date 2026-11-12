'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const src = path.join(__dirname, '..', 'src');
const html = fs.readFileSync(path.join(src, 'index.html'), 'utf8');
const designSystem = fs.readFileSync(path.join(src, 'design-system.css'), 'utf8');
const motion = fs.readFileSync(path.join(src, 'motion.css'), 'utf8');

test('bundles the shared motion stylesheet locally after the product design layer', () => {
  const designIndex = html.indexOf('href="design-system.css"');
  const motionIndex = html.indexOf('href="motion.css"');
  assert.ok(designIndex >= 0, 'product design stylesheet must be linked');
  assert.ok(motionIndex > designIndex, 'motion stylesheet must load after the product design layer');
  assert.match(html, /href="motion\.css"/);
});

test('uses the canonical motion tokens for existing product controls', () => {
  assert.match(designSystem, /--bd-motion-duration-fast:\s*120ms/);
  assert.match(designSystem, /--bd-motion-duration-normal:\s*180ms/);
  assert.match(designSystem, /--bd-motion-ease-standard:\s*cubic-bezier\(/);
  assert.match(designSystem, /button\{transition:background-color var\(--bd-motion-duration-fast/);
});

test('includes the shared motion primitives and reduced-motion safeguards', () => {
  for (const className of [
    '.bd-motion-surface',
    '.bd-motion-interactive',
    '.bd-motion-overlay',
    '.bd-motion-progress',
    '.bd-motion-spinner'
  ]) assert.ok(motion.includes(className), 'missing ' + className);
  assert.ok(motion.includes('@media (prefers-reduced-motion: reduce)'));
  assert.ok(motion.includes('animation: none !important'));
  assert.ok(!motion.includes('transition: all'));
});
