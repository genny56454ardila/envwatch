const { diffEnv, hasChanges } = require('./diffEnv');

describe('diffEnv', () => {
  it('detects added keys', () => {
    const result = diffEnv({ A: '1' }, { A: '1', B: '2' });
    expect(result.added).toEqual({ B: '2' });
    expect(result.removed).toEqual([]);
    expect(result.changed).toEqual({});
  });

  it('detects removed keys', () => {
    const result = diffEnv({ A: '1', B: '2' }, { A: '1' });
    expect(result.removed).toContain('B');
    expect(result.added).toEqual({});
    expect(result.changed).toEqual({});
  });

  it('detects changed values', () => {
    const result = diffEnv({ PORT: '3000' }, { PORT: '4000' });
    expect(result.changed).toEqual({ PORT: { from: '3000', to: '4000' } });
    expect(result.added).toEqual({});
    expect(result.removed).toEqual([]);
  });

  it('returns empty diff for identical objects', () => {
    const result = diffEnv({ A: '1', B: '2' }, { A: '1', B: '2' });
    expect(result.added).toEqual({});
    expect(result.removed).toEqual([]);
    expect(result.changed).toEqual({});
  });

  it('handles empty prev', () => {
    const result = diffEnv({}, { X: 'hello' });
    expect(result.added).toEqual({ X: 'hello' });
  });

  it('handles empty next', () => {
    const result = diffEnv({ X: 'hello' }, {});
    expect(result.removed).toEqual(['X']);
  });
});

describe('hasChanges', () => {
  it('returns true when there are differences', () => {
    expect(hasChanges({ A: '1' }, { A: '2' })).toBe(true);
  });

  it('returns false for identical vars', () => {
    expect(hasChanges({ A: '1', B: '2' }, { A: '1', B: '2' })).toBe(false);
  });

  it('returns true when key is added', () => {
    expect(hasChanges({}, { NEW: 'val' })).toBe(true);
  });

  it('returns true when key is removed', () => {
    expect(hasChanges({ OLD: 'val' }, {})).toBe(true);
  });
});
