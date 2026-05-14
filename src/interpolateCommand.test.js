const fs = require('fs');
const os = require('os');
const path = require('path');
const { parseInterpolateArgs, serializeEnv, runInterpolateCommand } = require('./interpolateCommand');

function writeTmp(content) {
  const p = path.join(os.tmpdir(), `envwatch-interp-${Date.now()}-${Math.random().toString(36).slice(2)}.env`);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('parseInterpolateArgs', () => {
  test('defaults', () => {
    const opts = parseInterpolateArgs(['node', 'interpolate']);
    expect(opts).toEqual({ input: '.env', output: null, check: false, silent: false });
  });

  test('parses --input and --output', () => {
    const opts = parseInterpolateArgs(['node', 'x', '--input', 'a.env', '--output', 'b.env']);
    expect(opts.input).toBe('a.env');
    expect(opts.output).toBe('b.env');
  });

  test('parses --check flag', () => {
    const opts = parseInterpolateArgs(['node', 'x', '--check']);
    expect(opts.check).toBe(true);
  });

  test('parses --silent flag', () => {
    const opts = parseInterpolateArgs(['node', 'x', '--silent']);
    expect(opts.silent).toBe(true);
  });
});

describe('serializeEnv', () => {
  test('writes KEY=value lines', () => {
    const map = new Map([['A', 'hello'], ['B', 'world']]);
    const out = serializeEnv(map);
    expect(out).toContain('A=hello');
    expect(out).toContain('B=world');
  });

  test('quotes values with spaces', () => {
    const map = new Map([['MSG', 'hello world']]);
    expect(serializeEnv(map)).toContain('MSG="hello world"');
  });
});

describe('runInterpolateCommand', () => {
  test('writes interpolated env to output file', () => {
    const input = writeTmp('BASE=/app\nLOG=${BASE}/logs\n');
    const output = input + '.out';
    runInterpolateCommand(['node', 'interp', '--input', input, '--output', output, '--silent']);
    const content = fs.readFileSync(output, 'utf8');
    expect(content).toContain('LOG=/app/logs');
    fs.unlinkSync(output);
    fs.unlinkSync(input);
  });

  test('exits 1 with --check when unresolved refs exist', () => {
    const input = writeTmp('A=${MISSING}\n');
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    expect(() => runInterpolateCommand(['node', 'interp', '--input', input, '--check', '--silent'])).toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
    fs.unlinkSync(input);
  });

  test('exits 1 when input file missing', () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    expect(() => runInterpolateCommand(['node', 'interp', '--input', '/nonexistent.env', '--silent'])).toThrow('exit');
    exitSpy.mockRestore();
  });
});
