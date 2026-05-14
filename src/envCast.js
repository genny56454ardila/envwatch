// envCast.js — Cast env string values to typed JavaScript values

/**
 * Cast a string value to a boolean if it matches known truthy/falsy strings.
 */
function castBoolean(value) {
  if (['true', '1', 'yes', 'on'].includes(value.toLowerCase())) return true;
  if (['false', '0', 'no', 'off'].includes(value.toLowerCase())) return false;
  return null;
}

/**
 * Cast a string value to a number if it looks numeric.
 */
function castNumber(value) {
  const n = Number(value);
  return isNaN(n) ? null : n;
}

/**
 * Cast a string value to an array by splitting on commas.
 */
function castArray(value) {
  return value.split(',').map(v => v.trim()).filter(v => v.length > 0);
}

/**
 * Attempt to parse a string as JSON.
 */
function castJSON(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

/**
 * Auto-detect and cast a single string value to its most likely type.
 * Order: boolean → number → JSON → string
 */
function autoCast(value) {
  if (typeof value !== 'string') return value;

  const bool = castBoolean(value);
  if (bool !== null) return bool;

  const num = castNumber(value);
  if (num !== null) return num;

  const json = castJSON(value);
  if (json !== null && typeof json === 'object') return json;

  return value;
}

/**
 * Cast all values in an env map using autoCast.
 * Returns a new plain object with typed values.
 */
function castEnv(envMap) {
  const result = {};
  for (const [key, value] of Object.entries(envMap)) {
    result[key] = autoCast(value);
  }
  return result;
}

/**
 * Cast specific keys using explicit type hints: 'boolean' | 'number' | 'array' | 'json' | 'string'
 */
function castEnvWithSchema(envMap, schema) {
  const result = {};
  for (const [key, value] of Object.entries(envMap)) {
    const type = schema[key];
    if (!type || type === 'string') {
      result[key] = value;
    } else if (type === 'boolean') {
      result[key] = castBoolean(value) ?? value;
    } else if (type === 'number') {
      result[key] = castNumber(value) ?? value;
    } else if (type === 'array') {
      result[key] = castArray(value);
    } else if (type === 'json') {
      result[key] = castJSON(value) ?? value;
    } else {
      result[key] = value;
    }
  }
  return result;
}

module.exports = { castBoolean, castNumber, castArray, castJSON, autoCast, castEnv, castEnvWithSchema };
