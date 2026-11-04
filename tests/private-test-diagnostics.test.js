'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { parseTapFailureNames, formatPrivateFailureSummary } = require('../scripts/brightdesk-private-runner/private-test-diagnostics');

test('private test diagnostics extracts failed test names from TAP output', () => {
  const tap = [
    'TAP version 13',
    '# Subtest: first feature',
    'not ok 1 - first feature',
    '  ---',
    '  duration_ms: 0.9',
    '  type: test',
    "  location: '/tmp/private-source/src/private.js:42:1'",
    '  failureType: testCodeFailure',
    "  error: 'PRIVATE_ERROR_DETAIL'",
    '  code: ERR_ASSERTION',
    '  ...',
    '1..1',
    '# tests 1',
    '# pass 0',
    '# fail 1'
  ].join('\n');

  assert.deepEqual(parseTapFailureNames(tap), ['first feature']);
});
test('private test diagnostics never includes raw errors, source paths, or stack traces', () => {
  const tap = [
    'not ok 1 - failing feature',
    '  error: SECRET_SOURCE_CONTENT',
    '  stack: /home/runner/work/private/repo/src/private.js:42',
    '  code: ERR_ASSERTION'
  ].join('\n');

  const summary = formatPrivateFailureSummary('Brightdesk-suite', parseTapFailureNames(tap));

  assert.match(summary, /Brightdesk-suite/);
  assert.match(summary, /failing feature/);
  assert.doesNotMatch(summary, /SECRET_SOURCE_CONTENT/);
  assert.doesNotMatch(summary, /private\.js/);
  assert.doesNotMatch(summary, /ERR_ASSERTION/);
});

test('private test diagnostics handles TAP output without individual failing test names', () => {
  const summary = formatPrivateFailureSummary('Brightdesk-suite', []);

  assert.match(summary, /Automated tests failed/);
  assert.match(summary, /individual failing test/i);
});

test('private test diagnostics bounds and sanitizes untrusted test names', () => {
  const tap = [
    'not ok 1 - bad\u001b[31mname\u001b[0m',
    'not ok 2 - badname'
  ].join('\n');

  const names = parseTapFailureNames(tap);
  assert.deepEqual(names, ['badname']);
  assert.ok(names[0].length <= 200);
});

const {
  MARKER,
  readPrivateFailureSummary,
  buildDiagnosticComment,
  upsertDiagnosticComment
} = require('../scripts/brightdesk-private-runner/report-private-test-failure');

test('private diagnostic summary is read from a runner-local file instead of an environment variable', () => {
  const encoded = Buffer.from('Failing test cases: private name only', 'utf8').toString('base64');
  const summary = readPrivateFailureSummary('runner-local-summary.b64', {
    readFileSync: () => encoded
  });

  assert.equal(summary, 'Failing test cases: private name only');
});

test('private diagnostic comment includes only the bounded sanitized summary', () => {
  const body = buildDiagnosticComment('Failing test cases: first feature');

  assert.ok(body.includes(MARKER));
  assert.ok(body.includes('first feature'));
  assert.doesNotMatch(body, /SECRET_SOURCE_CONTENT|private\.js|stack trace detail/);
});

test('private diagnostic reporter creates one marked comment when none exists', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return calls.length === 1
      ? { ok: true, json: async () => [] }
      : { ok: true, json: async () => ({ id: 123 }) };
  };

  const result = await upsertDiagnosticComment({
    token: 'test-token',
    summary: 'Failing test cases: first feature',
    fetchImpl,
    apiUrl: 'https://api.example.test'
  });

  assert.equal(result, 'created');
  assert.equal(calls[1].options.method, 'POST');
  assert.ok(calls[1].url.endsWith('/issues/27/comments'));
  assert.equal(JSON.parse(calls[1].options.body).body.includes(MARKER), true);
});

test('private diagnostic reporter updates its existing marked comment instead of spamming issues', async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    return calls.length === 1
      ? { ok: true, json: async () => [{ id: 456, body: MARKER + '\\nold diagnostic' }] }
      : { ok: true, json: async () => ({ id: 456 }) };
  };

  const result = await upsertDiagnosticComment({
    token: 'test-token',
    summary: 'Failing test cases: second feature',
    fetchImpl,
    apiUrl: 'https://api.example.test'
  });

  assert.equal(result, 'updated');
  assert.equal(calls[1].options.method, 'PATCH');
  assert.ok(calls[1].url.endsWith('/issues/comments/456'));
});

test('private diagnostic reporter refuses to send an empty report', async () => {
  await assert.rejects(
    upsertDiagnosticComment({ token: 'test-token', summary: '', fetchImpl: async () => ({ ok: true, json: async () => [] }) }),
    /non-empty private diagnostic summary/
  );
});

