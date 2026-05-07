// lintCommand.js — CLI command to lint a .env file

const fs = require('fs');
const path = require('path');
const { parseEnvFile } = require('./envParser');
const { lintEnv, hasErrors, formatIssues } = require('./envLint');
const { log } = require('./logger');

function parseLintArgs(argv = process.argv.slice(2)) {
  const args = { file: '.env', rules: null, strict: false };

  for (let i = 0; i < argv.length; i++) {
    if ((argv[i] === '--file' || argv[i] === '-f') && argv[i + 1]) {
      args.file = argv[++i];
    } else if (argv[i] === '--rules' && argv[i + 1]) {
      args.rules = argv[++i].split(',').map((r) => r.trim());
    } else if (argv[i] === '--strict') {
      args.strict = true;
    }
  }

  return args;
}

function runLintCommand(args = parseLintArgs()) {
  const filePath = path.resolve(args.file);

  if (!fs.existsSync(filePath)) {
    log('error', `File not found: ${filePath}`);
    process.exitCode = 1;
    return;
  }

  let parsed;
  try {
    parsed = parseEnvFile(filePath);
  } catch (err) {
    log('error', `Failed to parse env file: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  const issues = lintEnv(parsed, args.rules || undefined);
  const output = formatIssues(issues);

  if (issues.length === 0) {
    log('info', `${filePath}: ${output}`);
  } else {
    issues.forEach((issue) => {
      log(issue.severity === 'error' ? 'error' : 'warn', `${issue.key}: ${issue.message}`);
    });
  }

  if (args.strict && hasErrors(issues)) {
    log('error', 'Linting failed with errors.');
    process.exitCode = 1;
  }

  return issues;
}

module.exports = { parseLintArgs, runLintCommand };
