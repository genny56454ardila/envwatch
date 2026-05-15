/**
 * placeholderCommand.js
 * CLI command to scan a .env file for unresolved placeholder values.
 */

const path = require('path');
const { parseEnvFile } = require('./envParser');
const { findPlaceholders, hasPlaceholders, formatPlaceholderIssues } = require('./envPlaceholder');
const { log } = require('./logger');

/**
 * @param {string[]} argv
 * @returns {{ file: string, strict: boolean }}
 */
function parsePlaceholderArgs(argv) {
  const args = argv.slice(2);
  let file = '.env';
  let strict = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' || args[i] === '-f') {
      file = args[++i];
    } else if (args[i] === '--strict') {
      strict = true;
    } else if (!args[i].startsWith('-')) {
      file = args[i];
    }
  }

  return { file: path.resolve(file), strict };
}

/**
 * @param {string[]} argv
 * @param {{ exit?: Function }} opts
 */
async function runPlaceholderCommand(argv, opts = {}) {
  const exitFn = opts.exit || process.exit;
  const { file, strict } = parsePlaceholderArgs(argv);

  let envMap;
  try {
    envMap = parseEnvFile(file);
  } catch (err) {
    log('error', `Could not read file: ${file} — ${err.message}`);
    return exitFn(1);
  }

  const findings = findPlaceholders(envMap);

  if (findings.length === 0) {
    log('info', `No placeholder values found in ${path.basename(file)}.`);
    return exitFn(0);
  }

  log('warn', `Found ${findings.length} placeholder(s) in ${path.basename(file)}:`);
  const lines = formatPlaceholderIssues(findings);
  lines.forEach((line) => console.log(line));

  if (strict) {
    log('error', 'Strict mode: placeholders must be resolved before continuing.');
    return exitFn(1);
  }

  return exitFn(0);
}

module.exports = { parsePlaceholderArgs, runPlaceholderCommand };
