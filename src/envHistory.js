/**
 * envHistory.js
 * Tracks a rolling history of env diffs for debugging and audit purposes.
 */

const MAX_HISTORY = 50;

let history = [];

/**
 * Record a new diff event into history.
 * @param {Object} diff - result from diffEnv()
 * @param {string} envFile - path to the .env file
 */
function recordChange(diff, envFile) {
  const entry = {
    timestamp: Date.now(),
    envFile,
    added: { ...diff.added },
    removed: { ...diff.removed },
    changed: { ...diff.changed },
  };
  history.push(entry);
  if (history.length > MAX_HISTORY) {
    history.shift();
  }
  return entry;
}

/**
 * Get all recorded history entries.
 * @returns {Array}
 */
function getHistory() {
  return [...history];
}

/**
 * Get the most recent N entries.
 * @param {number} n
 * @returns {Array}
 */
function getRecentHistory(n = 10) {
  return history.slice(-n);
}

/**
 * Clear all history.
 */
function clearHistory() {
  history = [];
}

/**
 * Return total number of recorded events.
 * @returns {number}
 */
function historySize() {
  return history.length;
}

module.exports = {
  recordChange,
  getHistory,
  getRecentHistory,
  clearHistory,
  historySize,
  MAX_HISTORY,
};
