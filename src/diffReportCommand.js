// diffReportCommand.js — CLI sub-command to compare two .env files

const path = require('path');
const { parseEnvFile } = require('./envParser');
const { generateDiffReport, printDiffReport } = require('./diffReporter');
const { log } = require('./logger');

/**
 * Parse args for the diff-report sub-command.
 * Expected: envwatch diff-report <file1> <file2> [--json]
 * @param {string[]} argv
 * @returns {{ file1: string, file2: string, json: boolean }}
 */
function parseDiffReportArgs(argv = []) {
  const args = argv.slice();
  const jsonFlag = args.includes('--json');
  const files = args.filter(a => !a.startsWith('--'));

  if (files.length < 2) {
    throw new Error('diff-report requires two .env file paths');
  }

  return {
    file1: path.resolve(files[0]),
    file2: path.resolve(files[1]),
    json: jsonFlag,
  };
}

/**
 * Run the diff-report command.
 * @param {string[]} argv
 */
async function runDiffReportCommand(argv = []) {
  let opts;
  try {
    opts = parseDiffReportArgs(argv);
  } catch (err) {
    log('error', err.message);
    log('info', 'Usage: envwatch diff-report <file1> <file2> [--json]');
    process.exitCode = 1;
    return;
  }

  let prev, next;
  try {
    prev = parseEnvFile(opts.file1);
  } catch (err) {
    log('error', `Could not read ${opts.file1}: ${err.message}`);
    process.exitCode = 1;
    return;
  }
  try {
    next = parseEnvFile(opts.file2);
  } catch (err) {
    log('error', `Could not read ${opts.file2}: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  const report = generateDiffReport(prev, next);

  if (opts.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printDiffReport(report);
  }
}

module.exports = { parseDiffReportArgs, runDiffReportCommand };
