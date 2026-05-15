/**
 * normalizeCommand.js
 * CLI command: normalize a .env file in-place or print to stdout.
 */

const fs = require('fs');
const path = require('path');
const { parseEnvFile } = require('./envParser');
const { normalizeEnv, serializeNormalized } = require('./envNormalize');
const { log } = require('./logger');

/**
 * Parse CLI args for the normalize command.
 * Usage: normalize [--file <path>] [--no-keys] [--no-quotes] [--no-trim] [--write] [--dry-run]
 * @param {string[]} argv
 * @returns {object}
 */
function parseNormalizeArgs(argv) {
  const args = {
    file: '.env',
    normalizeKeys: true,
    quoteSpaces: true,
    trimEntries: true,
    write: false,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--file' && argv[i + 1]) args.file = argv[++i];
    else if (arg === '--no-keys') args.normalizeKeys = false;
    else if (arg === '--no-quotes') args.quoteSpaces = false;
    else if (arg === '--no-trim') args.trimEntries = false;
    else if (arg === '--write') args.write = true;
    else if (arg === '--dry-run') args.dryRun = true;
  }

  return args;
}

/**
 * Run the normalize command.
 * @param {string[]} argv
 */
function runNormalizeCommand(argv) {
  const args = parseNormalizeArgs(argv);
  const filePath = path.resolve(args.file);

  if (!fs.existsSync(filePath)) {
    log('error', `File not found: ${filePath}`);
    process.exit(1);
  }

  const envMap = parseEnvFile(filePath);
  const normalized = normalizeEnv(envMap, {
    normalizeKeys: args.normalizeKeys,
    quoteSpaces: args.quoteSpaces,
    trimEntries: args.trimEntries,
  });
  const output = serializeNormalized(normalized);

  if (args.dryRun) {
    log('info', '[dry-run] Normalized output:');
    process.stdout.write(output);
    return;
  }

  if (args.write) {
    fs.writeFileSync(filePath, output, 'utf8');
    log('info', `Normalized and wrote: ${filePath}`);
  } else {
    process.stdout.write(output);
  }
}

module.exports = { parseNormalizeArgs, runNormalizeCommand };
