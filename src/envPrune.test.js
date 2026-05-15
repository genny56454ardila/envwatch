const { pruneByAllowedKeys, pruneEmpty, pruneUnchanged, listPruned, pruneEnv } = require('./envPrune');

function makeMap(obj) {
  return new Map(Object.entries(obj));
}

describe('pruneByAllowedKeys', () => {
  test('keeps only allowed keys', () => {
    const env = makeMap({ A: '1', B: '2', C: '3' });
    const result = pruneByAllowedKeys(env, ['A', 'C']);
    expect([...result.keys()]).toEqual(['A', 'C']);
    expect(result.has('B')).toBe(false);
  });

  test('returns empty map if no keys allowed', () => {
    const env = makeMap({ A: '1' });
    expect(pruneByAllowedKeys(env, []).size).toBe(0);
  });

  test('returns all keys if all are allowed', () => {
    const env = makeMap({ X: 'a', Y: 'b' });
    const result = pruneByAllowedKeys(env, ['X', 'Y', 'Z']);
    expect(result.size).toBe(2);
  });
});

describe('pruneEmpty', () => {
  test('removes keys with empty string values', () => {
    const env = makeMap({ A: 'hello', B: '', C: '  ', D: '0' });
    const result = pruneEmpty(env);
    expect(result.has('A')).toBe(true);
    expect(result.has('B')).toBe(false);
    expect(result.has('C')).toBe(false);
    expect(result.has('D')).toBe(true);
  });

  test('returns same map if no empty values', () => {
    const env = makeMap({ A: 'x', B: 'y' });
    expect(pruneEmpty(env).size).toBe(2);
  });
});

describe('pruneUnchanged', () => {
  test('removes keys with same value as reference', () => {
    const env = makeMap({ A: '1', B: '2', C: '3' });
    const ref = makeMap({ A: '1', C: 'old' });
    const result = pruneUnchanged(env, ref);
    expect(result.has('A')).toBe(false);
    expect(result.has('B')).toBe(true);
    expect(result.has('C')).toBe(true);
  });

  test('keeps keys not in reference', () => {
    const env = makeMap({ NEW: 'val' });
    const ref = makeMap({});
    expect(pruneUnchanged(env, ref).has('NEW')).toBe(true);
  });
});

describe('listPruned', () => {
  test('returns removed keys', () => {
    const original = makeMap({ A: '1', B: '2', C: '3' });
    const pruned = makeMap({ B: '2' });
    const removed = listPruned(original, pruned);
    expect(removed).toContain('A');
    expect(removed).toContain('C');
    expect(removed).not.toContain('B');
  });
});

describe('pruneEnv', () => {
  test('applies allowedKeys option', () => {
    const env = makeMap({ A: '1', B: '2' });
    const result = pruneEnv(env, { allowedKeys: ['A'] });
    expect(result.size).toBe(1);
  });

  test('applies pruneEmpty option', () => {
    const env = makeMap({ A: '', B: 'val' });
    const result = pruneEnv(env, { pruneEmpty: true });
    expect(result.has('A')).toBe(false);
  });

  test('applies referenceMap option', () => {
    const env = makeMap({ A: 'same', B: 'changed' });
    const ref = makeMap({ A: 'same' });
    const result = pruneEnv(env, { referenceMap: ref });
    expect(result.has('A')).toBe(false);
    expect(result.has('B')).toBe(true);
  });

  test('no options returns original map unchanged', () => {
    const env = makeMap({ A: '1', B: '2' });
    expect(pruneEnv(env).size).toBe(2);
  });
});
