// envLint.js — Lint .env files for common issues

const RULES = {
  noEmptyKey: (key) => key.trim().length > 0,
  noSpacesInKey: (key) => !/\s/.test(key),
  noLowercaseKey: (key) => key === key.toUpperCase(),
  noQuotedNumbers: (key, value) => !(value.match(/^["']\d+["']$/)),
  noTrailingSpace: (key, value) => value === value.trimEnd(),
};

const RULE_MESSAGES = {
  noEmptyKey: 'Empty key name',
  noSpacesInKey: 'Key contains whitespace',
  noLowercaseKey: 'Key is not uppercase',
  noQuotedNumbers: 'Numeric value is unnecessarily quoted',
  noTrailingSpace: 'Value has trailing whitespace',
};

function lintEnv(parsed, enabledRules = Object.keys(RULES)) {
  const issues = [];

  for (const [key, value] of Object.entries(parsed)) {
    for (const ruleName of enabledRules) {
      const rule = RULES[ruleName];
      if (!rule) continue;
      const pass = rule(key, value);
      if (!pass) {
        issues.push({
          key,
          rule: ruleName,
          message: RULE_MESSAGES[ruleName] || ruleName,
          severity: ruleName === 'noEmptyKey' || ruleName === 'noSpacesInKey' ? 'error' : 'warning',
        });
      }
    }
  }

  return issues;
}

function hasErrors(issues) {
  return issues.some((i) => i.severity === 'error');
}

function formatIssues(issues) {
  if (issues.length === 0) return 'No issues found.';
  return issues
    .map((i) => `[${i.severity.toUpperCase()}] ${i.key}: ${i.message}`)
    .join('\n');
}

module.exports = { lintEnv, hasErrors, formatIssues, RULES, RULE_MESSAGES };
