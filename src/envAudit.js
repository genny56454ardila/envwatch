// envAudit.js — Audit .env files for common security and hygiene issues

const SENSITIVE_PATTERNS = [
  /secret/i,
  /password/i,
  /passwd/i,
  /api[_-]?key/i,
  /auth[_-]?token/i,
  /private[_-]?key/i,
  /access[_-]?token/i,
];

const WEAK_VALUE_PATTERNS = [
  /^(password|secret|123456|test|admin|changeme|default)$/i,
];

/**
 * Check if a key looks like it holds sensitive data.
 */
function isSensitiveKey(key) {
  return SENSITIVE_PATTERNS.some((re) => re.test(key));
}

/**
 * Check if a value is suspiciously weak.
 */
function isWeakValue(value) {
  return WEAK_VALUE_PATTERNS.some((re) => re.test(value));
}

/**
 * Run all audit checks against an env map.
 * Returns an array of issue objects: { key, severity, message }
 */
function auditEnv(envMap) {
  const issues = [];

  for (const [key, value] of Object.entries(envMap)) {
    // Empty values for sensitive keys
    if (isSensitiveKey(key) && value.trim() === '') {
      issues.push({
        key,
        severity: 'error',
        message: `Sensitive key "${key}" has an empty value`,
      });
    }

    // Weak placeholder values on sensitive keys
    if (isSensitiveKey(key) && isWeakValue(value)) {
      issues.push({
        key,
        severity: 'warning',
        message: `Sensitive key "${key}" appears to use a weak/placeholder value`,
      });
    }

    // Keys with whitespace in name
    if (/\s/.test(key)) {
      issues.push({
        key,
        severity: 'error',
        message: `Key "${key}" contains whitespace`,
      });
    }

    // Values that look like they contain unexpanded variables
    if (/\$\{[^}]+\}/.test(value)) {
      issues.push({
        key,
        severity: 'warning',
        message: `Value for "${key}" contains unexpanded variable reference`,
      });
    }
  }

  return issues;
}

/**
 * Returns true if any issue has severity 'error'.
 */
function hasAuditErrors(issues) {
  return issues.some((i) => i.severity === 'error');
}

/**
 * Format issues into human-readable lines.
 */
function formatAuditIssues(issues) {
  if (issues.length === 0) return ['No issues found.'];
  return issues.map(
    (i) => `[${i.severity.toUpperCase()}] ${i.key}: ${i.message}`
  );
}

module.exports = { isSensitiveKey, isWeakValue, auditEnv, hasAuditErrors, formatAuditIssues };
