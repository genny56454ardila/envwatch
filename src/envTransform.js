/**
 * envTransform.js
 * Utilities for transforming env variable values in bulk.
 */

/**
 * Convert all keys to UPPER_SNAKE_CASE.
 * @param {Record<string,string>} envMap
 * @returns {Record<string,string>}
 */
function keysToUpper(envMap) {
  return Object.fromEntries(
    Object.entries(envMap).map(([k, v]) => [k.toUpperCase(), v])
  );
}

/**
 * Convert all keys to lower_snake_case.
 * @param {Record<string,string>} envMap
 * @returns {Record<string,string>}
 */
function keysToLower(envMap) {
  return Object.fromEntries(
    Object.entries(envMap).map(([k, v]) => [k.toLowerCase(), v])
  );
}

/**
 * Add a prefix to every key.
 * @param {Record<string,string>} envMap
 * @param {string} prefix
 * @returns {Record<string,string>}
 */
function addPrefix(envMap, prefix) {
  if (!prefix) return { ...envMap };
  return Object.fromEntries(
    Object.entries(envMap).map(([k, v]) => [`${prefix}${k}`, v])
  );
}

/**
 * Strip a prefix from every key that has it.
 * @param {Record<string,string>} envMap
 * @param {string} prefix
 * @returns {Record<string,string>}
 */
function stripPrefix(envMap, prefix) {
  if (!prefix) return { ...envMap };
  return Object.fromEntries(
    Object.entries(envMap).map(([k, v]) => [
      k.startsWith(prefix) ? k.slice(prefix.length) : k,
      v,
    ])
  );
}

/**
 * Apply a custom value transformer function to every value.
 * @param {Record<string,string>} envMap
 * @param {(value: string, key: string) => string} fn
 * @returns {Record<string,string>}
 */
function transformValues(envMap, fn) {
  return Object.fromEntries(
    Object.entries(envMap).map(([k, v]) => [k, fn(v, k)])
  );
}

/**
 * Trim whitespace from all values.
 * @param {Record<string,string>} envMap
 * @returns {Record<string,string>}
 */
function trimValues(envMap) {
  return transformValues(envMap, (v) => v.trim());
}

module.exports = {
  keysToUpper,
  keysToLower,
  addPrefix,
  stripPrefix,
  transformValues,
  trimValues,
};
