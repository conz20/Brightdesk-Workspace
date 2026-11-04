'use strict';

const fs = require('node:fs');

const MARKER = '<!-- brightdesk-private-test-diagnostic -->';
const REPOSITORY = 'connormolloy12/Brightdesk-suite';
const ISSUE_NUMBER = 27;

function readPrivateFailureSummary(filePath, fsImpl = fs) {
  if (!filePath) return '';
  const encoded = fsImpl.readFileSync(filePath, 'utf8').trim();
  return Buffer.from(encoded, 'base64').toString('utf8');
}

function buildDiagnosticComment(summary) {
  const safeSummary = String(summary || '')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .trim()
    .slice(0, 6000);

  if (!safeSummary) throw new Error('A non-empty private diagnostic summary is required.');

  return [
    MARKER,
    '## Latest private automated-test diagnostic',
    '',
    safeSummary,
    '',
    'This report contains failing test names only. Assertion messages, source contents, file paths, credentials, and stack traces are intentionally excluded.'
  ].join('\n');
}

async function upsertDiagnosticComment({ token, summary, fetchImpl = fetch, apiUrl = 'https://api.github.com' }) {
  if (!token) throw new Error('A short-lived issue-scoped GitHub token is required.');

  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json'
  };
  const commentsUrl = `${apiUrl}/repos/${REPOSITORY}/issues/${ISSUE_NUMBER}/comments?per_page=100`;
  const listResponse = await fetchImpl(commentsUrl, { headers });

  if (!listResponse.ok) throw new Error('Could not read the private diagnostic issue comments.');
  const comments = await listResponse.json();
  const body = buildDiagnosticComment(summary);
  const existing = comments.find(comment => String(comment.body || '').includes(MARKER));

  const url = existing
    ? `${apiUrl}/repos/${REPOSITORY}/issues/comments/${existing.id}`
    : `${apiUrl}/repos/${REPOSITORY}/issues/${ISSUE_NUMBER}/comments`;
  const response = await fetchImpl(url, {
    method: existing ? 'PATCH' : 'POST',
    headers,
    body: JSON.stringify({ body })
  });

  if (!response.ok) throw new Error('Could not update the private diagnostic issue comment.');
  return existing ? 'updated' : 'created';
}

if (require.main === module) {
  upsertDiagnosticComment({
    token: process.env.GITHUB_TOKEN,
    summary: readPrivateFailureSummary(process.env.BRIGHTDESK_FAILURE_SUMMARY_FILE),
    apiUrl: process.env.GITHUB_API_URL || 'https://api.github.com'
  }).then(result => {
    process.stdout.write(`Private diagnostic comment ${result} on Brightdesk-suite issue #27.\n`);
  }).catch(() => {
    process.stderr.write('Private diagnostic report could not be written. No private test output was printed.\n');
    process.exitCode = 1;
  });
}

module.exports = { MARKER, readPrivateFailureSummary, buildDiagnosticComment, upsertDiagnosticComment };
