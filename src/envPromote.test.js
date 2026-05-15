const { promoteKeys, promoteAll, serializeEnv, promoteEnvFile } = require('./envPromote');
const fs = require('fs');
const os = require('os');
const path = require('path');

function makeMap(obj) {
  return new Map(Object.entries(obj));
}

function writeTmp(name, content) {
  const p = path.join(os.tmpdir(), name);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('promoteKeys', () => {
  test('promotes specified keys from source to target', () => {
    const source = makeMap({ A: '1', B: '2', C: '3' });
    const target = makeMap({ D: '4' });
    const { result, promoted, skipped } = promoteKeys(source, target, ['A', 'B']);
    expect(result.get('A')).toBe('1');
    expect(result.get('B')).toBe('2');
    expect(result.get('D')).toBe('4');
    expect(promoted).toEqual(['A', 'B']);
    expect(skipped).toEqual([]);
  });

  test('skips existing keys when overwrite is false', () => {
    const source = makeMap({ A: 'new' });
    const target = makeMap({ A: 'old' });
    const { result, promoted, skipped } = promoteKeys(source, target, ['A']);
    expect(result.get('A')).toBe('old');
    expect(promoted).toEqual([]);
    expect(skipped).toEqual(['A']);
  });

  test('overwrites existing keys when overwrite is true', () => {
    const source = makeMap({ A: 'new' });
    const target = makeMap({ A: 'old' });
    const { result, promoted } = promoteKeys(source, target, ['A'], { overwrite: true });
    expect(result.get('A')).toBe('new');
    expect(promoted).toEqual(['A']);
  });

  test('ignores keys not present in source', () => {
    const source = makeMap({ A: '1' });
    const target = makeMap({});
    const { promoted } = promoteKeys(source, target, ['Z']);
    expect(promoted).toEqual([]);
  });
});

describe('promoteAll', () => {
  test('promotes all keys from source', () => {
    const source = makeMap({ X: '10', Y: '20' });
    const target = makeMap({ Z: '30' });
    const { result, promoted } = promoteAll(source, target);
    expect(promoted.sort()).toEqual(['X', 'Y']);
    expect(result.get('Z')).toBe('30');
  });
});

describe('serializeEnv', () => {
  test('serializes map to env format', () => {
    const map = makeMap({ FOO: 'bar', BAZ: 'qux' });
    const out = serializeEnv(map);
    expect(out).toContain('FOO=bar');
    expect(out).toContain('BAZ=qux');
  });
});

describe('promoteEnvFile', () => {
  test('writes promoted keys to output file', () => {
    const src = writeTmp('promote_src.env', 'API_KEY=secret\nDEBUG=true\n');
    const tgt = writeTmp('promote_tgt.env', 'APP=myapp\n');
    const out = path.join(os.tmpdir(), 'promote_out.env');
    const { promoted } = promoteEnvFile(src, tgt, out, ['API_KEY']);
    expect(promoted).toEqual(['API_KEY']);
    const content = fs.readFileSync(out, 'utf8');
    expect(content).toContain('API_KEY=secret');
    expect(content).toContain('APP=myapp');
  });

  test('promotes all keys when none specified', () => {
    const src = writeTmp('promote_src2.env', 'A=1\nB=2\n');
    const tgt = writeTmp('promote_tgt2.env', 'C=3\n');
    const out = path.join(os.tmpdir(), 'promote_out2.env');
    const { promoted } = promoteEnvFile(src, tgt, out, [], {});
    expect(promoted.sort()).toEqual(['A', 'B']);
  });
});
