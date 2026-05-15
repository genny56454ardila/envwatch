/**
 * inheritCommand.js
 * CLI command: envwatch inherit <base> <child> [--output <file>]
 * Merges a base .env with a child .env, printing or writing the result.
 */

const fs = require('fs');
const { inheritEnvFiles, inheritedKeys, overriddenKeys } = require('./envInherit');
const { parseEnvContent } = require('./envParser');
const { log } = require('./logger');

function parseInheritArgs(argv) {
  const args = argv.slice(2);
  const opts = { base: null, child: null, output: null, verbose: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output' || args[i] === '-o') {
      opts.output = args[++i];
    } else if (args[i] === '--verbose' || args[i] === '-v') {
      opts.verbose = true;
    } else if (!opts.base) {
      opts.base = args[i];
    } else if (!opts.child) {
      opts.child = args[i];
    }
  }
  return opts;
}

function serializeEnv(map) {
  return [...map.entries()].map(([k, v]) => `${k}=${v}`).join('\n') + '\n';
}

function runInheritCommand(argv = process.argv) {
  const opts = parseInheritArgs(argv);

  if (!opts.base || !opts.child) {
    log('error', 'Usage: envwatch inherit <base> <child> [--output <file>] [--verbose]');
    process.exitCode = 1;
    return;
  }

  let merged;
  try {
    merged = inheritEnvFiles(opts.base, opts.child);
  } catch (err) {
    log('error', `Failed to read env files: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  if (opts.verbose) {
    const baseContent = fs.readFileSync(opts.base, 'utf8');
    const childContent = fs.readFileSync(opts.child, 'utf8');
    const baseMap = parseEnvContent(baseContent);
    const childMap = parseEnvContent(childContent);
    const inherited = inheritedKeys(baseMap, childMap);
    const overridden = overriddenKeys(baseMap, childMap);
    log('info', `Inherited from base (${inherited.length}): ${inherited.join(', ') || 'none'}`);
    log('info', `Overridden by child (${overridden.length}): ${overridden.join(', ') || 'none'}`);
    log('info', `New keys in child: ${[...childMap.keys()].filter(k => !baseMap.has(k)).join(', ') || 'none'}`);
  }

  const output = serializeEnv(merged);

  if (opts.output) {
    fs.writeFileSync(opts.output, output, 'utf8');
    log('success', `Merged env written to ${opts.output}`);
  } else {
    process.stdout.write(output);
  }
}

module.exports = { parseInheritArgs, runInheritCommand };
