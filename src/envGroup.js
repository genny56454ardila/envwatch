// envGroup.js — Group env variables by prefix or custom rules

/**
 * Groups env entries by their prefix (e.g. DB_HOST -> group 'DB')
 * @param {Map<string,string>} envMap
 * @param {string} [separator='_']
 * @returns {Object<string, Map<string,string>>}
 */
function groupByPrefix(envMap, separator = '_') {
  const groups = {};
  for (const [key, value] of envMap) {
    const idx = key.indexOf(separator);
    const prefix = idx > 0 ? key.slice(0, idx) : '__ungrouped__';
    if (!groups[prefix]) groups[prefix] = new Map();
    groups[prefix].set(key, value);
  }
  return groups;
}

/**
 * Groups env entries by a list of explicit group definitions
 * @param {Map<string,string>} envMap
 * @param {Object<string, string[]>} groupDefs — { groupName: [KEY1, KEY2] }
 * @returns {Object<string, Map<string,string>>}
 */
function groupByKeys(envMap, groupDefs) {
  const groups = {};
  const assigned = new Set();
  for (const [groupName, keys] of Object.entries(groupDefs)) {
    groups[groupName] = new Map();
    for (const key of keys) {
      if (envMap.has(key)) {
        groups[groupName].set(key, envMap.get(key));
        assigned.add(key);
      }
    }
  }
  const ungrouped = new Map();
  for (const [key, value] of envMap) {
    if (!assigned.has(key)) ungrouped.set(key, value);
  }
  if (ungrouped.size > 0) groups['__ungrouped__'] = ungrouped;
  return groups;
}

/**
 * Serializes grouped env output as labeled sections
 * @param {Object<string, Map<string,string>>} groups
 * @returns {string}
 */
function serializeGroups(groups) {
  const lines = [];
  for (const [groupName, envMap] of Object.entries(groups)) {
    lines.push(`# [${groupName}]`);
    for (const [key, value] of envMap) {
      lines.push(`${key}=${value}`);
    }
    lines.push('');
  }
  return lines.join('\n').trimEnd();
}

module.exports = { groupByPrefix, groupByKeys, serializeGroups };
