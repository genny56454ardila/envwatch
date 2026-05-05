const { spawn } = require('child_process');

let currentProcess = null;

/**
 * Spawns a new child process with the given command and args.
 * @param {string} command
 * @param {string[]} args
 * @param {object} env - environment variables to inject
 * @returns {ChildProcess}
 */
function spawnProcess(command, args = [], env = {}) {
  const child = spawn(command, args, {
    env: { ...process.env, ...env },
    stdio: 'inherit',
    shell: true,
  });

  child.on('error', (err) => {
    console.error(`[envwatch] Failed to start process: ${err.message}`);
  });

  child.on('exit', (code, signal) => {
    if (signal !== 'SIGTERM' && signal !== 'SIGKILL') {
      console.log(`[envwatch] Process exited with code ${code}`);
    }
  });

  return child;
}

/**
 * Kills the currently running process if one exists.
 * @returns {Promise<void>}
 */
function killCurrentProcess() {
  return new Promise((resolve) => {
    if (!currentProcess || currentProcess.exitCode !== null) {
      currentProcess = null;
      return resolve();
    }

    currentProcess.once('exit', () => resolve());
    currentProcess.kill('SIGTERM');

    setTimeout(() => {
      if (currentProcess && currentProcess.exitCode === null) {
        currentProcess.kill('SIGKILL');
      }
    }, 3000);
  });
}

/**
 * Restarts the managed process with updated env vars.
 * @param {string} command
 * @param {string[]} args
 * @param {object} env
 */
async function restartProcess(command, args = [], env = {}) {
  console.log('[envwatch] Restarting process due to .env change...');
  await killCurrentProcess();
  currentProcess = spawnProcess(command, args, env);
  return currentProcess;
}

/**
 * Returns the currently managed child process.
 */
function getCurrentProcess() {
  return currentProcess;
}

module.exports = { spawnProcess, killCurrentProcess, restartProcess, getCurrentProcess };
