const { inheritEnv, inheritedKeys, overriddenKeys, inheritEnvFiles } = require('./envInherit');
const fs = require('fs');
const os = require('os');
const path = require('path');

function makeMap(obj) {
  return new Map(Object.entries(obj));
}

function writeTmp(content) {
  const p = path.join(os.tmpdir(), `envInherit_${Date.now()}_${Math.random().toString(36).slice(2)}.env`);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('inheritEnv', () => {
  test('child values override base', () => {
    const base = makeMap({ A: '1', B: '2', C: '3' });
    const child = makeMap({ B: '20', D: '4' });
    const result = inheritEnv(base, child);
    expect(result.get('A')).toBe('1');
    expect(result.get('B')).toBe('20');
    expect(result.get('C')).toBe('3');
    expect(result.get('D')).toBe('4');
  });

  test('empty child returns base', () => {
    const base = makeMap({ X: 'hello' });
    const result = inheritEnv(base, new Map());
    expect(result.get('X')).toBe('hello');
  });

  test('empty base returns child', () => {
    const child = makeMap({ Y: 'world' });
    const result = inheritEnv(new Map(), child);
    expect(result.get('Y')).toBe('world');
  });
});

describe('inheritedKeys', () => {
  test('returns base keys not in child', () => {
    const base = makeMap({ A: '1', B: '2' });
    const child = makeMap({ B: '20' });
    expect(inheritedKeys(base, child)).toEqual(['A']);
  });

  test('empty when child overrides all', () => {
    const base = makeMap({ A: '1' });
    const child = makeMap({ A: '2' });
    expect(inheritedKeys(base, child)).toHaveLength(0);
  });
});

describe('overriddenKeys', () => {
  test('returns keys child shares with base', () => {
    const base = makeMap({ A: '1', B: '2' });
    const child = makeMap({ B: '20', C: '3' });
    expect(overriddenKeys(base, child)).toEqual(['B']);
  });
});

describe('inheritEnvFiles', () => {
  test('reads and merges two files', () => {
    const basePath = writeTmp('HOST=localhost\nPORT=3000\nDEBUG=false');
    const childPath = writeTmp('PORT=8080\nAPP_NAME=myapp');
    const result = inheritEnvFiles(basePath, childPath);
    expect(result.get('HOST')).toBe('localhost');
    expect(result.get('PORT')).toBe('8080');
    expect(result.get('DEBUG')).toBe('false');
    expect(result.get('APP_NAME')).toBe('myapp');
  });
});
