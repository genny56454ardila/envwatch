/**
 * envInherit.js
 * Merge a base .env file with an inheriting .env file,
 * letting the child override base values.
 */

const fs = require('fs');
const { parseEnvContent } = require('./envParser');

/**
 * Build an inherited env map: base values filled in where child is silent.
 * @param {Map<string,string>} baseMap
 * @param {Map<string,string>} childMap
 * @returns {Map<string,string>}
 */
function inheritEnv(baseMap, childMap) {
  const result = new Map(baseMap);
  for (const [key, value] of childMap) {
    result.set(key, value);
  }
  return result;
}

/**
 * Return keys present in base but missing from child (inherited, not overridden).
 * @param {Map<string,string>} baseMap
 * @param {Map<string,string>} childMap
 * @returns {string[]}
 */
function inheritedKeys(baseMap, childMap) {
  return [...baseMap.keys()].filter(k => !childMap.has(k));
}

/**
 * Return keys overridden by child relative to base.
 * @param {Map<string,string>} baseMap
 * @param {Map<string,string>} childMap
 * @returns {string[]}
 */
function overriddenKeys(baseMap, childMap) {
  return [...childMap.keys()].filter(k => baseMap.has(k));
}

/**
 * Load and inherit two env files from disk.
 * @param {string} basePath
 * @param {string} childPath
 * @returns {Map<string,string>}
 */
function inheritEnvFiles(basePath, childPath) {
  const baseContent = fs.readFileSync(basePath, 'utf8');
  const childContent = fs.readFileSync(childPath, 'utf8');
  const baseMap = parseEnvContent(baseContent);
  const childMap = parseEnvContent(childContent);
  return inheritEnv(baseMap, childMap);
}

module.exports = { inheritEnv, inheritedKeys, overriddenKeys, inheritEnvFiles };
