/**
 * envCondense.js
 * Remove duplicate, empty, and redundant entries from an env map or file.
 */

const fs = require('fs');
const { parseEnvFile } = require('./envParser');

/**
 * Remove entries whose values are empty strings.
 * @param {Map<string,string>} envMap
 * @returns {Map<string,string>}
 */
function stripEmpty(envMap) {
  const result = new Map();
  for (const [k, v] of envMap) {
    if (v !== '') result.set(k, v);
  }
  return result;
}

/**
 * Remove duplicate keys, keeping the last occurrence.
 * @param {Map<string,string>} envMap
 * @returns {Map<string,string>}
 */
function deduplicateLast(envMap) {
  // Map already preserves insertion order; rebuild to keep last
  const seen = new Map();
  for (const [k, v] of envMap) {
    seen.set(k, v);
  }
  return seen;
}

/**
 * Remove keys whose values are identical to those in a reference map.
 * Useful for stripping keys that match defaults.
 * @param {Map<string,string>} envMap
 * @param {Map<string,string>} referenceMap
 * @returns {Map<string,string>}
 */
function stripMatchingDefaults(envMap, referenceMap) {
  const result = new Map();
  for (const [k, v] of envMap) {
    if (!referenceMap.has(k) || referenceMap.get(k) !== v) {
      result.set(k, v);
    }
  }
  return result;
}

/**
 * Condense an env map: remove empty values and deduplicate.
 * @param {Map<string,string>} envMap
 * @param {{ keepEmpty?: boolean }} options
 * @returns {Map<string,string>}
 */
function condenseEnv(envMap, options = {}) {
  let result = deduplicateLast(envMap);
  if (!options.keepEmpty) {
    result = stripEmpty(result);
  }
  return result;
}

/**
 * Serialize a Map back to .env file content.
 * @param {Map<string,string>} envMap
 * @returns {string}
 */
function serializeCondensed(envMap) {
  const lines = [];
  for (const [k, v] of envMap) {
    const needsQuote = v.includes(' ') || v.includes('#');
    lines.push(`${k}=${needsQuote ? `"${v}"` : v}`);
  }
  return lines.join('\n') + (lines.length ? '\n' : '');
}

/**
 * Condense a .env file and write result to outputPath.
 * @param {string} inputPath
 * @param {string} outputPath
 * @param {object} options
 */
function condenseFile(inputPath, outputPath, options = {}) {
  const envMap = parseEnvFile(inputPath);
  const condensed = condenseEnv(envMap, options);
  const content = serializeCondensed(condensed);
  fs.writeFileSync(outputPath, content, 'utf8');
  return condensed;
}

module.exports = {
  stripEmpty,
  deduplicateLast,
  stripMatchingDefaults,
  condenseEnv,
  serializeCondensed,
  condenseFile,
};
