const { renameKey, renameKeys, serializeEnvMap, renameInFile } = require('./envRename');
const fs = require('fs');
const os = require('os');
const path = require('path');

function writeTmp(content) {
  const p = path.join(os.tmpdir(), `envwatch-rename-${Date.now()}.env`);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('renameKey', () => {
  test('renames an existing key', () => {
    const env = new Map([['OLD_KEY', 'value1'], ['OTHER', 'value2']]);
    const result = renameKey(env, 'OLD_KEY', 'NEW_KEY');
    expect(result.has('NEW_KEY')).toBe(true);
    expect(result.get('NEW_KEY')).toBe('value1');
    expect(result.has('OLD_KEY')).toBe(false);
  });

  test('preserves other keys', () => {
    const env = new Map([['A', '1'], ['B', '2']]);
    const result = renameKey(env, 'A', 'C');
    expect(result.get('C')).toBe('1');
    expect(result.get('B')).toBe('2');
  });

  test('returns unchanged map if key not found', () => {
    const env = new Map([['A', '1']]);
    const result = renameKey(env, 'MISSING', 'NEW');
    expect(result.has('MISSING')).toBe(false);
    expect(result.has('NEW')).toBe(false);
    expect(result.get('A')).toBe('1');
  });

  test('throws if new key already exists', () => {
    const env = new Map([['A', '1'], ['B', '2']]);
    expect(() => renameKey(env, 'A', 'B')).toThrow();
  });
});

describe('renameKeys', () => {
  test('renames multiple keys', () => {
    const env = new Map([['FOO', 'a'], ['BAR', 'b'], ['BAZ', 'c']]);
    const result = renameKeys(env, { FOO: 'FOO2', BAR: 'BAR2' });
    expect(result.has('FOO2')).toBe(true);
    expect(result.has('BAR2')).toBe(true);
    expect(result.has('BAZ')).toBe(true);
    expect(result.has('FOO')).toBe(false);
  });
});

describe('serializeEnvMap', () => {
  test('serializes map to .env format', () => {
    const env = new Map([['KEY', 'val'], ['OTHER', 'hello world']]);
    const out = serializeEnvMap(env);
    expect(out).toContain('KEY=val');
    expect(out).toContain('OTHER=hello world');
  });
});

describe('renameInFile', () => {
  test('renames a key in a file and writes result', () => {
    const tmp = writeTmp('OLD=123\nKEEP=abc\n');
    const outPath = writeTmp('');
    renameInFile(tmp, { OLD: 'NEW_NAME' }, outPath);
    const content = fs.readFileSync(outPath, 'utf8');
    expect(content).toContain('NEW_NAME=123');
    expect(content).toContain('KEEP=abc');
    expect(content).not.toContain('OLD=');
    fs.unlinkSync(tmp);
    fs.unlinkSync(outPath);
  });
});
