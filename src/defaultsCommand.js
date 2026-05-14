/**
 * defaultsCommand.js
 * CLI command: apply defaults from a JSON or .env file to a target .env file.
 */

const fs = require('fs');
const path = require('path');
const { parseEnvContent } = require('./envParser');
const { applyDefaults, missingKeys, defaultsFromObject, serializeEnv } = require('./envDefaults');
const { log } = require('./logger');

function parseDefaultsArgs(argv) {
  const args = { target: '.env', defaultsFile: null, output: null, preview: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--target' || argv[i] === '-t') args.target = argv[++i];
    else if (argv[i] === '--defaults' || argv[i] === '-d') args.defaultsFile = argv[++i];
    else if (argv[i] === '--output' || argv[i] === '-o') args.output = argv[++i];
    else if (argv[i] === '--preview') args.preview = true;
  }
  return args;
}

function loadDefaultsFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const raw = fs.readFileSync(filePath, 'utf8');
  if (ext === '.json') {
    return defaultsFromObject(JSON.parse(raw));
  }
  // treat as .env format
  return parseEnvContent(raw);
}

function runDefaultsCommand(argv) {
  const args = parseDefaultsArgs(argv);

  if (!args.defaultsFile) {
    log('error', 'defaults', '--defaults <file> is required');
    process.exit(1);
  }

  const targetRaw = fs.existsSync(args.target) ? fs.readFileSync(args.target, 'utf8') : '';
  const envMap = parseEnvContent(targetRaw);
  const defaults = loadDefaultsFile(args.defaultsFile);

  const missing = missingKeys(envMap, defaults);
  if (missing.length === 0) {
    log('info', 'defaults', 'No missing keys — nothing to apply.');
    return;
  }

  log('info', 'defaults', `Applying ${missing.length} default(s): ${missing.join(', ')}`);

  if (args.preview) {
    for (const key of missing) {
      log('info', 'defaults', `  ${key}=${defaults.get(key)}`);
    }
    return;
  }

  const merged = applyDefaults(envMap, defaults);
  const output = serializeEnv(merged);
  const dest = args.output || args.target;
  fs.writeFileSync(dest, output + '\n', 'utf8');
  log('info', 'defaults', `Written to ${dest}`);
}

module.exports = { parseDefaultsArgs, runDefaultsCommand };
