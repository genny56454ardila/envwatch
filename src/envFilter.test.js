const { filterByPrefix, filterByPattern, filterByKeys, excludeKeys, applyFilters } = require('./envFilter');

const sample = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  APP_NAME: 'envwatch',
  APP_ENV: 'development',
  SECRET_KEY: 'abc123',
};

describe('filterByPrefix', () => {
  it('keeps only keys with matching prefix', () => {
    const result = filterByPrefix(sample, 'DB_');
    expect(Object.keys(result)).toEqual(['DB_HOST', 'DB_PORT']);
  });

  it('is case-insensitive on prefix', () => {
    const result = filterByPrefix(sample, 'app_');
    expect(Object.keys(result)).toEqual(['APP_NAME', 'APP_ENV']);
  });

  it('returns empty object when no match', () => {
    expect(filterByPrefix(sample, 'NOPE_')).toEqual({});
  });
});

describe('filterByPattern', () => {
  it('filters by regex string', () => {
    const result = filterByPattern(sample, '_PORT$');
    expect(Object.keys(result)).toEqual(['DB_PORT']);
  });

  it('filters by RegExp object', () => {
    const result = filterByPattern(sample, /^(APP|DB)_/);
    expect(Object.keys(result)).toHaveLength(4);
  });

  it('returns empty when pattern matches nothing', () => {
    expect(filterByPattern(sample, 'ZZZNOMATCH')).toEqual({});
  });
});

describe('filterByKeys', () => {
  it('keeps only specified keys', () => {
    const result = filterByKeys(sample, ['APP_NAME', 'SECRET_KEY']);
    expect(result).toEqual({ APP_NAME: 'envwatch', SECRET_KEY: 'abc123' });
  });

  it('ignores missing keys silently', () => {
    const result = filterByKeys(sample, ['DB_HOST', 'MISSING']);
    expect(Object.keys(result)).toEqual(['DB_HOST']);
  });
});

describe('excludeKeys', () => {
  it('removes specified keys', () => {
    const result = excludeKeys(sample, ['SECRET_KEY']);
    expect(result).not.toHaveProperty('SECRET_KEY');
    expect(Object.keys(result)).toHaveLength(4);
  });
});

describe('applyFilters', () => {
  it('applies prefix and exclude together', () => {
    const result = applyFilters(sample, { prefix: 'DB_', exclude: ['DB_PORT'] });
    expect(result).toEqual({ DB_HOST: 'localhost' });
  });

  it('returns full map when no filters given', () => {
    expect(applyFilters(sample, {})).toEqual(sample);
  });

  it('applies pattern and keys together', () => {
    const result = applyFilters(sample, { pattern: /^APP_/, keys: ['APP_NAME'] });
    expect(result).toEqual({ APP_NAME: 'envwatch' });
  });
});
