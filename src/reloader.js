/**
 * reloader.js
 * Orchestrates env change detection and process hot-reload.
 */

const { parseEnvFile } = require('./envParser');
const { diffEnv, hasChanges } = require('./diffEnv');
const { killCurrentProcess, spawnProcess, getCurrentProcess } = require('./processManager');
const { saveSnapshot, loadSnapshot } = require('./snapshotManager');
const { log } = require('./logger');
const { validateEnv } = require('./envValidator');

/**
 * Apply updated env vars to process.env and restart the child process.
 * @param {Object} newEnv
 * @param {string[]} command
 */
function applyEnvToProcess(newEnv, command) {
  Object.assign(process.env, newEnv);
  killCurrentProcess();
  spawnProcess(command, process.env);
}

/**
 * Handle a detected .env file change.
 * @param {string} envPath
 * @param {string[]} command
 * @param {Object} [schema] - optional validation schema
 */
async function handleEnvChange(envPath, command, schema) {
  try {
    const newEnv = await parseEnvFile(envPath);

    if (schema) {
      const { valid, errors } = validateEnv(newEnv, schema);
      if (!valid) {
        log('warn', 'Env validation failed — skipping reload:');
        errors.forEach(e => log('warn', `  ${e}`));
        return;
      }
    }

    const oldEnv = (await loadSnapshot()) || {};
    const diff = diffEnv(oldEnv, newEnv);

    if (!hasChanges(diff)) {
      log('info', 'No effective env changes detected.');
      return;
    }

    log('info', `Env changed — reloading process (${Object.keys(diff.added).length} added, ${Object.keys(diff.modified).length} modified, ${diff.removed.length} removed)`);
    await saveSnapshot(newEnv);
    applyEnvToProcess(newEnv, command);
  } catch (err) {
    log('error', `Failed to handle env change: ${err.message}`);
  }
}

/**
 * Start the reloader: spawn initial process and begin watching.
 * @param {Object} config
 * @param {Function} watchFn - watchEnvFile from fileWatcher
 */
function startReloader(config, watchFn) {
  const { envPath, command, schema } = config;
  log('info', `Starting envwatch on ${envPath}`);
  spawnProcess(command, process.env);
  watchFn(envPath, () => handleEnvChange(envPath, command, schema));
}

module.exports = { applyEnvToProcess, handleEnvChange, startReloader };
