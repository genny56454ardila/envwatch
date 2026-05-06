/**
 * mergeCommand.js
 * CLI sub-command: merge multiple .env files and output result.
 */

const path = require('path');
const fs = require('fs');
const { parseEnvFile } = require('./envParser');
const { mergeEnvs, mergeWithPriority } = require('./envMerge');
const { log } = require('./logger');

function parseMergeArgs(argv) {
  const args = argv.slice(2);
  const files = [];
  let output = null;
  let usePriority = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output' || args[i] === '-o') {
      output = args[++i];
    } else if (args[i] === '--priority') {
      usePriority = true;
    } else {
      files.push(args[i]);
    }
  }

  return { files, output, usePriority };
}

function runMergeCommand(argv) {
  const { files, output, usePriority } = parseMergeArgs(argv);

  if (files.length < 2) {
    log('error', 'merge requires at least two .env files');
    process.exit(1);
  }

  let result;
  if (usePriority) {
    const sources = files.map((f, i) => ({
      env: parseEnvFile(path.resolve(f)),
      priority: i + 1,
    }));
    result = mergeWithPriority(sources);
  } else {
    const envs = files.map((f) => parseEnvFile(path.resolve(f)));
    result = mergeEnvs(...envs);
  }

  const { merged, conflicts } = result;

  if (conflicts.length > 0) {
    log('warn', `${conflicts.length} conflict(s) resolved (last-wins):`);
    for (const c of conflicts) {
      log('warn', `  ${c.key}: "${c.previous}" -> "${c.current}"`);
    }
  }

  const lines = Object.entries(merged).map(([k, v]) => `${k}=${v}`);
  const content = lines.join('\n') + '\n';

  if (output) {
    fs.writeFileSync(path.resolve(output), content, 'utf8');
    log('info', `Merged env written to ${output}`);
  } else {
    process.stdout.write(content);
  }
}

module.exports = { parseMergeArgs, runMergeCommand };
