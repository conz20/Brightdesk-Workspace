'use strict';

const fs = require('node:fs');

const REPOSITORY = 'conz20/Brightdesk-suite';
const ISSUE_NUMBER = 27;
const PLATFORMS = new Set(['win', 'mac', 'linux']);

function readInstallerFailureSummary(filePath, fsImpl = fs) {
  if (!filePath) throw new Error('A private installer diagnostic summary file is required.');
  const encoded = fsImpl.readFileSync(filePath, 'utf8').trim();
  if (!encoded) throw new Error('The private installer diagnostic summary file is empty.');
  return Buffer.from(encoded, 'base64').toString('utf8');
}

function buildInstallerDiagnosticComment(platform, summary) {
  if (!PLATFORMS.has(platform)) throw new Error('Unsupported installer diagnostic platform.');
  const safeSummary = String(summary || '')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .trim()
    .slice(0, 3000);
  if (!safeSummary) throw new Error('A non-empty private installer diagnostic summary is required.');

  return [
    '<!-- brightdesk-private-installer-diagnostic-' + platform + ' -->',
    '## Latest private ' + platform + ' installer diagnostic',
    '',
    safeSummary
  ].join('\n');
}

async function upsertInstallerDiagnostic({ token, platform, summary, fetchImpl = fetch, apiUrl = 'https://api.github.com' }) {
  if (!token) throw new Error('A short-lived issue-scoped GitHub token is required.');
  const body = buildInstallerDiagnosticComment(platform, summary);
  const marker = '<!-- brightdesk-private-installer-diagnostic-' + platform + ' -->';
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: 'Bearer ' + token,
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json'
  };
  const commentsUrl = apiUrl + '/repos/' + REPOSITORY + '/issues/' + ISSUE_NUMBER + '/comments?per_page=100';
  const listResponse = await fetchImpl(commentsUrl, { headers });
  if (!listResponse.ok) throw new Error('Could not read the private installer diagnostic issue comments.');
  const comments = await listResponse.json();
  const existing = comments.find(comment => String(comment.body || '').includes(marker));
  const url = existing
    ? apiUrl + '/repos/' + REPOSITORY + '/issues/comments/' + existing.id
    : apiUrl + '/repos/' + REPOSITORY + '/issues/' + ISSUE_NUMBER + '/comments';
  const response = await fetchImpl(url, {
    method: existing ? 'PATCH' : 'POST',
    headers,
    body: JSON.stringify({ body })
  });
  if (!response.ok) throw new Error('Could not write the private installer diagnostic issue comment.');
  return existing ? 'updated' : 'created';
}

if (require.main === module) {
  try {
    const result = upsertInstallerDiagnostic({
      token: process.env.GITHUB_TOKEN,
      platform: process.env.BRIGHTDESK_INSTALLER_PLATFORM,
      summary: readInstallerFailureSummary(process.env.BRIGHTDESK_INSTALLER_FAILURE_SUMMARY_FILE),
      apiUrl: process.env.GITHUB_API_URL || 'https://api.github.com'
    });
    result.then(action => {
      process.stdout.write('Private ' + process.env.BRIGHTDESK_INSTALLER_PLATFORM + ' installer diagnostic ' + action + ' on Brightdesk-suite issue #27.\n');
    }).catch(() => {
      process.stderr.write('Private installer diagnostic could not be written. No private log output was printed.\n');
      process.exitCode = 1;
    });
  } catch {
    process.stderr.write('Private installer diagnostic could not be prepared. No private log output was printed.\n');
    process.exitCode = 1;
  }
}

module.exports = { readInstallerFailureSummary, buildInstallerDiagnosticComment, upsertInstallerDiagnostic, PLATFORMS };
