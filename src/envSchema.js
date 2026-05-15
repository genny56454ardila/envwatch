// envSchema.js — Generate JSON schema from .env files or validate against one

/**
 * Infer a JSON schema type from a string value
 */
function inferType(value) {
  if (value === 'true' || value === 'false') return 'boolean';
  if (!isNaN(value) && value.trim() !== '') return 'number';
  if (value.startsWith('[') || value.startsWith('{')) return 'string'; // JSON-ish
  return 'string';
}

/**
 * Generate a JSON schema object from an env Map
 * @param {Map<string, string>} envMap
 * @param {object} options
 * @returns {object}
 */
function generateSchema(envMap, options = {}) {
  const { required = true, title = 'env schema' } = options;
  const properties = {};
  const requiredKeys = [];

  for (const [key, value] of envMap) {
    const type = inferType(value);
    properties[key] = { type };
    if (required) requiredKeys.push(key);
  }

  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title,
    type: 'object',
    properties,
    ...(required && requiredKeys.length ? { required: requiredKeys } : {})
  };
}

/**
 * Validate an env Map against a JSON schema object
 * Returns array of issue strings
 * @param {Map<string, string>} envMap
 * @param {object} schema
 * @returns {string[]}
 */
function validateAgainstSchema(envMap, schema) {
  const issues = [];
  const props = schema.properties || {};
  const requiredKeys = schema.required || [];

  for (const key of requiredKeys) {
    if (!envMap.has(key)) {
      issues.push(`Missing required key: ${key}`);
    }
  }

  for (const [key, value] of envMap) {
    if (!props[key]) continue;
    const expected = props[key].type;
    const actual = inferType(value);
    if (expected && actual !== expected) {
      issues.push(`Type mismatch for ${key}: expected ${expected}, got ${actual} (value: "${value}")`);
    }
  }

  return issues;
}

/**
 * Serialize schema to pretty JSON string
 */
function serializeSchema(schema) {
  return JSON.stringify(schema, null, 2);
}

module.exports = { inferType, generateSchema, validateAgainstSchema, serializeSchema };
