/**
 * reloader.js
 * Orchestrates watching a .env file, diffing changes,
 * optionally saving snapshots, and restarting the child process.
 */

const { watchEnvFile } = require('./fileWatcher');
const { diffEnv, hasChanges } = require('./diffEnv');
const { parseEnvFile } = require('./envParser');
const { killCurrentProcess, spawnProcess } = require('./processManager');
const { log } = require('./logger');
const { saveSnapshot } = require('./snapshotManager');

let previousEnv = {};

function applyEnvToProcess(envVars) {
  Object.assign(process.env, envVars);
}

function handleEnvChange(envFilePath, command, options = {}) {
  let currentEnv;
  try {
    currentEnv = parseEnvFile(envFilePath);
  } catch (err) {
    log('error', `Failed to parse ${envFilePath}: ${err.message}`);
    return;
  }

  const diff = diffEnv(previousEnv, currentEnv);

  if (!hasChanges(diff)) {
    log('info', 'No meaningful .env changes detected, skipping reload.');
    return;
  }

  log('info', `Detected .env changes: +${diff.added.length} added, ~${diff.changed.length} changed, -${diff.removed.length} removed`);

  if (options.snapshots) {
    try {
      const raw = require('fs').readFileSync(envFilePath, 'utf8');
      saveSnapshot(raw);
      log('debug', 'Snapshot saved before reload.');
    } catch (err) {
      log('warn', `Could not save snapshot: ${err.message}`);
    }
  }

  applyEnvToProcess(currentEnv);
  previousEnv = { ...currentEnv };

  killCurrentProcess(() => {
    log('info', `Restarting: ${command.join(' ')}`);
    spawnProcess(command, process.env);
  });
}

function startReloader(envFilePath, command, options = {}) {
  try {
    previousEnv = parseEnvFile(envFilePath);
  } catch (_) {
    previousEnv = {};
  }

  applyEnvToProcess(previousEnv);
  log('info', `Watching ${envFilePath} for changes...`);
  spawnProcess(command, process.env);

  watchEnvFile(envFilePath, () => {
    handleEnvChange(envFilePath, command, options);
  });
}

module.exports = { startReloader, handleEnvChange };
