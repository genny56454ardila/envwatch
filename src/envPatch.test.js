const { applyPatch, removeKeys, renameKey, serializePatch } = require('./envPatch');

function makeMap(obj) {
  return new Map(Object.entries(obj));
}

describe('applyPatch', () => {
  test('adds new keys', () => {
    const m = makeMap({ A: '1' });
    const result = applyPatch(m, { B: '2' });
    expect(result.get('B')).toBe('2');
    expect(result.get('A')).toBe('1');
  });

  test('overwrites existing keys', () => {
    const m = makeMap({ A: 'old' });
    const result = applyPatch(m, { A: 'new' });
    expect(result.get('A')).toBe('new');
  });

  test('does not mutate original map', () => {
    const m = makeMap({ A: '1' });
    applyPatch(m, { A: '2' });
    expect(m.get('A')).toBe('1');
  });

  test('coerces values to strings', () => {
    const m = makeMap({});
    const result = applyPatch(m, { NUM: 42 });
    expect(result.get('NUM')).toBe('42');
  });
});

describe('removeKeys', () => {
  test('removes specified keys', () => {
    const m = makeMap({ A: '1', B: '2', C: '3' });
    const result = removeKeys(m, ['A', 'C']);
    expect(result.has('A')).toBe(false);
    expect(result.has('C')).toBe(false);
    expect(result.get('B')).toBe('2');
  });

  test('ignores missing keys silently', () => {
    const m = makeMap({ A: '1' });
    expect(() => removeKeys(m, ['Z'])).not.toThrow();
  });
});

describe('renameKey', () => {
  test('renames a key preserving value', () => {
    const m = makeMap({ OLD: 'hello' });
    const result = renameKey(m, 'OLD', 'NEW');
    expect(result.has('OLD')).toBe(false);
    expect(result.get('NEW')).toBe('hello');
  });

  test('returns unchanged map if key does not exist', () => {
    const m = makeMap({ A: '1' });
    const result = renameKey(m, 'MISSING', 'NEW');
    expect(result.has('NEW')).toBe(false);
    expect(result.size).toBe(1);
  });
});

describe('serializePatch', () => {
  test('serializes simple values', () => {
    const m = makeMap({ FOO: 'bar', BAZ: 'qux' });
    const out = serializePatch(m);
    expect(out).toContain('FOO=bar');
    expect(out).toContain('BAZ=qux');
  });

  test('quotes values with spaces', () => {
    const m = makeMap({ MSG: 'hello world' });
    const out = serializePatch(m);
    expect(out).toContain('MSG="hello world"');
  });

  test('ends with newline', () => {
    const m = makeMap({ A: '1' });
    expect(serializePatch(m).endsWith('\n')).toBe(true);
  });
});
