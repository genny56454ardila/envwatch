/**
 * filterCommand.js — CLI command to filter .env file keys and print results
 */

const { parseEnvFile } = require('./envParser');
const { applyFilters } = require('./envFilter');
const { log } = require('./logger');

/**
 * Parse CLI args for the filter command
 * @param {string[]} argv
 * @returns {{ file: string, prefix?: string, pattern?: string, keys?: string[], exclude?: string[] }}
 */
function parseFilterArgs(argv) {
  const args = argv.slice(2);
  const opts = { file: '.env' };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--file':    opts.file    = args[++i]; break;
      case '--prefix':  opts.prefix  = args[++i]; break;
      case '--pattern': opts.pattern = args[++i]; break;
      case '--keys':    opts.keys    = args[++i].split(',').map(k => k.trim()); break;
      case '--exclude': opts.exclude = args[++i].split(',').map(k => k.trim()); break;
    }
  }

  return opts;
}

/**
 * Run the filter command
 * @param {string[]} argv
 */
function runFilterCommand(argv) {
  const opts = parseFilterArgs(argv);

  let envMap;
  try {
    envMap = parseEnvFile(opts.file);
  } catch (err) {
    log('error', `Cannot read env file: ${opts.file} — ${err.message}`);
    process.exit(1);
  }

  const filtered = applyFilters(envMap, {
    prefix:  opts.prefix,
    pattern: opts.pattern,
    keys:    opts.keys,
    exclude: opts.exclude,
  });

  const entries = Object.entries(filtered);

  if (entries.length === 0) {
    log('warn', 'No matching keys found.');
    return;
  }

  log('info', `Matched ${entries.length} key(s) from ${opts.file}:`);
  for (const [key, value] of entries) {
    console.log(`${key}=${value}`);
  }
}

module.exports = { parseFilterArgs, runFilterCommand };
