/**
 * envFlatten.js
 * Flatten nested JSON/object env values into dot-notation keys,
 * and expand dot-notation keys back into nested objects.
 */

/**
 * Flatten a nested object into dot-notation env-style keys.
 * e.g. { DB: { HOST: 'localhost', PORT: '5432' } } => { DB_HOST: 'localhost', DB_PORT: '5432' }
 * @param {object} obj
 * @param {string} [prefix]
 * @param {string} [separator]
 * @returns {Map<string, string>}
 */
function flattenObject(obj, prefix = '', separator = '_') {
  const result = new Map();

  function recurse(current, path) {
    if (current === null || current === undefined) {
      result.set(path, '');
      return;
    }
    if (typeof current !== 'object' || Array.isArray(current)) {
      result.set(path, String(current));
      return;
    }
    for (const [key, value] of Object.entries(current)) {
      const newPath = path ? `${path}${separator}${key.toUpperCase()}` : key.toUpperCase();
      recurse(value, newPath);
    }
  }

  recurse(obj, prefix.toUpperCase());
  return result;
}

/**
 * Expand a flat env Map with dot/underscore-notation keys into a nested object.
 * Uses double-underscore (__) as nesting delimiter to avoid ambiguity.
 * e.g. Map { 'DB__HOST' => 'localhost' } => { DB: { HOST: 'localhost' } }
 * @param {Map<string, string>} envMap
 * @param {string} [delimiter]
 * @returns {object}
 */
function expandEnvToObject(envMap, delimiter = '__') {
  const result = {};

  for (const [key, value] of envMap.entries()) {
    const parts = key.split(delimiter);
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current) || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part];
    }
    current[parts[parts.length - 1]] = value;
  }

  return result;
}

/**
 * Flatten a Map<string,string> of env vars that contain JSON values.
 * If a value is valid JSON object, it gets flattened with the key as prefix.
 * Non-JSON values are passed through unchanged.
 * @param {Map<string, string>} envMap
 * @returns {Map<string, string>}
 */
function flattenJsonValues(envMap) {
  const result = new Map();

  for (const [key, value] of envMap.entries()) {
    let parsed;
    try {
      parsed = JSON.parse(value);
    } catch {
      result.set(key, value);
      continue;
    }
    if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const flattened = flattenObject(parsed, key);
      for (const [fk, fv] of flattened.entries()) {
        result.set(fk, fv);
      }
    } else {
      result.set(key, value);
    }
  }

  return result;
}

module.exports = { flattenObject, expandEnvToObject, flattenJsonValues };
