const fs = require('fs');
const path = require('path');
const os = require('os');
const {
  saveSnapshot,
  loadSnapshot,
  listSnapshots,
  getLatestSnapshot,
  setSnapshotDir,
} = require('./snapshotManager');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envwatch-snap-'));
  setSnapshotDir(tmpDir);
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('saveSnapshot', () => {
  it('saves a snapshot file and returns its path', () => {
    const content = 'FOO=bar\nBAZ=qux';
    const filePath = saveSnapshot(content, 'test');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('snapshot contains parsed env keys', () => {
    const content = 'API_KEY=abc123\nDEBUG=true';
    const filePath = saveSnapshot(content);
    const snapshot = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    expect(snapshot.env.API_KEY).toBe('abc123');
    expect(snapshot.env.DEBUG).toBe('true');
  });

  it('snapshot includes a timestamp', () => {
    const filePath = saveSnapshot('X=1');
    const snapshot = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    expect(typeof snapshot.timestamp).toBe('number');
  });
});

describe('loadSnapshot', () => {
  it('loads a previously saved snapshot', () => {
    const filePath = saveSnapshot('HELLO=world', 'load-test');
    const snapshot = loadSnapshot(filePath);
    expect(snapshot.env.HELLO).toBe('world');
  });

  it('throws if snapshot file does not exist', () => {
    expect(() => loadSnapshot('/nonexistent/path.json')).toThrow('Snapshot not found');
  });
});

describe('listSnapshots', () => {
  it('returns snapshots sorted by newest first', () => {
    saveSnapshot('A=1', 'first');
    saveSnapshot('B=2', 'second');
    const list = listSnapshots();
    expect(list.length).toBe(2);
    expect(list[0].mtime).toBeGreaterThanOrEqual(list[1].mtime);
  });

  it('returns empty array when no snapshots exist', () => {
    expect(listSnapshots()).toEqual([]);
  });
});

describe('getLatestSnapshot', () => {
  it('returns null when no snapshots exist', () => {
    expect(getLatestSnapshot()).toBeNull();
  });

  it('returns the most recent snapshot data', () => {
    saveSnapshot('OLD=1');
    saveSnapshot('NEW=2');
    const latest = getLatestSnapshot();
    expect(latest.env.NEW).toBe('2');
  });
});
