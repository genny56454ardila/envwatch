// compareCommand.js — CLI command to compare two .env files

const path = require('path');
const { compareEnvFiles, summarizeComparison } = require('./envCompare');
const { log } = require('./logger');

/**
 * Parse CLI args for the compare command.
 * Expected: envwatch compare <fileA> <fileB> [--json]
 * @param {string[]} argv
 * @returns {{ fileA: string, fileB: string, json: boolean }}
 */
function parseCompareArgs(argv) {
  const args = argv.slice(2);
  const jsonFlag = args.includes('--json');
  const files = args.filter(a => !a.startsWith('--'));

  if (files.length < 2) {
    throw new Error('Usage: envwatch compare <fileA> <fileB> [--json]');
  }

  return {
    fileA: path.resolve(files[0]),
    fileB: path.resolve(files[1]),
    json: jsonFlag
  };
}

/**
 * Run the compare command.
 * @param {string[]} argv
 * @param {NodeJS.WriteStream} [out]
 */
function runCompareCommand(argv, out = process.stdout) {
  let opts;
  try {
    opts = parseCompareArgs(argv);
  } catch (err) {
    log('error', err.message);
    process.exitCode = 1;
    return;
  }

  let result;
  try {
    result = compareEnvFiles(opts.fileA, opts.fileB);
  } catch (err) {
    log('error', `Failed to compare files: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  if (opts.json) {
    out.write(JSON.stringify(result, null, 2) + '\n');
  } else {
    const summary = summarizeComparison(result);
    out.write(`Comparing:\n  A: ${opts.fileA}\n  B: ${opts.fileB}\n\n${summary}\n`);
  }
}

module.exports = { parseCompareArgs, runCompareCommand };
