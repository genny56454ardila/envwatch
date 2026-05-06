const { validateEnv, validateType, validatePattern } = require('./envValidator');

describe('validateType', () => {
  test('accepts any string', () => {
    expect(validateType('hello', 'string')).toBe(true);
    expect(validateType('123', 'string')).toBe(true);
  });

  test('validates number type', () => {
    expect(validateType('42', 'number')).toBe(true);
    expect(validateType('3.14', 'number')).toBe(true);
    expect(validateType('abc', 'number')).toBe(false);
  });

  test('validates boolean type', () => {
    expect(validateType('true', 'boolean')).toBe(true);
    expect(validateType('false', 'boolean')).toBe(true);
    expect(validateType('yes', 'boolean')).toBe(false);
    expect(validateType('1', 'boolean')).toBe(false);
  });
});

describe('validatePattern', () => {
  test('matches valid pattern', () => {
    expect(validatePattern('abc123', /^[a-z0-9]+$/)).toBe(true);
  });

  test('rejects non-matching value', () => {
    expect(validatePattern('ABC', /^[a-z]+$/)).toBe(false);
  });
});

describe('validateEnv', () => {
  const schema = {
    PORT: { required: true, type: 'number' },
    NODE_ENV: { required: true, pattern: /^(development|production|test)$/ },
    DEBUG: { required: false, type: 'boolean' },
    API_KEY: { required: false },
  };

  test('passes with valid env', () => {
    const env = { PORT: '3000', NODE_ENV: 'development', DEBUG: 'true' };
    const result = validateEnv(env, schema);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('reports missing required key', () => {
    const env = { NODE_ENV: 'production' };
    const result = validateEnv(env, schema);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing required variable: PORT');
  });

  test('reports type mismatch', () => {
    const env = { PORT: 'not-a-number', NODE_ENV: 'test' };
    const result = validateEnv(env, schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/Invalid type for PORT/);
  });

  test('reports pattern mismatch', () => {
    const env = { PORT: '8080', NODE_ENV: 'staging' };
    const result = validateEnv(env, schema);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/Invalid format for NODE_ENV/);
  });

  test('optional missing key is ignored', () => {
    const env = { PORT: '3000', NODE_ENV: 'test' };
    const result = validateEnv(env, schema);
    expect(result.valid).toBe(true);
  });

  test('accumulates multiple errors', () => {
    const env = {};
    const result = validateEnv(env, schema);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});
