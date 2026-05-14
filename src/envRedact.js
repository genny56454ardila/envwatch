// envRedact.js — redact sensitive values from env maps for safe logging/output

const SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /api[_-]?key/i,
  /private[_-]?key/i,
  /auth/i,
  /credential/i,
  /passwd/i,
];

const DEFAULT_MASK = '***REDACTED***';

/**
 * Returns true if the key looks sensitive.
 * @param {string} key
 * @returns {boolean}
 */
function isSensitiveKey(key) {
  return SENSITIVE_PATTERNS.some((re) => re.test(key));
}

/**
 * Redact a single value if its key is sensitive.
 * @param {string} key
 * @param {string} value
 * @param {string} [mask]
 * @returns {string}
 */
function redactValue(key, value, mask = DEFAULT_MASK) {
  return isSensitiveKey(key) ? mask : value;
}

/**
 * Redact all sensitive keys in an env map.
 * @param {Record<string, string>} envMap
 * @param {string} [mask]
 * @returns {Record<string, string>}
 */
function redactEnv(envMap, mask = DEFAULT_MASK) {
  const result = {};
  for (const [key, value] of Object.entries(envMap)) {
    result[key] = redactValue(key, value, mask);
  }
  return result;
}

/**
 * Return only the keys that were redacted.
 * @param {Record<string, string>} envMap
 * @returns {string[]}
 */
function listRedactedKeys(envMap) {
  return Object.keys(envMap).filter(isSensitiveKey);
}

/**
 * Serialize a (possibly redacted) env map to .env format.
 * @param {Record<string, string>} envMap
 * @returns {string}
 */
function serializeRedacted(envMap) {
  return Object.entries(envMap)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
}

module.exports = {
  isSensitiveKey,
  redactValue,
  redactEnv,
  listRedactedKeys,
  serializeRedacted,
};
