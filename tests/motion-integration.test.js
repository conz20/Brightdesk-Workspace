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

const app = fs.readFileSync(path.join(src, 'app.js'), 'utf8');

test('visible product workspaces and manager views receive a shared entrance motion', () => {
  for (const id of [
    'workspace',
    'todo-wrap',
    'lists-wrap',
    'forms-wrap',
    'planner-wrap',
    'database-wrap',
    'workspace-app-wrap',
    'app-manager',
    'language-manager'
  ]) assert.ok(motion.includes('#' + id + ':not([hidden])'), 'missing motion for #' + id);
});

test('native disclosure panels animate their newly visible content', () => {
  assert.ok(motion.includes('details[open] > :not(summary)'));
});

test('buttons use the shared transform feedback without ignoring reduced motion', () => {
  assert.ok(motion.includes('button:not(.nav):not(:disabled)'));
  assert.ok(motion.includes('transform var(--bd-motion-duration-fast, 120ms) var(--bd-motion-ease-standard, ease)'));
  assert.ok(motion.includes('button:not(.nav):not(:disabled):hover'));
  assert.ok(motion.includes('button:not(.nav):not(:disabled):active'));
});

test('update checks expose a loading spinner only while checking or downloading', () => {
  assert.ok(app.includes('function setUpdateMessage(message, loading = false)'));
  assert.ok(app.includes("spinner.className = 'bd-motion-spinner'"));
  assert.ok(app.includes("updateState.status === 'checking' || updateState.status === 'downloading'"));
  assert.ok(html.includes('id="update-message" role="status"'));
});

test('presentation mode uses the shared overlay state and closes accessibly', () => {
  assert.ok(app.includes("overlay.className = 'presentation-overlay bd-motion-overlay'"));
  assert.ok(app.includes("overlay.dataset.state = 'closed'"));
  assert.ok(app.includes("overlay.dataset.state = 'open'"));
  assert.ok(app.includes('requestAnimationFrame'));
  assert.ok(app.includes("window.matchMedia('(prefers-reduced-motion: reduce)')"));
  assert.ok(app.includes("overlay.addEventListener('transitionend', finish)"));
  assert.ok(app.includes("document.removeEventListener('keydown', key)"));
});

test('reduced-motion preference also removes existing navigation and app-card hover movement', () => {
  assert.ok(motion.includes('.nav:hover'));
  assert.ok(motion.includes('.app-card:hover'));
  assert.ok(motion.includes('transform: none !important'));
});
