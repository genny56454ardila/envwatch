const fs = require('fs');
const path = require('path');
const { log } = require('./logger');

const DEFAULT_CONFIG = {
  envFile: '.env',
  debounceMs: 300,
  restartDelay: 100,
  watch: true,
  verbose: false,
  signal: 'SIGTERM',
};

const SUPPORTED_SIGNALS = ['SIGTERM', 'SIGKILL', 'SIGHUP'];

function validateConfig(config) {
  const errors = [];

  if (typeof config.debounceMs !== 'number' || config.debounceMs < 0) {
    errors.push('debounceMs must be a non-negative number');
  }

  if (typeof config.restartDelay !== 'number' || config.restartDelay < 0) {
    errors.push('restartDelay must be a non-negative number');
  }

  if (!SUPPORTED_SIGNALS.includes(config.signal)) {
    errors.push(`signal must be one of: ${SUPPORTED_SIGNALS.join(', ')}`);
  }

  if (typeof config.envFile !== 'string' || config.envFile.trim() === '') {
    errors.push('envFile must be a non-empty string');
  }

  return errors;
}

function loadConfigFile(configPath) {
  if (!fs.existsSync(configPath)) {
    return {};
  }

  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    log('warn', `Could not parse config file at ${configPath}: ${err.message}`);
    return {};
  }
}

function resolveConfig(cliOptions = {}) {
  const configFilePath = path.resolve(
    cliOptions.config || 'envwatch.config.json'
  );

  const fileConfig = loadConfigFile(configFilePath);
  const merged = Object.assign({}, DEFAULT_CONFIG, fileConfig, cliOptions);

  // Resolve envFile relative to cwd
  merged.envFile = path.resolve(merged.envFile);

  const errors = validateConfig(merged);
  if (errors.length > 0) {
    throw new Error(`Invalid envwatch config:\n  - ${errors.join('\n  - ')}`);
  }

  return merged;
}

module.exports = { resolveConfig, validateConfig, loadConfigFile, DEFAULT_CONFIG };
