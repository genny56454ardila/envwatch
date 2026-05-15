/**
 * condenseCommand.js
 * CLI handler for the `condense` subcommand.
 * Usage: envwatch condense [--input .env] [--output .env.condensed] [--keep-empty] [--dry-run]
 */

const path = require('path');
const { condenseFile, condenseEnv, serializeCondensed } = require('./envCondense');
const { parseEnvFile } = require('./envParser');
const { log } = require('./logger');

function parseCondenseArgs(argv) {
  const args = {
    input: '.env',
    output: null,
    keepEmpty: false,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--input' || arg === '-i') {
      args.input = argv[++i];
    } else if (arg === '--output' || arg === '-o') {
      args.output = argv[++i];
    } else if (arg === '--keep-empty') {
      args.keepEmpty = true;
    } else if (arg === '--dry-run') {
      args.dryRun = true;
    }
  }

  if (!args.output) {
    const ext = path.extname(args.input);
    const base = path.basename(args.input, ext);
    const dir = path.dirname(args.input);
    args.output = path.join(dir, `${base}.condensed${ext}`);
  }

  return args;
}

function runCondenseCommand(argv) {
  const args = parseCondenseArgs(argv);

  let before;
  try {
    before = parseEnvFile(args.input);
  } catch (err) {
    log('error', `Failed to read input file: ${err.message}`);
    process.exit(1);
  }

  const after = condenseEnv(before, { keepEmpty: args.keepEmpty });
  const removed = before.size - after.size;

  if (args.dryRun) {
    log('info', `[dry-run] Would remove ${removed} entr${removed === 1 ? 'y' : 'ies'} from ${args.input}`);
    log('info', `[dry-run] Output would be written to ${args.output}`);
    process.stdout.write(serializeCondensed(after));
    return;
  }

  condenseFile(args.input, args.output, { keepEmpty: args.keepEmpty });
  log('success', `Condensed ${args.input} → ${args.output} (removed ${removed} entr${removed === 1 ? 'y' : 'ies'})`);
}

module.exports = { parseCondenseArgs, runCondenseCommand };
