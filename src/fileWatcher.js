const fs = require('fs');
const path = require('path');
const { parseEnvFile } = require('./envParser');

const DEFAULT_DEBOUNCE_MS = 300;

/**
 * Creates a debounced version of a function
 * @param {Function} fn
 * @param {number} delay
 */
function debounce(fn, delay) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Watches a .env file for changes and invokes the callback with parsed env vars.
 *
 * @param {string} filePath - Absolute or relative path to the .env file
 * @param {Function} onChange - Called with (newVars, prevVars) on change
 * @param {object} [options]
 * @param {number} [options.debounceMs=300]
 * @returns {{ stop: Function }} - Object with a stop() method to unwatch
 */
function watchEnvFile(filePath, onChange, options = {}) {
  const resolvedPath = path.resolve(filePath);
  const debounceMs = options.debounceMs ?? DEFAULT_DEBOUNCE_MS;

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`envwatch: file not found: ${resolvedPath}`);
  }

  let prevVars = parseEnvFile(resolvedPath);

  const handleChange = debounce((eventType) => {
    if (eventType !== 'change') return;
    try {
      const newVars = parseEnvFile(resolvedPath);
      const prev = { ...prevVars };
      prevVars = newVars;
      onChange(newVars, prev);
    } catch (err) {
      // file may be mid-write; skip this tick
    }
  }, debounceMs);

  const watcher = fs.watch(resolvedPath, handleChange);

  return {
    stop() {
      watcher.close();
    },
    get currentVars() {
      return { ...prevVars };
    },
  };
}

module.exports = { watchEnvFile, debounce };
