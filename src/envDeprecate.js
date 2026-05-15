/**
 * envDeprecate.js
 * Detect and report deprecated env keys based on a deprecation map.
 */

/**
 * Build a deprecation map from an array of { from, to, reason } entries.
 * @param {Array<{from: string, to?: string, reason?: string}>} entries
 * @returns {Map<string, {to?: string, reason?: string}>}
 */
function buildDeprecationMap(entries) {
  const map = new Map();
  for (const { from, to, reason } of entries) {
    map.set(from, { to, reason });
  }
  return map;
}

/**
 * Find deprecated keys present in the env map.
 * @param {Map<string, string>} envMap
 * @param {Map<string, {to?: string, reason?: string}>} deprecationMap
 * @returns {Array<{key: string, to?: string, reason?: string}>}
 */
function findDeprecatedKeys(envMap, deprecationMap) {
  const found = [];
  for (const [key] of envMap) {
    if (deprecationMap.has(key)) {
      found.push({ key, ...deprecationMap.get(key) });
    }
  }
  return found;
}

/**
 * Suggest replacements: returns a new map with deprecated keys renamed to their successors.
 * Keys without a `to` replacement are left as-is.
 * @param {Map<string, string>} envMap
 * @param {Map<string, {to?: string, reason?: string}>} deprecationMap
 * @returns {Map<string, string>}
 */
function applyReplacements(envMap, deprecationMap) {
  const result = new Map();
  for (const [key, value] of envMap) {
    if (deprecationMap.has(key)) {
      const { to } = deprecationMap.get(key);
      if (to) {
        result.set(to, value);
      } else {
        result.set(key, value);
      }
    } else {
      result.set(key, value);
    }
  }
  return result;
}

/**
 * Format deprecation issues into human-readable lines.
 * @param {Array<{key: string, to?: string, reason?: string}>} issues
 * @returns {string[]}
 */
function formatDeprecationIssues(issues) {
  return issues.map(({ key, to, reason }) => {
    let msg = `DEPRECATED: ${key}`;
    if (to) msg += ` → use ${to} instead`;
    if (reason) msg += ` (${reason})`;
    return msg;
  });
}

/**
 * Returns true if any deprecated keys are present.
 * @param {Array} issues
 * @returns {boolean}
 */
function hasDeprecations(issues) {
  return issues.length > 0;
}

module.exports = {
  buildDeprecationMap,
  findDeprecatedKeys,
  applyReplacements,
  formatDeprecationIssues,
  hasDeprecations,
};
