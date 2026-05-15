/**
 * envRotate.js — utilities for rotating (cycling) env var values
 * across multiple .env files or environments.
 */

/**
 * Rotate a single key's value through a list of candidate values.
 * Returns the next value after the current one (wraps around).
 */
function rotateValue(current, candidates) {
  if (!Array.isArray(candidates) || candidates.length === 0) {
    throw new Error('candidates must be a non-empty array');
  }
  const idx = candidates.indexOf(current);
  if (idx === -1) return candidates[0];
  return candidates[(idx + 1) % candidates.length];
}

/**
 * Rotate a set of keys in an env map using a rotation spec.
 * spec: { KEY: [val1, val2, ...], ... }
 * Returns a new Map with rotated values.
 */
function rotateEnv(envMap, spec) {
  const result = new Map(envMap);
  for (const [key, candidates] of Object.entries(spec)) {
    if (result.has(key)) {
      result.set(key, rotateValue(result.get(key), candidates));
    }
  }
  return result;
}

/**
 * Apply a rotation spec to a parsed env map and return only changed entries.
 */
function getRotatedKeys(envMap, spec) {
  const rotated = rotateEnv(envMap, spec);
  const changed = {};
  for (const [key, newVal] of rotated) {
    if (envMap.get(key) !== newVal) {
      changed[key] = { from: envMap.get(key), to: newVal };
    }
  }
  return changed;
}

/**
 * Serialize a Map back to .env format.
 */
function serializeEnv(envMap) {
  return Array.from(envMap.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
}

module.exports = { rotateValue, rotateEnv, getRotatedKeys, serializeEnv };
