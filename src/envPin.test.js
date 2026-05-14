const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  pinKeys, applyPins, unpinKeys, getPinnedKeys, clearPins, savePins, loadPins
} = require('./envPin');

beforeEach(() => clearPins());

describe('pinKeys', () => {
  it('pins specified keys from env map', () => {
    const env = { FOO: 'bar', BAZ: 'qux', SKIP: 'me' };
    const pinned = pinKeys(env, ['FOO', 'BAZ']);
    expect(pinned).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  it('ignores keys not present in env map', () => {
    const env = { FOO: 'bar' };
    const pinned = pinKeys(env, ['FOO', 'MISSING']);
    expect(pinned).toEqual({ FOO: 'bar' });
  });
});

describe('applyPins', () => {
  it('overrides changed values with pinned ones', () => {
    pinKeys({ SECRET: 'original' }, ['SECRET']);
    const updated = { SECRET: 'changed', OTHER: 'fine' };
    expect(applyPins(updated)).toEqual({ SECRET: 'original', OTHER: 'fine' });
  });

  it('returns env unchanged when no pins set', () => {
    const env = { A: '1', B: '2' };
    expect(applyPins(env)).toEqual(env);
  });
});

describe('unpinKeys', () => {
  it('removes specific keys from pinned set', () => {
    pinKeys({ A: '1', B: '2' }, ['A', 'B']);
    unpinKeys(['A']);
    expect(getPinnedKeys()).toEqual({ B: '2' });
  });
});

describe('getPinnedKeys', () => {
  it('returns a copy, not a reference', () => {
    pinKeys({ X: 'val' }, ['X']);
    const pins = getPinnedKeys();
    pins.X = 'mutated';
    expect(getPinnedKeys().X).toBe('val');
  });
});

describe('savePins / loadPins', () => {
  it('round-trips pins through a JSON file', () => {
    const tmpFile = path.join(os.tmpdir(), `pins-${Date.now()}.json`);
    pinKeys({ DB_PASS: 'secret', PORT: '3000' }, ['DB_PASS', 'PORT']);
    savePins(tmpFile);
    clearPins();
    expect(getPinnedKeys()).toEqual({});
    const loaded = loadPins(tmpFile);
    expect(loaded).toEqual({ DB_PASS: 'secret', PORT: '3000' });
    fs.unlinkSync(tmpFile);
  });

  it('returns empty object when file does not exist', () => {
    const result = loadPins('/nonexistent/path/pins.json');
    expect(result).toEqual({});
  });
});
