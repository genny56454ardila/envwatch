// envCompare.js — Compare two .env files and summarize differences

const { parseEnvFile } = require('./envParser');
const { diffEnv } = require('./diffEnv');

/**
 * Load and compare two env files, returning a structured summary.
 * @param {string} fileA
 * @param {string} fileB
 * @returns {{ added: string[], removed: string[], changed: string[], unchanged: string[] }}
 */
function compareEnvFiles(fileA, fileB) {
  const envA = parseEnvFile(fileA);
  const envB = parseEnvFile(fileB);
  return compareEnvMaps(envA, envB);
}

/**
 * Compare two plain key/value maps.
 * @param {Record<string,string>} envA
 * @param {Record<string,string>} envB
 * @returns {{ added: string[], removed: string[], changed: string[], unchanged: string[] }}
 */
function compareEnvMaps(envA, envB) {
  const keysA = new Set(Object.keys(envA));
  const keysB = new Set(Object.keys(envB));
  const allKeys = new Set([...keysA, ...keysB]);

  const added = [];
  const removed = [];
  const changed = [];
  const unchanged = [];

  for (const key of allKeys) {
    const inA = keysA.has(key);
    const inB = keysB.has(key);

    if (inA && !inB) {
      removed.push(key);
    } else if (!inA && inB) {
      added.push(key);
    } else if (envA[key] !== envB[key]) {
      changed.push(key);
    } else {
      unchanged.push(key);
    }
  }

  return { added, removed, changed, unchanged };
}

/**
 * Returns a human-readable summary string.
 * @param {{ added: string[], removed: string[], changed: string[], unchanged: string[] }} result
 * @returns {string}
 */
function summarizeComparison(result) {
  const lines = [];
  if (result.added.length)    lines.push(`Added    (${result.added.length}): ${result.added.join(', ')}`);
  if (result.removed.length)  lines.push(`Removed  (${result.removed.length}): ${result.removed.join(', ')}`);
  if (result.changed.length)  lines.push(`Changed  (${result.changed.length}): ${result.changed.join(', ')}`);
  if (result.unchanged.length) lines.push(`Unchanged(${result.unchanged.length}): ${result.unchanged.join(', ')}`);
  return lines.length ? lines.join('\n') : 'No differences found.';
}

module.exports = { compareEnvFiles, compareEnvMaps, summarizeComparison };
