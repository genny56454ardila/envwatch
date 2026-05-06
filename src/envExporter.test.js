const fs = require('fs');
const path = require('path');
const os = require('os');
const { toShellExports, toJSON, toDockerEnvFile, shellQuote, exportEnv } = require('./envExporter');

const sampleEnv = {
  APP_NAME: 'envwatch',
  PORT: '3000',
  DEBUG: 'true',
  DB_URL: 'postgres://user:pass@localhost/db'
};

describe('shellQuote', () => {
  it('returns plain value when no special chars', () => {
    expect(shellQuote('simple')).toBe('simple');
  });

  it('wraps in double quotes when spaces present', () => {
    expect(shellQuote('hello world')).toBe('"hello world"');
  });

  it('escapes double quotes inside value', () => {
    expect(shellQuote('say "hi"')).toBe('"say \\"hi\\""');
  });
});

describe('toShellExports', () => {
  it('generates export statements for each key', () => {
    const result = toShellExports({ FOO: 'bar', BAZ: 'qux' });
    expect(result).toContain('export FOO=bar');
    expect(result).toContain('export BAZ=qux');
  });

  it('handles empty map', () => {
    expect(toShellExports({})).toBe('');
  });
});

describe('toJSON', () => {
  it('returns pretty-printed JSON by default', () => {
    const result = toJSON({ A: '1' });
    expect(result).toContain('\n');
    expect(JSON.parse(result)).toEqual({ A: '1' });
  });

  it('returns compact JSON when pretty=false', () => {
    const result = toJSON({ A: '1' }, false);
    expect(result).toBe('{"A":"1"}');
  });
});

describe('toDockerEnvFile', () => {
  it('formats as KEY=VALUE lines', () => {
    const result = toDockerEnvFile({ FOO: 'bar', BAZ: 'qux' });
    expect(result).toContain('FOO=bar');
    expect(result).toContain('BAZ=qux');
  });
});

describe('exportEnv', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envexport-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('writes shell format to file', () => {
    const out = path.join(tmpDir, 'out.sh');
    exportEnv(sampleEnv, 'shell', out);
    const content = fs.readFileSync(out, 'utf8');
    expect(content).toContain('export APP_NAME=envwatch');
  });

  it('writes json format to file', () => {
    const out = path.join(tmpDir, 'out.json');
    exportEnv(sampleEnv, 'json', out);
    const parsed = JSON.parse(fs.readFileSync(out, 'utf8'));
    expect(parsed.PORT).toBe('3000');
  });

  it('writes docker format to file', () => {
    const out = path.join(tmpDir, 'out.env');
    exportEnv(sampleEnv, 'docker', out);
    const content = fs.readFileSync(out, 'utf8');
    expect(content).toContain('PORT=3000');
  });

  it('throws on unknown format', () => {
    expect(() => exportEnv(sampleEnv, 'xml', '/tmp/x')).toThrow('Unknown export format: xml');
  });
});
