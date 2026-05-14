/**
 * envDefaults.js
 * Apply default values to env maps — fill in missing keys from a defaults map.
 */

/**
 * Apply defaults to an env map. Keys present in env are not overwritten.
 * @param {Map<string,string>} envMap
 * @param {Map<string,string>} defaults
 * @returns {Map<string,string>}
 */
function applyDefaults(envMap, defaults) {
  const result = new Map(envMap);
  for (const [key, value] of defaults) {
    if (!result.has(key)) {
      result.set(key, value);
    }
  }
  return result;
}

/**
 * Return only the keys that were filled in from defaults (missing in original).
 * @param {Map<string,string>} envMap
 * @param {Map<string,string>} defaults
 * @returns {string[]}
 */
function missingKeys(envMap, defaults) {
  const missing = [];
  for (const key of defaults.keys()) {
    if (!envMap.has(key)) {
      missing.push(key);
    }
  }
  return missing;
}

/**
 * Load defaults from a plain object (e.g. from JSON config).
 * @param {Record<string,string>} obj
 * @returns {Map<string,string>}
 */
function defaultsFromObject(obj) {
  const map = new Map();
  for (const [k, v] of Object.entries(obj)) {
    map.set(String(k), String(v));
  }
  return map;
}

/**
 * Serialize an env map to KEY=VALUE lines.
 * @param {Map<string,string>} envMap
 * @returns {string}
 */
function serializeEnv(envMap) {
  return Array.from(envMap.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
}

module.exports = { applyDefaults, missingKeys, defaultsFromObject, serializeEnv };
