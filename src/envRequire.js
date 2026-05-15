// envRequire.js — Check that required env keys are present and non-empty

/**
 * Check if a key is missing or empty in the env map.
 */
function isMissing(envMap, key) {
  return !envMap.has(key) || envMap.get(key).trim() === '';
}

/**
 * Given a list of required keys, return those that are missing.
 */
function findMissingKeys(envMap, requiredKeys) {
  return requiredKeys.filter(key => isMissing(envMap, key));
}

/**
 * Assert all required keys exist. Returns { ok, missing }.
 */
function requireKeys(envMap, requiredKeys) {
  const missing = findMissingKeys(envMap, requiredKeys);
  return { ok: missing.length === 0, missing };
}

/**
 * Load a .require file — one key per line, # comments allowed.
 */
function parseRequireFile(content) {
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#'));
}

/**
 * Format missing keys as human-readable issue lines.
 */
function formatMissingIssues(missingKeys) {
  return missingKeys.map(key => `  missing required key: ${key}`);
}

module.exports = {
  isMissing,
  findMissingKeys,
  requireKeys,
  parseRequireFile,
  formatMissingIssues,
};
