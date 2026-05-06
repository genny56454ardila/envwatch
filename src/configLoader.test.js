const fs = require('fs');
const os = require('os');
const path = require('path');
const { resolveConfig, validateConfig, loadConfigFile, DEFAULT_CONFIG } = require('./configLoader');

describe('validateConfig', () => {
  const valid = { ...DEFAULT_CONFIG, envFile: '/some/.env' };

  test('returns no errors for valid config', () => {
    expect(validateConfig(valid)).toEqual([]);
  });

  test('errors on negative debounceMs', () => {
    const errs = validateConfig({ ...valid, debounceMs: -1 });
    expect(errs.some(e => e.includes('debounceMs'))).toBe(true);
  });

  test('errors on invalid signal', () => {
    const errs = validateConfig({ ...valid, signal: 'SIGFOO' });
    expect(errs.some(e => e.includes('signal'))).toBe(true);
  });

  test('errors on empty envFile', () => {
    const errs = validateConfig({ ...valid, envFile: '  ' });
    expect(errs.some(e => e.includes('envFile'))).toBe(true);
  });
});

describe('loadConfigFile', () => {
  test('returns empty object when file does not exist', () => {
    expect(loadConfigFile('/nonexistent/path.json')).toEqual({});
  });

  test('parses valid JSON config file', () => {
    const tmp = path.join(os.tmpdir(), `envwatch-cfg-${Date.now()}.json`);
    fs.writeFileSync(tmp, JSON.stringify({ debounceMs: 500 }));
    const result = loadConfigFile(tmp);
    expect(result.debounceMs).toBe(500);
    fs.unlinkSync(tmp);
  });

  test('returns empty object on malformed JSON', () => {
    const tmp = path.join(os.tmpdir(), `envwatch-bad-${Date.now()}.json`);
    fs.writeFileSync(tmp, 'not json {{');
    expect(loadConfigFile(tmp)).toEqual({});
    fs.unlinkSync(tmp);
  });
});

describe('resolveConfig', () => {
  test('merges defaults with cli options', () => {
    const cfg = resolveConfig({ debounceMs: 999 });
    expect(cfg.debounceMs).toBe(999);
    expect(cfg.signal).toBe(DEFAULT_CONFIG.signal);
  });

  test('throws on invalid merged config', () => {
    expect(() => resolveConfig({ signal: 'SIGBAD' })).toThrow('Invalid envwatch config');
  });

  test('resolves envFile to absolute path', () => {
    const cfg = resolveConfig({ envFile: '.env' });
    expect(path.isAbsolute(cfg.envFile)).toBe(true);
  });
});
