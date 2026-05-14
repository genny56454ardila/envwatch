'use strict';

const { buildAliasMap, resolveAliases, listAliasesInEnv, stripAliases } = require('./envAlias');

const aliasConfig = {
  DATABASE_URL: ['DB_URL', 'DB_CONNECTION'],
  SECRET_KEY: ['APP_SECRET'],
};

describe('buildAliasMap', () => {
  it('maps each alias to its canonical key', () => {
    const map = buildAliasMap(aliasConfig);
    expect(map.get('DB_URL')).toBe('DATABASE_URL');
    expect(map.get('DB_CONNECTION')).toBe('DATABASE_URL');
    expect(map.get('APP_SECRET')).toBe('SECRET_KEY');
  });

  it('ignores entries where aliases is not an array', () => {
    const map = buildAliasMap({ FOO: 'not-an-array' });
    expect(map.size).toBe(0);
  });
});

describe('resolveAliases', () => {
  it('adds canonical key when alias present and canonical missing', () => {
    const aliasMap = buildAliasMap(aliasConfig);
    const envMap = new Map([['DB_URL', 'postgres://localhost/db']]);
    const result = resolveAliases(envMap, aliasMap);
    expect(result.get('DATABASE_URL')).toBe('postgres://localhost/db');
    expect(result.get('DB_URL')).toBe('postgres://localhost/db');
  });

  it('does not overwrite existing canonical key', () => {
    const aliasMap = buildAliasMap(aliasConfig);
    const envMap = new Map([
      ['DATABASE_URL', 'original'],
      ['DB_URL', 'from-alias'],
    ]);
    const result = resolveAliases(envMap, aliasMap);
    expect(result.get('DATABASE_URL')).toBe('original');
  });

  it('returns unchanged map when no aliases match', () => {
    const aliasMap = buildAliasMap(aliasConfig);
    const envMap = new Map([['PORT', '3000']]);
    const result = resolveAliases(envMap, aliasMap);
    expect(result.get('PORT')).toBe('3000');
    expect(result.size).toBe(1);
  });
});

describe('listAliasesInEnv', () => {
  it('returns alias entries found in env map', () => {
    const aliasMap = buildAliasMap(aliasConfig);
    const envMap = new Map([['DB_URL', 'postgres://localhost'], ['PORT', '8080']]);
    const found = listAliasesInEnv(envMap, aliasMap);
    expect(found).toHaveLength(1);
    expect(found[0]).toEqual({ alias: 'DB_URL', canonical: 'DATABASE_URL', value: 'postgres://localhost' });
  });

  it('returns empty array when no aliases present', () => {
    const aliasMap = buildAliasMap(aliasConfig);
    const envMap = new Map([['NODE_ENV', 'development']]);
    expect(listAliasesInEnv(envMap, aliasMap)).toEqual([]);
  });
});

describe('stripAliases', () => {
  it('removes alias keys from env map', () => {
    const aliasMap = buildAliasMap(aliasConfig);
    const envMap = new Map([['DB_URL', 'val'], ['DATABASE_URL', 'val2'], ['PORT', '3000']]);
    const result = stripAliases(envMap, aliasMap);
    expect(result.has('DB_URL')).toBe(false);
    expect(result.has('DATABASE_URL')).toBe(true);
    expect(result.has('PORT')).toBe(true);
  });
});
