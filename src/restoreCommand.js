// restoreCommand.js — CLI command for restoring .env from snapshot

const path = require('path');
const { restoreSnapshot, previewRestore } = require('./envRestore');
const { listSnapshots } = require('./snapshotManager');
const { log } = require('./logger');

function parseRestoreArgs(argv) {
  const args = argv.slice(2);
  const opts = {
    tag: null,
    output: '.env',
    preview: false,
    list: false,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output' || args[i] === '-o') {
      opts.output = args[++i];
    } else if (args[i] === '--preview' || args[i] === '-p') {
      opts.preview = true;
    } else if (args[i] === '--list' || args[i] === '-l') {
      opts.list = true;
    } else if (!opts.tag) {
      opts.tag = args[i];
    }
  }

  return opts;
}

function runRestoreCommand(argv) {
  const opts = parseRestoreArgs(argv);

  if (opts.list) {
    const snapshots = listSnapshots();
    if (!snapshots || snapshots.length === 0) {
      log('warn', 'No snapshots found.');
      return;
    }
    console.log('Available snapshots:');
    snapshots.forEach((s, i) => console.log(`  [${i}] ${s}`));
    return;
  }

  if (!opts.tag && opts.tag !== 0) {
    log('error', 'Usage: envwatch restore <tag|index> [--output <file>] [--preview] [--list]');
    process.exit(1);
  }

  if (opts.preview) {
    const { tag, envMap } = previewRestore(opts.tag);
    console.log(`Preview of snapshot "${tag}":`);
    Object.entries(envMap).forEach(([k, v]) => console.log(`  ${k}=${v}`));
    return;
  }

  const result = restoreSnapshot(opts.tag, path.resolve(opts.output));
  console.log(`✔ Restored ${result.entries} keys from "${result.tag}" to ${opts.output}`);
}

module.exports = { parseRestoreArgs, runRestoreCommand };
