// requireCommand.js — CLI command to check required env keys
const fs = require('fs');
const path = require('path');
const { parseEnvFile } = require('./envParser');
const { requireKeys, parseRequireFile, formatMissingIssues } = require('./envRequire');
const { log } = require('./logger');

function parseRequireArgs(argv) {
  const args = argv.slice(2);
  const opts = {
    envFile: '.env',
    requireFile: null,
    keys: [],
  };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--env' && args[i + 1]) opts.envFile = args[++i];
    else if (args[i] === '--require-file' && args[i + 1]) opts.requireFile = args[++i];
    else if (!args[i].startsWith('--')) opts.keys.push(args[i]);
  }
  return opts;
}

function runRequireCommand(opts) {
  if (!fs.existsSync(opts.envFile)) {
    log('error', `env file not found: ${opts.envFile}`);
    process.exitCode = 1;
    return;
  }

  const envMap = parseEnvFile(opts.envFile);
  let requiredKeys = [...opts.keys];

  if (opts.requireFile) {
    if (!fs.existsSync(opts.requireFile)) {
      log('error', `require file not found: ${opts.requireFile}`);
      process.exitCode = 1;
      return;
    }
    const content = fs.readFileSync(opts.requireFile, 'utf8');
    requiredKeys = requiredKeys.concat(parseRequireFile(content));
  }

  if (requiredKeys.length === 0) {
    log('warn', 'no required keys specified');
    return;
  }

  const { ok, missing } = requireKeys(envMap, requiredKeys);

  if (ok) {
    log('info', `all ${requiredKeys.length} required keys present`);
  } else {
    log('error', `${missing.length} required key(s) missing:`);
    formatMissingIssues(missing).forEach(line => log('error', line));
    process.exitCode = 1;
  }
}

module.exports = { parseRequireArgs, runRequireCommand };
