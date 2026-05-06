const { mergeEnvs, mergeWithPriority, overrideKeys } = require('./envMerge');

describe('mergeEnvs', () => {
  test('merges two non-overlapping env objects', () => {
    const { merged, conflicts } = mergeEnvs({ A: '1' }, { B: '2' });
    expect(merged).toEqual({ A: '1', B: '2' });
    expect(conflicts).toHaveLength(0);
  });

  test('last source wins on conflict', () => {
    const { merged, conflicts } = mergeEnvs({ A: '1' }, { A: '2' });
    expect(merged.A).toBe('2');
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]).toMatchObject({ key: 'A', previous: '1', current: '2' });
  });

  test('no conflicts when values are identical', () => {
    const { conflicts } = mergeEnvs({ A: '1' }, { A: '1' });
    expect(conflicts).toHaveLength(0);
  });

  test('merges three sources correctly', () => {
    const { merged } = mergeEnvs({ A: '1', B: 'x' }, { B: 'y' }, { C: '3' });
    expect(merged).toEqual({ A: '1', B: 'y', C: '3' });
  });
});

describe('mergeWithPriority', () => {
  test('higher priority overrides lower', () => {
    const { merged } = mergeWithPriority([
      { env: { A: 'low' }, priority: 1 },
      { env: { A: 'high' }, priority: 10 },
    ]);
    expect(merged.A).toBe('high');
  });

  test('lower priority does not override higher', () => {
    const { merged } = mergeWithPriority([
      { env: { A: 'high' }, priority: 10 },
      { env: { A: 'low' }, priority: 1 },
    ]);
    expect(merged.A).toBe('low'); // sorted ascending, last wins
  });
});

describe('overrideKeys', () => {
  test('returns only differing keys', () => {
    const result = overrideKeys({ A: '1', B: '2' }, { A: '1', B: '3', C: '4' });
    expect(result).toEqual({ B: '3', C: '4' });
  });

  test('returns empty object when no differences', () => {
    const result = overrideKeys({ A: '1' }, { A: '1' });
    expect(result).toEqual({});
  });
});
