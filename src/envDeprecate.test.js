import { describe, it, expect } from 'vitest';
import {
  buildDeprecationMap,
  findDeprecatedKeys,
  applyReplacements,
  formatDeprecationIssues,
  hasDeprecations,
} from './envDeprecate.js';

const makeMap = (obj) => new Map(Object.entries(obj));

describe('buildDeprecationMap', () => {
  it('builds a map from array of deprecation rules', () => {
    const rules = [
      { key: 'OLD_KEY', replacement: 'NEW_KEY' },
      { key: 'LEGACY_HOST', replacement: 'APP_HOST' },
    ];
    const map = buildDeprecationMap(rules);
    expect(map.get('OLD_KEY')).toEqual({ replacement: 'NEW_KEY' });
    expect(map.get('LEGACY_HOST')).toEqual({ replacement: 'APP_HOST' });
  });

  it('supports rules without replacement', () => {
    const rules = [{ key: 'DEAD_KEY' }];
    const map = buildDeprecationMap(rules);
    expect(map.get('DEAD_KEY')).toEqual({ replacement: undefined });
  });
});

describe('findDeprecatedKeys', () => {
  it('returns deprecated keys present in env', () => {
    const env = makeMap({ OLD_KEY: 'foo', NORMAL: 'bar', LEGACY_HOST: 'localhost' });
    const rules = [
      { key: 'OLD_KEY', replacement: 'NEW_KEY' },
      { key: 'LEGACY_HOST', replacement: 'APP_HOST' },
    ];
    const found = findDeprecatedKeys(env, buildDeprecationMap(rules));
    expect(found.map((f) => f.key)).toContain('OLD_KEY');
    expect(found.map((f) => f.key)).toContain('LEGACY_HOST');
    expect(found.map((f) => f.key)).not.toContain('NORMAL');
  });

  it('returns empty array when no deprecated keys found', () => {
    const env = makeMap({ CLEAN: 'yes' });
    const rules = [{ key: 'OLD_KEY', replacement: 'NEW_KEY' }];
    expect(findDeprecatedKeys(env, buildDeprecationMap(rules))).toEqual([]);
  });
});

describe('applyReplacements', () => {
  it('renames deprecated keys to their replacements', () => {
    const env = makeMap({ OLD_KEY: 'value', KEEP: 'this' });
    const rules = [{ key: 'OLD_KEY', replacement: 'NEW_KEY' }];
    const result = applyReplacements(env, buildDeprecationMap(rules));
    expect(result.has('NEW_KEY')).toBe(true);
    expect(result.get('NEW_KEY')).toBe('value');
    expect(result.has('OLD_KEY')).toBe(false);
    expect(result.get('KEEP')).toBe('this');
  });

  it('removes deprecated keys with no replacement', () => {
    const env = makeMap({ DEAD_KEY: 'gone', STAY: 'here' });
    const rules = [{ key: 'DEAD_KEY' }];
    const result = applyReplacements(env, buildDeprecationMap(rules));
    expect(result.has('DEAD_KEY')).toBe(false);
    expect(result.has('STAY')).toBe(true);
  });
});

describe('formatDeprecationIssues', () => {
  it('formats issues with replacements', () => {
    const issues = [{ key: 'OLD_KEY', replacement: 'NEW_KEY', value: 'x' }];
    const lines = formatDeprecationIssues(issues);
    expect(lines[0]).toMatch(/OLD_KEY/);
    expect(lines[0]).toMatch(/NEW_KEY/);
  });

  it('formats issues without replacements', () => {
    const issues = [{ key: 'DEAD', replacement: undefined, value: 'y' }];
    const lines = formatDeprecationIssues(issues);
    expect(lines[0]).toMatch(/DEAD/);
    expect(lines[0]).toMatch(/no replacement/i);
  });
});

describe('hasDeprecations', () => {
  it('returns true when issues exist', () => {
    expect(hasDeprecations([{ key: 'X' }])).toBe(true);
  });

  it('returns false when empty', () => {
    expect(hasDeprecations([])).toBe(false);
  });
});
