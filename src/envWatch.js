// envWatch.js — high-level orchestration of watch + reload + diff reporting
'use strict';

const { watchEnvFile } = require('./fileWatcher');
const { parseEnvFile } = require('./envParser');
const { diffEnv, hasChanges } = require('./diffEnv');
const { applyEnvToProcess, startReloader } = require('./reloader');
const { recordChange } = require('./envHistory');
const { log } = require('./logger');
const { saveSnapshot } = require('./snapshotManager');

let _currentEnv = {};
let _options = {};

/**
 * Called each time the .env file changes on disk.
 */
async function handleEnvChange(envPath) {
  let nextEnv;
  try {
    nextEnv = await parseEnvFile(envPath);
  } catch (err) {
    log('error', `Failed to parse ${envPath}: ${err.message}`);
    return;
  }

  const diff = diffEnv(_currentEnv, nextEnv);

  if (!hasChanges(diff)) {
    log('info', 'env file touched but no effective changes detected');
    return;
  }

  log('info', `env changed — added:${diff.added.length} removed:${diff.removed.length} modified:${diff.modified.length}`);

  recordChange({ path: envPath, diff, timestamp: Date.now() });

  if (_options.snapshot) {
    try {
      await saveSnapshot(envPath, nextEnv);
    } catch (err) {
      log('warn', `snapshot save failed: ${err.message}`);
    }
  }

  _currentEnv = nextEnv;

  if (_options.reload !== false) {
    applyEnvToProcess(nextEnv);
  }
}

/**
 * Start watching an env file and optionally spawn/reload the child process.
 * @param {string} envPath
 * @param {object} opts
 * @param {string} [opts.command]   child command to run
 * @param {boolean} [opts.reload]   default true
 * @param {boolean} [opts.snapshot] save snapshot on each change
 * @returns {Function} stop — call to unwatch
 */
async function startEnvWatch(envPath, opts = {}) {
  _options = opts;

  try {
    _currentEnv = await parseEnvFile(envPath);
  } catch (_) {
    _currentEnv = {};
  }

  if (opts.command) {
    startReloader(opts.command, _currentEnv);
  }

  const stop = watchEnvFile(envPath, () => handleEnvChange(envPath));
  log('info', `watching ${envPath}`);
  return stop;
}

module.exports = { startEnvWatch, handleEnvChange };
