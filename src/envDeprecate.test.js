const {
  buildDeprecationMap,
  findDeprecatedKeys,
  applyReplacements,
  formatDeprecationIssues,
  hasDeprecations,
} = require('./envDeprecate');

const makeMap = (obj) => new Map(Object.entries(obj));

describe('buildDeprecationMap', () => {
  it('builds a map from entries array', () => {
    const map = buildDeprecationMap([
      { from: 'OLD_KEY', to: 'NEW_KEY', reason: 'renamed' },
      { from: 'LEGACY_PORT', to: 'PORT' },
    ]);
    expect(map.get('OLD_KEY')).toEqual({ to: 'NEW_KEY', reason: 'renamed' });
    expect(map.get('LEGACY_PORT')).toEqual({ to: 'PORT', reason: undefined });
  });

  it('returns empty map for empty entries', () => {
    expect(buildDeprecationMap([]).size).toBe(0);
  });
});

describe('findDeprecatedKeys', () => {
  const deprecationMap = buildDeprecationMap([
    { from: 'OLD_KEY', to: 'NEW_KEY', reason: 'renamed' },
    { from: 'REMOVED_VAR' },
  ]);

  it('finds deprecated keys in env', () => {
    const env = makeMap({ OLD_KEY: 'val', ACTIVE: 'yes', REMOVED_VAR: '1' });
    const issues = findDeprecatedKeys(env, deprecationMap);
    expect(issues).toHaveLength(2);
    expect(issues.find(i => i.key === 'OLD_KEY').to).toBe('NEW_KEY');
    expect(issues.find(i => i.key === 'REMOVED_VAR').to).toBeUndefined();
  });

  it('returns empty array when no deprecated keys present', () => {
    const env = makeMap({ ACTIVE: 'yes', PORT: '3000' });
    expect(findDeprecatedKeys(env, deprecationMap)).toEqual([]);
  });
});

describe('applyReplacements', () => {
  const deprecationMap = buildDeprecationMap([
    { from: 'OLD_HOST', to: 'HOST' },
    { from: 'DEAD_VAR' },
  ]);

  it('renames keys with a replacement', () => {
    const env = makeMap({ OLD_HOST: 'localhost', PORT: '8080' });
    const result = applyReplacements(env, deprecationMap);
    expect(result.get('HOST')).toBe('localhost');
    expect(result.has('OLD_HOST')).toBe(false);
    expect(result.get('PORT')).toBe('8080');
  });

  it('keeps key if no replacement defined', () => {
    const env = makeMap({ DEAD_VAR: 'oops' });
    const result = applyReplacements(env, deprecationMap);
    expect(result.get('DEAD_VAR')).toBe('oops');
  });
});

describe('formatDeprecationIssues', () => {
  it('formats issue with to and reason', () => {
    const lines = formatDeprecationIssues([{ key: 'OLD', to: 'NEW', reason: 'renamed' }]);
    expect(lines[0]).toContain('DEPRECATED: OLD');
    expect(lines[0]).toContain('use NEW instead');
    expect(lines[0]).toContain('renamed');
  });

  it('formats issue with no replacement', () => {
    const lines = formatDeprecationIssues([{ key: 'GONE' }]);
    expect(lines[0]).toBe('DEPRECATED: GONE');
  });
});

describe('hasDeprecations', () => {
  it('returns true when issues exist', () => {
    expect(hasDeprecations([{ key: 'X' }])).toBe(true);
  });

  it('returns false for empty array', () => {
    expect(hasDeprecations([])).toBe(false);
  });
});
