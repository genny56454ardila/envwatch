// patchCommand.js — CLI interface for env patching
const fs = require('fs');
const { applyPatch, removeKeys, renameKey, serializePatch } = require('./envPatch');
const { parseEnvFile } = require('./envParser');
const { log } = require('./logger');

/**
 * Parse patch command args.
 * Usage: patch <envFile> [--set KEY=VALUE...] [--remove KEY...] [--rename OLD:NEW...] [--dry-run]
 */
function parsePatchArgs(argv) {
  const args = argv.slice(2);
  const opts = {
    file: null,
    set: {},
    remove: [],
    rename: {},
    dryRun: false,
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    if (arg === '--dry-run') {
      opts.dryRun = true;
    } else if (arg === '--set') {
      i++;
      while (i < args.length && !args[i].startsWith('--')) {
        const [key, ...rest] = args[i].split('=');
        opts.set[key.trim()] = rest.join('=');
        i++;
      }
      continue;
    } else if (arg === '--remove') {
      i++;
      while (i < args.length && !args[i].startsWith('--')) {
        opts.remove.push(args[i].trim());
        i++;
      }
      continue;
    } else if (arg === '--rename') {
      i++;
      while (i < args.length && !args[i].startsWith('--')) {
        const [oldKey, newKey] = args[i].split(':');
        if (oldKey && newKey) opts.rename[oldKey.trim()] = newKey.trim();
        i++;
      }
      continue;
    } else if (!arg.startsWith('--') && !opts.file) {
      opts.file = arg;
    }
    i++;
  }
  return opts;
}

function runPatchCommand(opts) {
  if (!opts.file) {
    log('error', 'patch', 'No env file specified');
    process.exit(1);
  }
  if (!fs.existsSync(opts.file)) {
    log('error', 'patch', `File not found: ${opts.file}`);
    process.exit(1);
  }

  let envMap = parseEnvFile(opts.file);
  envMap = applyPatch(envMap, opts.set);
  if (opts.remove.length) envMap = removeKeys(envMap, opts.remove);
  for (const [oldKey, newKey] of Object.entries(opts.rename)) {
    envMap = renameKey(envMap, oldKey, newKey);
  }

  const serialized = serializePatch(envMap);

  if (opts.dryRun) {
    log('info', 'patch', 'Dry run output:');
    process.stdout.write(serialized);
  } else {
    fs.writeFileSync(opts.file, serialized, 'utf8');
    log('info', 'patch', `Patched ${opts.file}`);
  }

  return envMap;
}

module.exports = { parsePatchArgs, runPatchCommand };
