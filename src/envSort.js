/**
 * envSort.js — Sort .env keys alphabetically or by custom order
 */

/**
 * Sort env map keys alphabetically
 * @param {Record<string, string>} envMap
 * @param {boolean} descending
 * @returns {Record<string, string>}
 */
function sortAlpha(envMap, descending = false) {
  const keys = Object.keys(envMap).sort();
  if (descending) keys.reverse();
  return Object.fromEntries(keys.map((k) => [k, envMap[k]]));
}

/**
 * Sort env map keys by a provided key order array.
 * Keys not in the order list are appended at the end, sorted alpha.
 * @param {Record<string, string>} envMap
 * @param {string[]} order
 * @returns {Record<string, string>}
 */
function sortByOrder(envMap, order) {
  const ordered = [];
  const remaining = Object.keys(envMap).filter((k) => !order.includes(k)).sort();

  for (const key of order) {
    if (Object.prototype.hasOwnProperty.call(envMap, key)) {
      ordered.push([key, envMap[key]]);
    }
  }
  for (const key of remaining) {
    ordered.push([key, envMap[key]]);
  }
  return Object.fromEntries(ordered);
}

/**
 * Group keys by prefix (e.g. DB_, APP_) then sort within each group.
 * @param {Record<string, string>} envMap
 * @returns {Record<string, string>}
 */
function sortByPrefix(envMap) {
  const groups = {};
  for (const key of Object.keys(envMap)) {
    const prefix = key.includes('_') ? key.split('_')[0] : '__NONE__';
    if (!groups[prefix]) groups[prefix] = [];
    groups[prefix].push(key);
  }
  const result = {};
  for (const prefix of Object.keys(groups).sort()) {
    for (const key of groups[prefix].sort()) {
      result[key] = envMap[key];
    }
  }
  return result;
}

/**
 * Serialize a sorted env map back to .env file string
 * @param {Record<string, string>} envMap
 * @returns {string}
 */
function serializeSorted(envMap) {
  return Object.entries(envMap)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n') + '\n';
}

module.exports = { sortAlpha, sortByOrder, sortByPrefix, serializeSorted };
