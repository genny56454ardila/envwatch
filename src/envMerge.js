/**
 * envMerge.js
 * Merges multiple .env sources with priority and conflict resolution.
 */

/**
 * Merge multiple env objects in order of priority (last wins).
 * @param {...Object} sources - env key/value objects
 * @returns {{ merged: Object, conflicts: Array }}
 */
function mergeEnvs(...sources) {
  const merged = {};
  const conflicts = [];
  const seen = {};

  for (const source of sources) {
    for (const [key, value] of Object.entries(source)) {
      if (key in seen && seen[key] !== value) {
        conflicts.push({ key, previous: seen[key], current: value });
      }
      merged[key] = value;
      seen[key] = value;
    }
  }

  return { merged, conflicts };
}

/**
 * Merge with explicit priority map: higher number = higher priority.
 * @param {Array<{ env: Object, priority: number }>} sources
 * @returns {{ merged: Object, conflicts: Array }}
 */
function mergeWithPriority(sources) {
  const sorted = [...sources].sort((a, b) => a.priority - b.priority);
  return mergeEnvs(...sorted.map((s) => s.env));
}

/**
 * Returns only the keys that differ between two env objects.
 * @param {Object} base
 * @param {Object} override
 * @returns {Object}
 */
function overrideKeys(base, override) {
  const result = {};
  for (const [key, value] of Object.entries(override)) {
    if (base[key] !== value) {
      result[key] = value;
    }
  }
  return result;
}

module.exports = { mergeEnvs, mergeWithPriority, overrideKeys };
