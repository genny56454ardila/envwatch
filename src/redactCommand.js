// redactCommand.js — CLI command to print a redacted version of a .env file

const fs = require('fs');
const path = require('path');
const { parseEnvFile } = require('./envParser');
const { redactEnv, listRedactedKeys, serializeRedacted } = require('./envRedact');
const { log } = require('./logger');

/**
 * @param {string[]} argv
 * @returns {{ envFile: string, output: string|null, showKeys: boolean }}
 */
function parseRedactArgs(argv) {
  const args = argv.slice(2);
  let envFile = '.env';
  let output = null;
  let showKeys = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' || args[i] === '-f') {
      envFile = args[++i];
    } else if (args[i] === '--output' || args[i] === '-o') {
      output = args[++i];
    } else if (args[i] === '--show-keys') {
      showKeys = true;
    }
  }

  return { envFile, output, showKeys };
}

/**
 * Run the redact command.
 * @param {string[]} argv
 */
function runRedactCommand(argv) {
  const { envFile, output, showKeys } = parseRedactArgs(argv);
  const resolved = path.resolve(envFile);

  if (!fs.existsSync(resolved)) {
    log('error', `File not found: ${resolved}`);
    process.exit(1);
  }

  const envMap = parseEnvFile(resolved);
  const redacted = redactEnv(envMap);
  const serialized = serializeRedacted(redacted);

  if (showKeys) {
    const keys = listRedactedKeys(envMap);
    if (keys.length === 0) {
      log('info', 'No sensitive keys found.');
    } else {
      log('info', `Redacted keys: ${keys.join(', ')}`);
    }
  }

  if (output) {
    const outPath = path.resolve(output);
    try {
      fs.writeFileSync(outPath, serialized + '\n', 'utf8');
      log('success', `Redacted env written to ${outPath}`);
    } catch (err) {
      log('error', `Failed to write output file: ${err.message}`);
      process.exit(1);
    }
  } else {
    process.stdout.write(serialized + '\n');
  }
}

module.exports = { parseRedactArgs, runRedactCommand };
