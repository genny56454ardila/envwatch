// envPin.js — pin specific env keys to fixed values, preventing them from being overridden

const fs = require('fs');
const path = require('path');

let pinnedKeys = {};

/**
 * Pin a set of keys to their current values.
 * @param {Object} envMap - full env map
 * @param {string[]} keys - keys to pin
 * @returns {Object} pinned snapshot { key: value }
 */
function pinKeys(envMap, keys) {
  const pinned = {};
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(envMap, key)) {
      pinned[key] = envMap[key];
    }
  }
  pinnedKeys = { ...pinnedKeys, ...pinned };
  return pinned;
}

/**
 * Apply pinned values over an env map, overriding any changes.
 * @param {Object} envMap
 * @returns {Object} env map with pinned values restored
 */
function applyPins(envMap) {
  return { ...envMap, ...pinnedKeys };
}

/**
 * Unpin one or more keys.
 * @param {string[]} keys
 */
function unpinKeys(keys) {
  for (const key of keys) {
    delete pinnedKeys[key];
  }
}

/**
 * Return a copy of all currently pinned keys.
 * @returns {Object}
 */
function getPinnedKeys() {
  return { ...pinnedKeys };
}

/**
 * Clear all pinned keys.
 */
function clearPins() {
  pinnedKeys = {};
}

/**
 * Save pinned keys to a JSON file.
 * @param {string} filePath
 */
function savePins(filePath) {
  fs.writeFileSync(filePath, JSON.stringify(pinnedKeys, null, 2), 'utf8');
}

/**
 * Load pinned keys from a JSON file.
 * @param {string} filePath
 * @returns {Object} loaded pins
 */
function loadPins(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const raw = fs.readFileSync(filePath, 'utf8');
  pinnedKeys = JSON.parse(raw);
  return { ...pinnedKeys };
}

module.exports = { pinKeys, applyPins, unpinKeys, getPinnedKeys, clearPins, savePins, loadPins };
