const { watchEnvFile } = require('./fileWatcher');
const { parseEnvFile } = require('./envParser');
const { diffEnv, hasChanges } = require('./diffEnv');
const { restartProcess } = require('./processManager');

/**
 * Starts the envwatch reloader.
 * Watches the given .env file and restarts the target process on changes.
 *
 * @param {object} options
 * @param {string} options.envPath - path to the .env file
 * @param {string} options.command - command to run
 * @param {string[]} [options.args] - command arguments
 * @param {number} [options.debounceMs] - debounce delay in ms (default 300)
 */
function startReloader({ envPath, command, args = [], debounceMs = 300 }) {
  if (!envPath) throw new Error('[envwatch] envPath is required');
  if (!command) throw new Error('[envwatch] command is required');

  let previousEnv = parseEnvFile(envPath);

  console.log(`[envwatch] Watching ${envPath} for changes...`);

  // Initial process start
  restartProcess(command, args, previousEnv);

  const stopWatching = watchEnvFile(
    envPath,
    () => {
      let nextEnv;
      try {
        nextEnv = parseEnvFile(envPath);
      } catch (err) {
        console.error(`[envwatch] Failed to parse ${envPath}: ${err.message}`);
        return;
      }

      const diff = diffEnv(previousEnv, nextEnv);

      if (!hasChanges(diff)) {
        return;
      }

      console.log('[envwatch] Detected .env changes:');
      if (diff.added.length)   console.log('  added:  ', diff.added);
      if (diff.removed.length) console.log('  removed:', diff.removed);
      if (diff.changed.length) console.log('  changed:', diff.changed);

      previousEnv = nextEnv;
      restartProcess(command, args, nextEnv);
    },
    debounceMs
  );

  return stopWatching;
}

module.exports = { startReloader };
