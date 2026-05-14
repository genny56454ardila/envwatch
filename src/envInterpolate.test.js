const { interpolateValue, interpolateEnv, findUnresolved } = require('./envInterpolate');

function makeMap(obj) {
  return new Map(Object.entries(obj));
}

describe('interpolateValue', () => {
  test('resolves ${VAR} syntax', () => {
    const env = makeMap({ BASE: '/home/user' });
    expect(interpolateValue('${BASE}/app', env)).toBe('/home/user/app');
  });

  test('resolves $VAR syntax', () => {
    const env = makeMap({ HOST: 'localhost' });
    expect(interpolateValue('http://$HOST:3000', env)).toBe('http://localhost:3000');
  });

  test('leaves unknown refs as-is', () => {
    const env = makeMap({});
    expect(interpolateValue('${UNKNOWN}', env)).toBe('${UNKNOWN}');
  });

  test('handles recursive references', () => {
    const env = makeMap({ A: '${B}', B: 'hello' });
    expect(interpolateValue('${A}', env)).toBe('hello');
  });

  test('prevents infinite cycles', () => {
    const env = makeMap({ A: '${B}', B: '${A}' });
    // Should not throw or loop forever
    const result = interpolateValue('${A}', env);
    expect(typeof result).toBe('string');
  });

  test('returns value unchanged when no refs present', () => {
    const env = makeMap({ X: 'unused' });
    expect(interpolateValue('plain-value', env)).toBe('plain-value');
  });
});

describe('interpolateEnv', () => {
  test('resolves all values in map', () => {
    const env = makeMap({ ROOT: '/app', LOG: '${ROOT}/logs', DB: '${ROOT}/data' });
    const result = interpolateEnv(env);
    expect(result.get('LOG')).toBe('/app/logs');
    expect(result.get('DB')).toBe('/app/data');
    expect(result.get('ROOT')).toBe('/app');
  });

  test('returns new map without mutating original', () => {
    const env = makeMap({ A: '${B}', B: 'val' });
    const result = interpolateEnv(env);
    expect(env.get('A')).toBe('${B}');
    expect(result.get('A')).toBe('val');
  });
});

describe('findUnresolved', () => {
  test('returns keys with unresolved refs', () => {
    const env = makeMap({ A: '${MISSING}/path', B: 'ok' });
    expect(findUnresolved(env)).toEqual(['A']);
  });

  test('returns empty array when all resolved', () => {
    const env = makeMap({ BASE: '/x', FULL: '${BASE}/y' });
    expect(findUnresolved(env)).toEqual([]);
  });
});
