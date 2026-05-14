// auditCommand.js — CLI command for running env audits

const path = require('path');
const { parseEnvFile } = require('./envParser');
const { auditEnv, hasAuditErrors, formatAuditIssues } = require('./envAudit');
const { log } = require('./logger');

/**
 * Parse CLI args for the audit command.
 * Usage: envwatch audit [--file <path>] [--strict]
 */
function parseAuditArgs(argv = process.argv.slice(2)) {
  const args = argv.slice(1); // remove 'audit' subcommand
  const opts = {
    file: '.env',
    strict: false,
  };

  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '--file' || args[i] === '-f') && args[i + 1]) {
      opts.file = args[++i];
    } else if (args[i] === '--strict') {
      opts.strict = true;
    }
  }

  return opts;
}

/**
 * Run the audit command.
 * @param {object} opts
 * @param {string} opts.file - path to .env file
 * @param {boolean} opts.strict - exit with code 1 on warnings too
 */
function runAuditCommand(opts = {}) {
  const filePath = path.resolve(opts.file || '.env');

  let envMap;
  try {
    envMap = parseEnvFile(filePath);
  } catch (err) {
    log('error', `Failed to read env file: ${filePath}`);
    log('error', err.message);
    process.exitCode = 1;
    return;
  }

  const issues = auditEnv(envMap);

  if (issues.length === 0) {
    log('info', `✔ No audit issues found in ${filePath}`);
    return;
  }

  const output = formatAuditIssues(issues);
  log('warn', `Audit results for ${filePath}:\n${output}`);

  const hasErrors = hasAuditErrors(issues);
  const shouldFail = hasErrors || opts.strict;

  if (shouldFail) {
    log('error', `Audit failed with ${issues.filter(i => i.severity === 'error').length} error(s).`);
    process.exitCode = 1;
  } else {
    log('warn', 'Audit completed with warnings only.');
  }
}

module.exports = { parseAuditArgs, runAuditCommand };
