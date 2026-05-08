/**
 * envFilter.js — Filter env variables by prefix, pattern, or key list
 */

/**
 * Filter env map by key prefix (e.g. "DB_" keeps only DB_* keys)
 * @param {Record<string,string>} envMap
 * @param {string} prefix
 * @returns {Record<string,string>}
 */
function filterByPrefix(envMap, prefix) {
  const upper = prefix.toUpperCase();
  return Object.fromEntries(
    Object.entries(envMap).filter(([k]) => k.toUpperCase().startsWith(upper))
  );
}

/**
 * Filter env map by regex pattern applied to keys
 * @param {Record<string,string>} envMap
 * @param {string|RegExp} pattern
 * @returns {Record<string,string>}
 */
function filterByPattern(envMap, pattern) {
  const re = pattern instanceof RegExp ? pattern : new RegExp(pattern);
  return Object.fromEntries(
    Object.entries(envMap).filter(([k]) => re.test(k))
  );
}

/**
 * Keep only the specified keys from the env map
 * @param {Record<string,string>} envMap
 * @param {string[]} keys
 * @returns {Record<string,string>}
 */
function filterByKeys(envMap, keys) {
  const keySet = new Set(keys);
  return Object.fromEntries(
    Object.entries(envMap).filter(([k]) => keySet.has(k))
  );
}

/**
 * Exclude keys matching a prefix, pattern, or list
 * @param {Record<string,string>} envMap
 * @param {string[]} excludeKeys
 * @returns {Record<string,string>}
 */
function excludeKeys(envMap, excludeKeys) {
  const keySet = new Set(excludeKeys);
  return Object.fromEntries(
    Object.entries(envMap).filter(([k]) => !keySet.has(k))
  );
}

/**
 * Apply multiple filter options in sequence
 * @param {Record<string,string>} envMap
 * @param {{ prefix?: string, pattern?: string|RegExp, keys?: string[], exclude?: string[] }} opts
 * @returns {Record<string,string>}
 */
function applyFilters(envMap, opts = {}) {
  let result = { ...envMap };
  if (opts.prefix) result = filterByPrefix(result, opts.prefix);
  if (opts.pattern) result = filterByPattern(result, opts.pattern);
  if (opts.keys && opts.keys.length) result = filterByKeys(result, opts.keys);
  if (opts.exclude && opts.exclude.length) result = excludeKeys(result, opts.exclude);
  return result;
}

module.exports = { filterByPrefix, filterByPattern, filterByKeys, excludeKeys, applyFilters };
