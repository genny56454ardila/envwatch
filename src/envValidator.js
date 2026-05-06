/**
 * envValidator.js
 * Validates env variables against a schema definition.
 * Schema format: { KEY: { required: bool, type: 'string'|'number'|'boolean', pattern: RegExp } }
 */

function validateType(value, type) {
  if (type === 'number') return !isNaN(Number(value));
  if (type === 'boolean') return value === 'true' || value === 'false';
  return true; // string accepts anything
}

function validatePattern(value, pattern) {
  return pattern.test(value);
}

/**
 * Validate a parsed env object against a schema.
 * @param {Object} env - key/value pairs from parsed .env
 * @param {Object} schema - validation schema
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateEnv(env, schema) {
  const errors = [];

  for (const [key, rules] of Object.entries(schema)) {
    const value = env[key];

    if (rules.required && (value === undefined || value === '')) {
      errors.push(`Missing required variable: ${key}`);
      continue;
    }

    if (value === undefined) continue;

    if (rules.type && !validateType(value, rules.type)) {
      errors.push(`Invalid type for ${key}: expected ${rules.type}, got "${value}"`);
    }

    if (rules.pattern && !validatePattern(value, rules.pattern)) {
      errors.push(`Invalid format for ${key}: "${value}" does not match ${rules.pattern}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Load a schema from a plain JS object file path (optional helper).
 * @param {string} schemaPath
 * @returns {Object}
 */
function loadSchema(schemaPath) {
  try {
    // eslint-disable-next-line import/no-dynamic-require
    return require(require('path').resolve(schemaPath));
  } catch (err) {
    throw new Error(`Failed to load schema from "${schemaPath}": ${err.message}`);
  }
}

module.exports = { validateEnv, validateType, validatePattern, loadSchema };
