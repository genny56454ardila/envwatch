const fs = require('fs');
const os = require('os');
const path = require('path');
const { restoreSnapshot, previewRestore } = require('./envRestore');
const { setSnapshotDir, saveSnapshot, listSnapshots } = require('./snapshotManager');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envrestore-'));
  setSnapshotDir(tmpDir);
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('restoreSnapshot writes env file from tag', () => {
  saveSnapshot('v1', { FOO: 'bar', BAZ: '123' });
  const outFile = path.join(tmpDir, '.env');
  const result = restoreSnapshot('v1', outFile);

  expect(result.restored).toBe(true);
  expect(result.tag).toBe('v1');
  expect(result.entries).toBe(2);

  const content = fs.readFileSync(outFile, 'utf8');
  expect(content).toContain('FOO=bar');
  expect(content).toContain('BAZ=123');
});

test('restoreSnapshot works with numeric index', () => {
  saveSnapshot('snap-a', { KEY: 'val' });
  const outFile = path.join(tmpDir, '.env');
  const result = restoreSnapshot(0, outFile);
  expect(result.restored).toBe(true);
  expect(result.entries).toBe(1);
});

test('restoreSnapshot throws on unknown tag', () => {
  saveSnapshot('existing', { A: '1' });
  expect(() => restoreSnapshot('nope', path.join(tmpDir, '.env'))).toThrow('not found');
});

test('restoreSnapshot throws when no snapshots exist', () => {
  expect(() => restoreSnapshot('any', path.join(tmpDir, '.env'))).toThrow('No snapshots available');
});

test('restoreSnapshot throws on out-of-range index', () => {
  saveSnapshot('only', { X: '9' });
  expect(() => restoreSnapshot(5, path.join(tmpDir, '.env'))).toThrow('out of range');
});

test('previewRestore returns envMap without writing file', () => {
  saveSnapshot('preview-snap', { HELLO: 'world' });
  const outFile = path.join(tmpDir, '.env');
  const { tag, envMap } = previewRestore('preview-snap');

  expect(tag).toBe('preview-snap');
  expect(envMap.HELLO).toBe('world');
  expect(fs.existsSync(outFile)).toBe(false);
});
