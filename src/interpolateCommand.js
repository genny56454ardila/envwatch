const fs = require('fs');
const path = require('path');
const { parseEnvFile } = require('./envParser');
const { interpolateEnv, findUnresolved } = require('./envInterpolate');
const { log } = require('./logger');

/**
 * @param {string[]} argv
 * @returns {{ input: string, output: string|null, check: boolean, silent: boolean }}
 */
function parseInterpolateArgs(argv) {
  const args = argv.slice(2);
  const opts = { input: '.env', output: null, check: false, silent: false };
  for (let i = 0; i < args.length; i++) {
    if ((args[i] === '--input' || args[i] === '-i') && args[i + 1]) {
      opts.input = args[++i];
    } else if ((args[i] === '--output' || args[i] === '-o') && args[i + 1]) {
      opts.output = args[++i];
    } else if (args[i] === '--check') {
      opts.check = true;
    } else if (args[i] === '--silent') {
      opts.silent = true;
    }
  }
  return opts;
}

/**
 * Serialize a Map back to .env format.
 * @param {Map<string,string>} envMap
 * @returns {string}
 */
function serializeEnv(envMap) {
  const lines = [];
  for (const [key, value] of envMap) {
    const needsQuotes = /\s|#|"/.test(value);
    lines.push(`${key}=${needsQuotes ? `"${value.replace(/"/g, '\\"')}"` : value}`);
  }
  return lines.join('\n') + '\n';
}

function runInterpolateCommand(argv = process.argv) {
  const opts = parseInterpolateArgs(argv);
  const inputPath = path.resolve(opts.input);

  if (!fs.existsSync(inputPath)) {
    log('error', `File not found: ${inputPath}`);
    process.exit(1);
  }

  const envMap = parseEnvFile(inputPath);
  const interpolated = interpolateEnv(envMap);
  const unresolved = findUnresolved(envMap);

  if (opts.check) {
    if (unresolved.length > 0) {
      log('warn', `Unresolved references in: ${unresolved.join(', ')}`);
      process.exit(1);
    }
    if (!opts.silent) log('info', 'All references resolved successfully.');
    return;
  }

  if (unresolved.length > 0 && !opts.silent) {
    log('warn', `Unresolved references in: ${unresolved.join(', ')}`);
  }

  const output = serializeEnv(interpolated);

  if (opts.output) {
    fs.writeFileSync(path.resolve(opts.output), output, 'utf8');
    if (!opts.silent) log('info', `Written to ${opts.output}`);
  } else {
    process.stdout.write(output);
  }
}

module.exports = { parseInterpolateArgs, serializeEnv, runInterpolateCommand };
