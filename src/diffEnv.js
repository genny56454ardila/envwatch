/**
 * Computes the diff between two sets of env vars.
 *
 * @param {Record<string, string>} prevVars
 * @param {Record<string, string>} nextVars
 * @returns {{ added: Record<string, string>, removed: string[], changed: Record<string, { from: string, to: string }> }}
 */
function diffEnv(prevVars, nextVars) {
  const added = {};
  const removed = [];
  const changed = {};

  const allKeys = new Set([...Object.keys(prevVars), ...Object.keys(nextVars)]);

  for (const key of allKeys) {
    const inPrev = Object.prototype.hasOwnProperty.call(prevVars, key);
    const inNext = Object.prototype.hasOwnProperty.call(nextVars, key);

    if (!inPrev && inNext) {
      added[key] = nextVars[key];
    } else if (inPrev && !inNext) {
      removed.push(key);
    } else if (inPrev && inNext && prevVars[key] !== nextVars[key]) {
      changed[key] = { from: prevVars[key], to: nextVars[key] };
    }
  }

  return { added, removed, changed };
}

/**
 * Returns true if there are any differences between the two env objects.
 * @param {Record<string, string>} prevVars
 * @param {Record<string, string>} nextVars
 */
function hasChanges(prevVars, nextVars) {
  const { added, removed, changed } = diffEnv(prevVars, nextVars);
  return (
    Object.keys(added).length > 0 ||
    removed.length > 0 ||
    Object.keys(changed).length > 0
  );
}

module.exports = { diffEnv, hasChanges };
