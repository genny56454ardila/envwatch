const { extractScope, injectScope, listScopes, applyScopeOverrides } = require('./envScope');

function makeMap(obj) {
  return new Map(Object.entries(obj));
}

describe('extractScope', () => {
  test('extracts keys matching scope', () => {
    const env = makeMap({ APP_DEV_PORT: '3000', APP_PROD_PORT: '8080', NAME: 'test' });
    const result = extractScope(env, 'dev');
    expect(result.get('APP_PORT')).toBe('3000');
    expect(result.has('APP_PROD_PORT')).toBe(false);
    expect(result.has('NAME')).toBe(false);
  });

  test('is case-insensitive on scope', () => {
    const env = makeMap({ DB_STAGING_HOST: 'localhost' });
    expect(extractScope(env, 'staging').get('DB_HOST')).toBe('localhost');
    expect(extractScope(env, 'STAGING').get('DB_HOST')).toBe('localhost');
  });

  test('returns empty map when no matches', () => {
    const env = makeMap({ FOO: 'bar' });
    expect(extractScope(env, 'prod').size).toBe(0);
  });

  test('throws on missing scope', () => {
    expect(() => extractScope(makeMap({}), '')).toThrow();
  });
});

describe('injectScope', () => {
  test('injects scope into keys', () => {
    const env = makeMap({ PORT: '3000', HOST: 'localhost' });
    const result = injectScope(env, 'dev');
    expect(result.get('DEV_PORT')).toBe('3000');
    expect(result.get('DEV_HOST')).toBe('localhost');
  });

  test('prepends namespace when provided', () => {
    const env = makeMap({ PORT: '8080' });
    const result = injectScope(env, 'prod', 'app');
    expect(result.get('APP_PROD_PORT')).toBe('8080');
  });

  test('throws without scope', () => {
    expect(() => injectScope(makeMap({}), '')).toThrow();
  });
});

describe('listScopes', () => {
  test('lists all distinct scopes', () => {
    const env = makeMap({
      APP_DEV_PORT: '3000',
      APP_PROD_PORT: '8080',
      APP_STAGING_HOST: 'host',
      UNRELATED: 'x'
    });
    expect(listScopes(env, 'app')).toEqual(['DEV', 'PROD', 'STAGING']);
  });

  test('works without namespace', () => {
    const env = makeMap({ DEV_PORT: '3000', PROD_PORT: '8080' });
    const scopes = listScopes(env);
    expect(scopes).toContain('DEV');
    expect(scopes).toContain('PROD');
  });

  test('returns empty array when no scopes found', () => {
    expect(listScopes(makeMap({ FOO: 'bar' }), 'app')).toEqual([]);
  });
});

describe('applyScopeOverrides', () => {
  test('scoped keys override base keys', () => {
    const base = makeMap({ PORT: '3000', HOST: 'localhost' });
    const env = makeMap({ APP_PROD_PORT: '8080', APP_PROD_HOST: 'prod.example.com' });
    const result = applyScopeOverrides(base, env, 'prod', 'app');
    expect(result.get('PORT')).toBe('8080');
    expect(result.get('HOST')).toBe('prod.example.com');
  });

  test('base keys not in scope are preserved', () => {
    const base = makeMap({ PORT: '3000', DEBUG: 'true' });
    const env = makeMap({ APP_PROD_PORT: '8080' });
    const result = applyScopeOverrides(base, env, 'prod', 'app');
    expect(result.get('DEBUG')).toBe('true');
  });
});
