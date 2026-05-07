const fs = require('fs');
const os = require('os');
const path = require('path');
const { parseLintArgs, runLintCommand } = require('./lintCommand');

function writeTmp(content) {
  const file = path.join(os.tmpdir(), `envwatch-lint-${Date.now()}.env`);
  fs.writeFileSync(file, content);
  return file;
}

describe('parseLintArgs', () => {
  it('defaults to .env file', () => {
    const args = parseLintArgs([]);
    expect(args.file).toBe('.env');
    expect(args.strict).toBe(false);
  });

  it('parses --file flag', () => {
    const args = parseLintArgs(['--file', 'prod.env']);
    expect(args.file).toBe('prod.env');
  });

  it('parses -f shorthand', () => {
    const args = parseLintArgs(['-f', 'staging.env']);
    expect(args.file).toBe('staging.env');
  });

  it('parses --rules flag', () => {
    const args = parseLintArgs(['--rules', 'noLowercaseKey,noTrailingSpace']);
    expect(args.rules).toEqual(['noLowercaseKey', 'noTrailingSpace']);
  });

  it('parses --strict flag', () => {
    const args = parseLintArgs(['--strict']);
    expect(args.strict).toBe(true);
  });
});

describe('runLintCommand', () => {
  afterEach(() => { process.exitCode = 0; });

  it('returns no issues for a clean file', () => {
    const file = writeTmp('DATABASE_URL=postgres://localhost/db\nSECRET=abc123\n');
    const issues = runLintCommand({ file, rules: ['noSpacesInKey', 'noTrailingSpace'], strict: false });
    expect(issues).toHaveLength(0);
  });

  it('returns issues for a bad file', () => {
    const file = writeTmp('db_host=localhost\n');
    const issues = runLintCommand({ file, rules: ['noLowercaseKey'], strict: false });
    expect(issues.length).toBeGreaterThan(0);
  });

  it('sets exitCode on missing file', () => {
    runLintCommand({ file: '/nonexistent/path/.env', strict: false });
    expect(process.exitCode).toBe(1);
  });

  it('sets exitCode=1 in strict mode with errors', () => {
    const file = writeTmp('BAD KEY=value\n');
    runLintCommand({ file, rules: ['noSpacesInKey'], strict: true });
    expect(process.exitCode).toBe(1);
  });
});
