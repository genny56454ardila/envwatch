/**
 * envNormalize.js
 * Normalize .env key/value formatting: trim whitespace, fix quoting, standardize separators.
 */

/**
 * Trim whitespace around the `=` sign and from key/value.
 * @param {Map<string,string>} envMap
 * @returns {Map<string,string>}
 */
function trimEntries(envMap) {
  const result = new Map();
  for (const [key, value] of envMap) {
    result.set(key.trim(), value.trim());
  }
  return result;
}

/**
 * Ensure all values that contain spaces are wrapped in double quotes.
 * Already-quoted values are left as-is.
 * @param {Map<string,string>} envMap
 * @returns {Map<string,string>}
 */
function quoteSpacedValues(envMap) {
  const result = new Map();
  for (const [key, value] of envMap) {
    const alreadyQuoted =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"));
    if (!alreadyQuoted && value.includes(' ')) {
      result.set(key, `"${value}"`);
    } else {
      result.set(key, value);
    }
  }
  return result;
}

/**
 * Convert all keys to UPPER_SNAKE_CASE.
 * Replaces hyphens and spaces with underscores, then uppercases.
 * @param {Map<string,string>} envMap
 * @returns {Map<string,string>}
 */
function normalizeKeys(envMap) {
  const result = new Map();
  for (const [key, value] of envMap) {
    const normalized = key.replace(/[-\s]+/g, '_').toUpperCase();
    result.set(normalized, value);
  }
  return result;
}

/**
 * Remove duplicate keys, keeping the last occurrence.
 * @param {Array<[string,string]>} entries
 * @returns {Map<string,string>}
 */
function deduplicateKeys(entries) {
  const result = new Map();
  for (const [key, value] of entries) {
    result.set(key, value);
  }
  return result;
}

/**
 * Apply all normalization steps to an env map.
 * @param {Map<string,string>} envMap
 * @param {object} [options]
 * @param {boolean} [options.normalizeKeys=true]
 * @param {boolean} [options.quoteSpaces=true]
 * @param {boolean} [options.trimEntries=true]
 * @returns {Map<string,string>}
 */
function normalizeEnv(envMap, options = {}) {
  const {
    normalizeKeys: doNormalizeKeys = true,
    quoteSpaces = true,
    trimEntries: doTrim = true,
  } = options;

  let result = new Map(envMap);
  if (doTrim) result = trimEntries(result);
  if (doNormalizeKeys) result = normalizeKeys(result);
  if (quoteSpaces) result = quoteSpacedValues(result);
  return result;
}

/**
 * Serialize a normalized env map back to .env file string.
 * @param {Map<string,string>} envMap
 * @returns {string}
 */
function serializeNormalized(envMap) {
  const lines = [];
  for (const [key, value] of envMap) {
    lines.push(`${key}=${value}`);
  }
  return lines.join('\n') + '\n';
}

module.exports = {
  trimEntries,
  quoteSpacedValues,
  normalizeKeys,
  deduplicateKeys,
  normalizeEnv,
  serializeNormalized,
};
