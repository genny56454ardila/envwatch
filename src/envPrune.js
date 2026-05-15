/**
 * envPrune.js
 * Remove unused or duplicate keys from an env map based on a reference set.
 */

/**
 * Remove keys not present in the allowed set.
 * @param {Map<string,string>} envMap
 * @param {string[]} allowedKeys
 * @returns {Map<string,string>}
 */
function pruneByAllowedKeys(envMap, allowedKeys) {
  const allowed = new Set(allowedKeys);
  const result = new Map();
  for (const [k, v] of envMap) {
    if (allowed.has(k)) result.set(k, v);
  }
  return result;
}

/**
 * Remove keys whose values are empty strings or whitespace-only.
 * @param {Map<string,string>} envMap
 * @returns {Map<string,string>}
 */
function pruneEmpty(envMap) {
  const result = new Map();
  for (const [k, v] of envMap) {
    if (v.trim() !== '') result.set(k, v);
  }
  return result;
}

/**
 * Remove keys that appear in the reference map with identical values.
 * Useful for stripping keys that haven't changed from a base env.
 * @param {Map<string,string>} envMap
 * @param {Map<string,string>} referenceMap
 * @returns {Map<string,string>}
 */
function pruneUnchanged(envMap, referenceMap) {
  const result = new Map();
  for (const [k, v] of envMap) {
    if (!referenceMap.has(k) || referenceMap.get(k) !== v) {
      result.set(k, v);
    }
  }
  return result;
}

/**
 * List keys that were pruned (present in original but not in pruned result).
 * @param {Map<string,string>} original
 * @param {Map<string,string>} pruned
 * @returns {string[]}
 */
function listPruned(original, pruned) {
  const removed = [];
  for (const k of original.keys()) {
    if (!pruned.has(k)) removed.push(k);
  }
  return removed;
}

/**
 * Apply all pruning operations based on options.
 * @param {Map<string,string>} envMap
 * @param {{ allowedKeys?: string[], pruneEmpty?: boolean, referenceMap?: Map<string,string> }} opts
 * @returns {Map<string,string>}
 */
function pruneEnv(envMap, opts = {}) {
  let result = new Map(envMap);
  if (opts.allowedKeys && opts.allowedKeys.length > 0) {
    result = pruneByAllowedKeys(result, opts.allowedKeys);
  }
  if (opts.pruneEmpty) {
    result = pruneEmpty(result);
  }
  if (opts.referenceMap) {
    result = pruneUnchanged(result, opts.referenceMap);
  }
  return result;
}

module.exports = { pruneByAllowedKeys, pruneEmpty, pruneUnchanged, listPruned, pruneEnv };
