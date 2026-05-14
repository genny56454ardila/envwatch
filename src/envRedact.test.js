const {
  isSensitiveKey,
  redactValue,
  redactEnv,
  listRedactedKeys,
  serializeRedacted,
} = require('./envRedact');

describe('isSensitiveKey', () => {
  test('detects password keys', () => {
    expect(isSensitiveKey('DB_PASSWORD')).toBe(true);
    expect(isSensitiveKey('password')).toBe(true);
  });

  test('detects token keys', () => {
    expect(isSensitiveKey('ACCESS_TOKEN')).toBe(true);
    expect(isSensitiveKey('GITHUB_TOKEN')).toBe(true);
  });

  test('detects api key variants', () => {
    expect(isSensitiveKey('API_KEY')).toBe(true);
    expect(isSensitiveKey('STRIPE_APIKEY')).toBe(true);
  });

  test('allows safe keys', () => {
    expect(isSensitiveKey('PORT')).toBe(false);
    expect(isSensitiveKey('NODE_ENV')).toBe(false);
    expect(isSensitiveKey('APP_NAME')).toBe(false);
  });
});

describe('redactValue', () => {
  test('redacts sensitive value', () => {
    expect(redactValue('DB_PASSWORD', 'hunter2')).toBe('***REDACTED***');
  });

  test('keeps safe value', () => {
    expect(redactValue('PORT', '3000')).toBe('3000');
  });

  test('uses custom mask', () => {
    expect(redactValue('SECRET_KEY', 'abc', '[hidden]')).toBe('[hidden]');
  });
});

describe('redactEnv', () => {
  const env = {
    PORT: '3000',
    DB_PASSWORD: 'hunter2',
    API_KEY: 'xyz123',
    APP_NAME: 'myapp',
  };

  test('redacts sensitive keys only', () => {
    const result = redactEnv(env);
    expect(result.PORT).toBe('3000');
    expect(result.APP_NAME).toBe('myapp');
    expect(result.DB_PASSWORD).toBe('***REDACTED***');
    expect(result.API_KEY).toBe('***REDACTED***');
  });

  test('does not mutate original', () => {
    redactEnv(env);
    expect(env.DB_PASSWORD).toBe('hunter2');
  });
});

describe('listRedactedKeys', () => {
  test('returns only sensitive keys', () => {
    const env = { PORT: '3000', DB_PASSWORD: 'x', TOKEN: 'y', HOST: 'localhost' };
    expect(listRedactedKeys(env)).toEqual(['DB_PASSWORD', 'TOKEN']);
  });

  test('returns empty array when none sensitive', () => {
    expect(listRedactedKeys({ PORT: '3000', HOST: 'localhost' })).toEqual([]);
  });
});

describe('serializeRedacted', () => {
  test('serializes to .env lines', () => {
    const result = serializeRedacted({ PORT: '3000', DB_PASSWORD: '***REDACTED***' });
    expect(result).toContain('PORT=3000');
    expect(result).toContain('DB_PASSWORD=***REDACTED***');
  });
});
