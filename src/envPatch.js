// envPatch.js — apply key-value patches to an existing env map

/**
 * Apply a patch object (key->value) to an env map.
 * Returns a new Map with patched values.
 * @param {Map<string,string>} envMap
 * @param {Object} patch  plain object of key->value overrides
 * @returns {Map<string,string>}
 */
function applyPatch(envMap, patch) {
  const result = new Map(envMap);
  for (const [key, value] of Object.entries(patch)) {
    result.set(key, String(value));
  }
  return result;
}

/**
 * Remove keys listed in `keys` from the env map.
 * @param {Map<string,string>} envMap
 * @param {string[]} keys
 * @returns {Map<string,string>}
 */
function removeKeys(envMap, keys) {
  const result = new Map(envMap);
  for (const key of keys) {
    result.delete(key);
  }
  return result;
}

/**
 * Rename a single key in the env map.
 * @param {Map<string,string>} envMap
 * @param {string} oldKey
 * @param {string} newKey
 * @returns {Map<string,string>}
 */
function renameKey(envMap, oldKey, newKey) {
  if (!envMap.has(oldKey)) return new Map(envMap);
  const result = new Map(envMap);
  result.set(newKey, result.get(oldKey));
  result.delete(oldKey);
  return result;
}

/**
 * Serialize a patched env map back to .env string format.
 * @param {Map<string,string>} envMap
 * @returns {string}
 */
function serializePatch(envMap) {
  const lines = [];
  for (const [key, value] of envMap) {
    const needsQuotes = /\s|#|"/.test(value);
    lines.push(`${key}=${needsQuotes ? `"${value.replace(/"/g, '\\"')}"` : value}`);
  }
  return lines.join('\n') + '\n';
}

/**
 * Apply a patch to a .env file and write the result.
 * @param {string} filePath
 * @param {Object} patch
 * @param {{ remove?: string[], rename?: Object }} opts
 * @returns {Map<string,string>}
 */
function patchEnvFile(filePath, patch, opts = {}) {
  const { parseEnvFile } = require('./envParser');
  const fs = require('fs');
  let envMap = parseEnvFile(filePath);
  envMap = applyPatch(envMap, patch);
  if (opts.remove && opts.remove.length) {
    envMap = removeKeys(envMap, opts.remove);
  }
  if (opts.rename) {
    for (const [oldKey, newKey] of Object.entries(opts.rename)) {
      envMap = renameKey(envMap, oldKey, newKey);
    }
  }
  fs.writeFileSync(filePath, serializePatch(envMap), 'utf8');
  return envMap;
}

module.exports = { applyPatch, removeKeys, renameKey, serializePatch, patchEnvFile };
