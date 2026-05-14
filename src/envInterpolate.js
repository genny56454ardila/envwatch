// Resolves variable references like ${VAR} or $VAR within env values

/**
 * Expand a single value by substituting references from the given env map.
 * Supports ${VAR} and $VAR syntax. Unknown refs are left as-is.
 * @param {string} value
 * @param {Map<string,string>} envMap
 * @param {Set<string>} [seen] - tracks recursion to prevent cycles
 * @returns {string}
 */
function interpolateValue(value, envMap, seen = new Set()) {
  return value.replace(/\$\{([^}]+)\}|\$([A-Z_][A-Z0-9_]*)/gi, (match, braced, bare) => {
    const key = braced || bare;
    if (seen.has(key)) return match; // cycle guard
    const raw = envMap.get(key);
    if (raw === undefined) return match;
    seen.add(key);
    const resolved = interpolateValue(raw, envMap, seen);
    seen.delete(key);
    return resolved;
  });
}

/**
 * Interpolate all values in an env map, resolving cross-references.
 * @param {Map<string,string>} envMap
 * @returns {Map<string,string>}
 */
function interpolateEnv(envMap) {
  const result = new Map();
  for (const [key, value] of envMap) {
    result.set(key, interpolateValue(value, envMap));
  }
  return result;
}

/**
 * Return keys whose values contain unresolved references after interpolation.
 * @param {Map<string,string>} envMap
 * @returns {string[]}
 */
function findUnresolved(envMap) {
  const interpolated = interpolateEnv(envMap);
  const unresolved = [];
  for (const [key, value] of interpolated) {
    if (/\$\{[^}]+\}|\$[A-Z_][A-Z0-9_]*/i.test(value)) {
      unresolved.push(key);
    }
  }
  return unresolved;
}

module.exports = { interpolateValue, interpolateEnv, findUnresolved };
