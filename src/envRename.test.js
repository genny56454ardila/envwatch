const fs = require('fs');
const os = require('os');
const path = require('path');
const { renameKey, renameKeys, serializeEnvMap, renameInFile } = require('./envRename');

function writeTmp(content) {
  const p = path.join(os.tmpdir(), `envwatch-rename-${Date.now()}.env`);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('renameKey', () => {
  test('renames an existing key', () => {
    const map = { FOO: 'bar', BAZ: 'qux' };
    const result = renameKey(map, 'FOO', 'NEW_FOO');
    expect(result).toHaveProperty('NEW_FOO', 'bar');
    expect(result).not.toHaveProperty('FOO');
    expect(result).toHaveProperty('BAZ', 'qux');
  });

  test('throws if old key does not exist', () => {
    expect(() => renameKey({ A: '1' }, 'MISSING', 'B')).toThrow('Key "MISSING" not found');
  });

  test('returns copy when old and new key are the same', () => {
    const map = { X: '42' };
    const result = renameKey(map, 'X', 'X');
    expect(result).toEqual({ X: '42' });
  });

  test('does not mutate original map', () => {
    const map = { FOO: 'bar' };
    renameKey(map, 'FOO', 'BAR');
    expect(map).toHaveProperty('FOO');
  });
});

describe('renameKeys', () => {
  test('applies multiple renames', () => {
    const map = { A: '1', B: '2', C: '3' };
    const result = renameKeys(map, { A: 'ALPHA', B: 'BETA' });
    expect(result).toEqual({ ALPHA: '1', BETA: '2', C: '3' });
  });

  test('throws if any source key is missing', () => {
    expect(() => renameKeys({ A: '1' }, { NOPE: 'X' })).toThrow();
  });
});

describe('serializeEnvMap', () => {
  test('produces KEY=VALUE lines', () => {
    const out = serializeEnvMap({ FOO: 'bar', NUM: '42' });
    expect(out).toContain('FOO=bar');
    expect(out).toContain('NUM=42');
  });

  test('ends with newline', () => {
    const out = serializeEnvMap({ A: 'b' });
    expect(out.endsWith('\n')).toBe(true);
  });
});

describe('renameInFile', () => {
  test('renames key in file and writes updated content', () => {
    const p = writeTmp('DB_HOST=localhost\nDB_PORT=5432\n');
    const result = renameInFile(p, { DB_HOST: 'DATABASE_HOST' });
    expect(result).toHaveProperty('DATABASE_HOST', 'localhost');
    const written = fs.readFileSync(p, 'utf8');
    expect(written).toContain('DATABASE_HOST=localhost');
    expect(written).not.toContain('DB_HOST');
    fs.unlinkSync(p);
  });
});
