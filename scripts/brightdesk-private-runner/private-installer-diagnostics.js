'use strict';

const fs = require('node:fs');

const PLATFORMS = new Set(['win', 'mac', 'linux']);
const STAGES = new Set([
  'Node.js version check',
  'dependency lock check',
  'locked dependency installation',
  'third-party licence check',
  'release readiness check',
  'installer build',
  'release asset preparation',
  'installer package verification',
  'installer installation smoke test'
]);
const WINDOWS_MESSAGES = [
  'The Windows installer did not install the product executable.',
  'The installed Windows application did not launch its version check.',
  'The installed Windows application did not complete its startup check.',
  'The Windows installer did not create its uninstaller.'
];
const LINUX_MESSAGES = [
  'Place exactly one Brightdesk .deb installer beside this script.',
  'This installer requires a Debian/Ubuntu system with apt-get.',
  'Installed Linux package did not register a desktop application.',
  'Installed Linux application executable was not found in the desktop entry or PATH.',
  'The Brightdesk Linux package has pre-existing package state; refusing to replace or remove it.'
];
const MACOS_MESSAGES = [
  'The macOS PKG completed without installing the expected product bundle.',
  'The macOS DMG did not contain the expected product bundle.',
  'A Brightdesk installation already exists; refusing to overwrite or remove it.',
  'A Brightdesk installer receipt already exists; refusing to modify or forget it.',
  'A previous macOS smoke-test temporary path already exists; refusing to reuse or remove it.'
];

function safeMissingLibraries(log) {
  const lines = String(log || '').split(/\r?\n/);
  const found = new Set();

  for (const line of lines) {
    const match = line.match(/^Missing system runtime libraries:\s*(.+)$/);
    if (!match) continue;

    for (const item of match[1].split(',')) {
      const library = item.trim();
      if (/^[A-Za-z0-9][A-Za-z0-9+_.-]{0,79}$/.test(library) && /\.so(?:\.\d+)*$/.test(library)) {
        found.add(library);
      }
    }
  }

  return [...found].sort().slice(0, 20);
}

function hasMissingCommandDiagnostic(log) {
  return String(log || '').split(/\r?\n/).some(line =>
    /\bcommand not found\b|not recognized as an internal or external command|is not recognized as the name of a cmdlet|The term .+ is not recognized/i.test(line)
  );
}

function safeLinuxMessages(log) {
  const messages = new Set(String(log || '').split(/\r?\n/).map(line => line.trim()));
  const result = LINUX_MESSAGES.filter(message => messages.has(message));
  for (const line of messages) {
    const match = line.match(/^Linux package (installation|uninstall) failed with exit code ([0-9]{1,3})\.$/);
    if (match) result.push('Linux package ' + match[1] + ' failed with exit code ' + Number(match[2]) + '.');
  }
  return [...new Set(result)].slice(0, 5);
}

function safeMacMessages(log) {
  const lines = new Set(String(log || '').split(/\r?\n/).map(line => line.trim()));
  return MACOS_MESSAGES.filter(message => lines.has(message)).slice(0, 5);
}

function safeWindowsStage(log) {
  const allowed = new Set(['installer execution', 'application launch', 'uninstaller execution']);
  let last = null;
  for (const line of String(log || '').split(/\r?\n/)) {
    const match = line.trim().match(/^Brightdesk Windows smoke test stage: (installer execution|application launch|uninstaller execution)\.$/);
    if (match && allowed.has(match[1])) last = match[1];
  }
  return last;
}

function safeWindowsMessages(log) {
  const lines = new Set(String(log || '').split(/\r?\n/).map(line => line.trim()));
  const result = WINDOWS_MESSAGES.filter(message => lines.has(message));
  for (const line of lines) {
    const match = line.match(/^The Windows (installer|uninstaller) exited with code ([0-9]{1,3})\.$/);
    if (match) result.push('The Windows ' + match[1] + ' exited with code ' + Number(match[2]) + '.');
  }
  return [...new Set(result)].slice(0, 5);
}

function formatPrivateInstallerFailure({ platform, stage, exitCode, log = '' } = {}) {
  if (!PLATFORMS.has(platform)) throw new Error('Unsupported platform for private installer diagnostics.');
  if (!STAGES.has(stage)) throw new Error('Unsupported stage for private installer diagnostics.');
  if (!Number.isInteger(exitCode) || exitCode < 1 || exitCode > 255) throw new Error('A valid numeric exit code is required.');

  const lines = [
    '## Brightdesk Suite installer diagnostic',
    '',
    'Project: Brightdesk-suite',
    'Platform: ' + platform,
    'Failed stage: ' + stage,
    'Exit code: ' + exitCode
  ];

  if (platform === 'linux') {
    if (String(log).includes('Installed application launch check failed')) {
      lines.push('Result: installed application launch check failed.');
    }
    const missing = safeMissingLibraries(log);
    if (missing.length) lines.push('Missing system runtime libraries: ' + missing.join(', '));
    const messages = safeLinuxMessages(log);
    if (messages.length) lines.push('Result: ' + messages.join(' '));
  } else if (platform === 'mac') {
    const messages = safeMacMessages(log);
    if (messages.length) lines.push('Result: ' + messages.join(' '));
  } else if (platform === 'win') {
    const messages = safeWindowsMessages(log);
    if (messages.length) lines.push('Result: ' + messages.join(' '));
    const stage = safeWindowsStage(log);
    if (stage) lines.push('Result: Windows smoke test failed during ' + stage + '.');
  }

  if (hasMissingCommandDiagnostic(log)) {
    lines.push('Result: a required command or executable could not be found.');
  } else if (exitCode === 127) {
    lines.push('Result: a command or executable could not start (exit code 127).');
  }

  lines.push('', 'Only the platform, failed stage, exit code and allow-listed runtime diagnostic details are included. Raw logs, file paths, source contents, stack traces and credentials remain private.');
  return lines.join('\n');
}

if (require.main === module) {
  const [logPath, platform, stage, exitCodeText] = process.argv.slice(2);
  if (!logPath || !platform || !stage || !exitCodeText) process.exit(2);
  const exitCode = Number(exitCodeText);
  const log = fs.readFileSync(logPath, 'utf8');
  const safe = formatPrivateInstallerFailure({ platform, stage, exitCode, log });
  process.stdout.write(Buffer.from(safe, 'utf8').toString('base64'));
}

module.exports = { formatPrivateInstallerFailure, safeMissingLibraries, safeLinuxMessages, safeMacMessages, safeWindowsMessages, safeWindowsStage, hasMissingCommandDiagnostic, PLATFORMS, STAGES };
