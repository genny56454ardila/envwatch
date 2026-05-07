const { compareEnvMaps, summarizeComparison } = require('./envCompare');

describe('compareEnvMaps', () => {
  const base = { FOO: 'bar', BAZ: 'qux', KEEP: 'same' };

  test('detects added keys', () => {
    const result = compareEnvMaps(base, { ...base, NEW_KEY: 'hello' });
    expect(result.added).toEqual(['NEW_KEY']);
    expect(result.removed).toEqual([]);
  });

  test('detects removed keys', () => {
    const { FOO, ...withoutFoo } = base;
    const result = compareEnvMaps(base, withoutFoo);
    expect(result.removed).toContain('FOO');
    expect(result.added).toEqual([]);
  });

  test('detects changed values', () => {
    const result = compareEnvMaps(base, { ...base, FOO: 'newval' });
    expect(result.changed).toContain('FOO');
    expect(result.unchanged).toContain('BAZ');
  });

  test('all unchanged when maps are identical', () => {
    const result = compareEnvMaps(base, { ...base });
    expect(result.added).toEqual([]);
    expect(result.removed).toEqual([]);
    expect(result.changed).toEqual([]);
    expect(result.unchanged).toHaveLength(3);
  });

  test('handles empty maps', () => {
    const result = compareEnvMaps({}, {});
    expect(result.added).toEqual([]);
    expect(result.removed).toEqual([]);
    expect(result.changed).toEqual([]);
    expect(result.unchanged).toEqual([]);
  });

  test('comparing empty A to non-empty B marks all as added', () => {
    const result = compareEnvMaps({}, { A: '1', B: '2' });
    expect(result.added).toHaveLength(2);
    expect(result.removed).toHaveLength(0);
  });
});

describe('summarizeComparison', () => {
  test('returns no-diff message when all unchanged', () => {
    const msg = summarizeComparison({ added: [], removed: [], changed: [], unchanged: ['X'] });
    expect(msg).toContain('Unchanged');
  });

  test('includes counts for each category', () => {
    const msg = summarizeComparison({
      added: ['A'],
      removed: ['B', 'C'],
      changed: ['D'],
      unchanged: []
    });
    expect(msg).toMatch(/Added.*1/);
    expect(msg).toMatch(/Removed.*2/);
    expect(msg).toMatch(/Changed.*1/);
  });

  test('returns fallback when no keys at all', () => {
    const msg = summarizeComparison({ added: [], removed: [], changed: [], unchanged: [] });
    expect(msg).toBe('No differences found.');
  });
});
