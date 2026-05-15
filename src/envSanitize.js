/**
 * envSanitize.js
 * Sanitizes env values by trimming whitespace, removing null bytes,
 * stripping control characters, and optionally truncating long values.
 */

const DEFAULT_MAX_LENGTH = 1024;

function trimWhitespace(value) {
  return value.trim();
}

function removeNullBytes(value) {
  // eslint-disable-next-line no-control-regex
  return value.replace(/\x00/g, '');
}

function stripControlChars(value) {
  // Remove control chars except tab (\t) and newline (\n) which may be intentional
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

function truncate(value, maxLength) {
  if (typeof maxLength !== 'number' || maxLength <= 0) return value;
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

/**
 * Sanitize a single env value.
 * @param {string} value
 * @param {object} opts
 * @param {boolean} [opts.trim=true]
 * @param {boolean} [opts.stripControl=true]
 * @param {number|null} [opts.maxLength=1024]
 * @returns {string}
 */
function sanitizeValue(value, opts = {}) {
  const {
    trim = true,
    stripControl = true,
    maxLength = DEFAULT_MAX_LENGTH,
  } = opts;

  let result = removeNullBytes(String(value));
  if (stripControl) result = stripControlChars(result);
  if (trim) result = trimWhitespace(result);
  if (maxLength != null) result = truncate(result, maxLength);
  return result;
}

/**
 * Sanitize all values in an env Map.
 * @param {Map<string, string>} envMap
 * @param {object} opts
 * @returns {Map<string, string>}
 */
function sanitizeEnv(envMap, opts = {}) {
  const result = new Map();
  for (const [key, value] of envMap) {
    result.set(key, sanitizeValue(value, opts));
  }
  return result;
}

/**
 * List keys whose values were changed during sanitization.
 * @param {Map<string, string>} original
 * @param {Map<string, string>} sanitized
 * @returns {string[]}
 */
function listSanitizedKeys(original, sanitized) {
  const changed = [];
  for (const [key, value] of original) {
    if (sanitized.get(key) !== value) changed.push(key);
  }
  return changed;
}

module.exports = { sanitizeValue, sanitizeEnv, listSanitizedKeys, trimWhitespace, stripControlChars, removeNullBytes, truncate };
