const fs = require('fs');
const os = require('os');
const path = require('path');
const { parseNormalizeArgs, runNormalizeCommand } = require('./normalizeCommand');

function writeTmp(content) {
  const p = path.join(os.tmpdir(), `envwatch-normalize-${Date.now()}.env`);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('parseNormalizeArgs', () => {
  it('returns defaults when no args given', () => {
    const args = parseNormalizeArgs([]);
    expect(args.file).toBe('.env');
    expect(args.normalizeKeys).toBe(true);
    expect(args.quoteSpaces).toBe(true);
    expect(args.trimEntries).toBe(true);
    expect(args.write).toBe(false);
    expect(args.dryRun).toBe(false);
  });

  it('parses --file flag', () => {
    const args = parseNormalizeArgs(['--file', '.env.local']);
    expect(args.file).toBe('.env.local');
  });

  it('parses --no-keys flag', () => {
    const args = parseNormalizeArgs(['--no-keys']);
    expect(args.normalizeKeys).toBe(false);
  });

  it('parses --write and --dry-run', () => {
    const args = parseNormalizeArgs(['--write', '--dry-run']);
    expect(args.write).toBe(true);
    expect(args.dryRun).toBe(true);
  });
});

describe('runNormalizeCommand', () => {
  it('writes normalized content to file with --write', () => {
    const tmp = writeTmp('my-key=hello world\n  FOO  =  bar  \n');
    runNormalizeCommand(['--file', tmp, '--write']);
    const result = fs.readFileSync(tmp, 'utf8');
    expect(result).toContain('MY_KEY="hello world"');
    expect(result).toContain('FOO=bar');
    fs.unlinkSync(tmp);
  });

  it('prints to stdout without --write', () => {
    const tmp = writeTmp('api-key=secret\n');
    const written = [];
    const orig = process.stdout.write.bind(process.stdout);
    process.stdout.write = (chunk) => { written.push(chunk); return true; };
    runNormalizeCommand(['--file', tmp]);
    process.stdout.write = orig;
    expect(written.join('')).toContain('API_KEY=secret');
    fs.unlinkSync(tmp);
  });

  it('exits with code 1 for missing file', () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    expect(() => runNormalizeCommand(['--file', '/nonexistent/.env'])).toThrow('exit');
    mockExit.mockRestore();
  });
});
