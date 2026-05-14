// envAlias.js — manage key aliases (alternative names) for env variables

'use strict';

/**
 * Build an alias map: { alias -> canonical key }
 * @param {Object} aliasConfig - { CANONICAL_KEY: ['alias1', 'alias2'] }
 * @returns {Map<string, string>}
 */
function buildAliasMap(aliasConfig) {
  const map = new Map();
  for (const [canonical, aliases] of Object.entries(aliasConfig)) {
    if (!Array.isArray(aliases)) continue;
    for (const alias of aliases) {
      map.set(alias, canonical);
    }
  }
  return map;
}

/**
 * Resolve aliases in an env map, adding canonical keys where missing.
 * @param {Map<string, string>} envMap
 * @param {Map<string, string>} aliasMap - alias -> canonical
 * @returns {Map<string, string>} new map with resolved aliases
 */
function resolveAliases(envMap, aliasMap) {
  const result = new Map(envMap);
  for (const [key, value] of envMap) {
    const canonical = aliasMap.get(key);
    if (canonical && !result.has(canonical)) {
      result.set(canonical, value);
    }
  }
  return result;
}

/**
 * List all aliases present in an env map.
 * @param {Map<string, string>} envMap
 * @param {Map<string, string>} aliasMap
 * @returns {Array<{ alias: string, canonical: string, value: string }>}
 */
function listAliasesInEnv(envMap, aliasMap) {
  const found = [];
  for (const [key, value] of envMap) {
    const canonical = aliasMap.get(key);
    if (canonical) {
      found.push({ alias: key, canonical, value });
    }
  }
  return found;
}

/**
 * Strip alias keys from an env map, keeping only canonical keys.
 * @param {Map<string, string>} envMap
 * @param {Map<string, string>} aliasMap
 * @returns {Map<string, string>}
 */
function stripAliases(envMap, aliasMap) {
  const result = new Map();
  for (const [key, value] of envMap) {
    if (!aliasMap.has(key)) {
      result.set(key, value);
    }
  }
  return result;
}

module.exports = { buildAliasMap, resolveAliases, listAliasesInEnv, stripAliases };
