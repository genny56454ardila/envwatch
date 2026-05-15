/**
 * envPlaceholder.js
 * Detects and reports unresolved placeholder values in .env files.
 * Placeholders are values matching patterns like <VALUE>, {{VALUE}}, or CHANGEME.
 */

const PLACEHOLDER_PATTERNS = [
  /^<[^>]+>$/,
  /^\{\{[^}]+\}\}$/,
  /^CHANGEME$/i,
  /^TODO$/i,
  /^REPLACE_ME$/i,
  /^YOUR_[A-Z_]+$/,
  /^PLACEHOLDER$/i,
];

/**
 * Returns true if a value looks like an unresolved placeholder.
 * @param {string} value
 * @returns {boolean}
 */
function isPlaceholder(value) {
  if (typeof value !== 'string' || value.trim() === '') return false;
  return PLACEHOLDER_PATTERNS.some((re) => re.test(value.trim()));
}

/**
 * Scans an env map and returns keys whose values are placeholders.
 * @param {Map<string, string>} envMap
 * @returns {Array<{ key: string, value: string }>}
 */
function findPlaceholders(envMap) {
  const results = [];
  for (const [key, value] of envMap) {
    if (isPlaceholder(value)) {
      results.push({ key, value });
    }
  }
  return results;
}

/**
 * Returns true if any placeholder entries exist.
 * @param {Map<string, string>} envMap
 * @returns {boolean}
 */
function hasPlaceholders(envMap) {
  return findPlaceholders(envMap).length > 0;
}

/**
 * Formats placeholder findings as human-readable lines.
 * @param {Array<{ key: string, value: string }>} findings
 * @returns {string[]}
 */
function formatPlaceholderIssues(findings) {
  return findings.map(
    ({ key, value }) => `  [placeholder] ${key} = "${value}" — replace before deploying`
  );
}

module.exports = { isPlaceholder, findPlaceholders, hasPlaceholders, formatPlaceholderIssues };
