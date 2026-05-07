/**
 * envRename.js
 * Utilities for renaming keys in .env content or files.
 */

const fs = require('fs');
const { parseEnvContent } = require('./envParser');

/**
 * Rename a key in a parsed env map.
 * Returns a new map with the key renamed.
 */
function renameKey(envMap, oldKey, newKey) {
  if (!Object.prototype.hasOwnProperty.call(envMap, oldKey)) {
    throw new Error(`Key "${oldKey}" not found in env map`);
  }
  if (oldKey === newKey) return { ...envMap };
  const result = {};
  for (const [k, v] of Object.entries(envMap)) {
    result[k === oldKey ? newKey : k] = v;
  }
  return result;
}

/**
 * Apply a rename map (oldKey -> newKey) to an env map.
 * Throws if any source key is missing.
 */
function renameKeys(envMap, renameMap) {
  let result = { ...envMap };
  for (const [oldKey, newKey] of Object.entries(renameMap)) {
    result = renameKey(result, oldKey, newKey);
  }
  return result;
}

/**
 * Serialize an env map back to .env file content.
 * Preserves KEY=VALUE format.
 */
function serializeEnvMap(envMap) {
  return Object.entries(envMap)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n') + '\n';
}

/**
 * Read a .env file, rename keys, and write the result back.
 * Returns the updated env map.
 */
function renameInFile(filePath, renameMap) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const envMap = parseEnvContent(raw);
  const updated = renameKeys(envMap, renameMap);
  fs.writeFileSync(filePath, serializeEnvMap(updated), 'utf8');
  return updated;
}

module.exports = { renameKey, renameKeys, serializeEnvMap, renameInFile };
