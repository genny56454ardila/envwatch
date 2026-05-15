const {
  isSensitiveKey,
  maskValue,
  partialMask,
  maskEnv,
  listMaskedKeys,
  serializeMasked,
} = require('./envMask');

function makeMap(obj) {
  return new Map(Object.entries(obj));
}

describe('isSensitiveKey', () => {
  it('detects password keys', () => {
    expect(isSensitiveKey('DB_PASSWORD')).toBe(true);
    expect(isSensitiveKey('USER_PASSWD')).toBe(true);
  });

  it('detects token keys', () => {
    expect(isSensitiveKey('AUTH_TOKEN')).toBe(true);
    expect(isSensitiveKey('API_KEY')).toBe(true);
  });

  it('detects secret keys', () => {
    expect(isSensitiveKey('APP_SECRET')).toBe(true);
  });

  it('returns false for non-sensitive keys', () => {
    expect(isSensitiveKey('NODE_ENV')).toBe(false);
    expect(isSensitiveKey('PORT')).toBe(false);
    expect(isSensitiveKey('APP_NAME')).toBe(false);
  });
});

describe('maskValue', () => {
  it('replaces value with default mask', () => {
    expect(maskValue('supersecret')).toBe('********');
  });

  it('uses custom mask char string', () => {
    expect(maskValue('abc', '[REDACTED]')).toBe('[REDACTED]');
  });

  it('returns empty value unchanged', () => {
    expect(maskValue('')).toBe('');
  });
});

describe('partialMask', () => {
  it('shows last 4 chars by default', () => {
    const result = partialMask('mysecretvalue1234');
    expect(result).toMatch(/\*{8}1234$/);
  });

  it('returns full mask for short values', () => {
    expect(partialMask('ab')).toBe('********');
  });
});

describe('maskEnv', () => {
  it('masks sensitive keys and leaves others', () => {
    const env = makeMap({ DB_PASSWORD: 'secret123', PORT: '3000', API_KEY: 'key-abc' });
    const result = maskEnv(env);
    expect(result.get('DB_PASSWORD')).toBe('********');
    expect(result.get('API_KEY')).toBe('********');
    expect(result.get('PORT')).toBe('3000');
  });

  it('masks custom keys', () => {
    const env = makeMap({ MY_CUSTOM: 'value', PORT: '8080' });
    const result = maskEnv(env, { customKeys: ['MY_CUSTOM'] });
    expect(result.get('MY_CUSTOM')).toBe('********');
    expect(result.get('PORT')).toBe('8080');
  });

  it('supports partial masking', () => {
    const env = makeMap({ DB_PASSWORD: 'supersecret1234' });
    const result = maskEnv(env, { partial: true, visibleChars: 4 });
    expect(result.get('DB_PASSWORD')).toMatch(/1234$/);
  });
});

describe('listMaskedKeys', () => {
  it('returns list of sensitive key names', () => {
    const env = makeMap({ DB_PASSWORD: 'x', NODE_ENV: 'dev', AUTH_TOKEN: 'y' });
    const keys = listMaskedKeys(env);
    expect(keys).toContain('DB_PASSWORD');
    expect(keys).toContain('AUTH_TOKEN');
    expect(keys).not.toContain('NODE_ENV');
  });
});

describe('serializeMasked', () => {
  it('serializes masked map to env format', () => {
    const masked = makeMap({ PORT: '3000', DB_PASSWORD: '********' });
    const output = serializeMasked(masked);
    expect(output).toContain('PORT=3000');
    expect(output).toContain('DB_PASSWORD=********');
  });
});
