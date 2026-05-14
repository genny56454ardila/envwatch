const { groupByPrefix, groupByKeys, serializeGroups } = require('./envGroup');

function makeMap(obj) {
  return new Map(Object.entries(obj));
}

describe('groupByPrefix', () => {
  it('groups keys by prefix', () => {
    const env = makeMap({ DB_HOST: 'localhost', DB_PORT: '5432', APP_NAME: 'test', REDIS_URL: 'redis://localhost' });
    const groups = groupByPrefix(env);
    expect([...groups['DB'].keys()]).toEqual(['DB_HOST', 'DB_PORT']);
    expect([...groups['APP'].keys()]).toEqual(['APP_NAME']);
    expect([...groups['REDIS'].keys()]).toEqual(['REDIS_URL']);
  });

  it('places keys without separator into __ungrouped__', () => {
    const env = makeMap({ NOPREFIX: 'val', DB_HOST: 'localhost' });
    const groups = groupByPrefix(env);
    expect(groups['__ungrouped__'].get('NOPREFIX')).toBe('val');
  });

  it('supports custom separator', () => {
    const env = makeMap({ 'DB.HOST': 'localhost', 'DB.PORT': '5432' });
    const groups = groupByPrefix(env, '.');
    expect(groups['DB'].size).toBe(2);
  });
});

describe('groupByKeys', () => {
  it('assigns keys to named groups', () => {
    const env = makeMap({ DB_HOST: 'localhost', APP_NAME: 'myapp', SECRET: 'abc' });
    const defs = { database: ['DB_HOST'], app: ['APP_NAME'] };
    const groups = groupByKeys(env, defs);
    expect(groups['database'].get('DB_HOST')).toBe('localhost');
    expect(groups['app'].get('APP_NAME')).toBe('myapp');
    expect(groups['__ungrouped__'].get('SECRET')).toBe('abc');
  });

  it('ignores missing keys silently', () => {
    const env = makeMap({ A: '1' });
    const groups = groupByKeys(env, { g1: ['A', 'B'] });
    expect(groups['g1'].size).toBe(1);
  });
});

describe('serializeGroups', () => {
  it('outputs labeled sections', () => {
    const groups = { DB: makeMap({ DB_HOST: 'localhost' }), APP: makeMap({ APP_NAME: 'test' }) };
    const out = serializeGroups(groups);
    expect(out).toContain('# [DB]');
    expect(out).toContain('DB_HOST=localhost');
    expect(out).toContain('# [APP]');
  });
});
