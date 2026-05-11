const fs = require('fs');
const os = require('os');
const path = require('path');
const { parseTransformArgs, applyOps, runTransformCommand } = require('./transformCommand');

function writeTmp(content) {
  const p = path.join(os.tmpdir(), `envwatch-transform-${Date.now()}.env`);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('parseTransformArgs', () => {
  it('defaults to .env input', () => {
    expect(parseTransformArgs([]).input).toBe('.env');
  });

  it('parses --input and --output', () => {
    const args = parseTransformArgs(['--input', 'a.env', '--output', 'b.env']);
    expect(args.input).toBe('a.env');
    expect(args.output).toBe('b.env');
  });

  it('parses --upper flag', () => {
    const args = parseTransformArgs(['--upper']);
    expect(args.ops).toContainEqual({ type: 'upper' });
  });

  it('parses --add-prefix with value', () => {
    const args = parseTransformArgs(['--add-prefix', 'MY_']);
    expect(args.ops).toContainEqual({ type: 'addPrefix', value: 'MY_' });
  });

  it('parses --strip-prefix with value', () => {
    const args = parseTransformArgs(['--strip-prefix', 'APP_']);
    expect(args.ops).toContainEqual({ type: 'stripPrefix', value: 'APP_' });
  });

  it('parses multiple ops in order', () => {
    const args = parseTransformArgs(['--trim', '--upper']);
    expect(args.ops.map((o) => o.type)).toEqual(['trim', 'upper']);
  });
});

describe('applyOps', () => {
  it('applies upper op', () => {
    expect(applyOps({ foo: 'bar' }, [{ type: 'upper' }])).toEqual({ FOO: 'bar' });
  });

  it('chains multiple ops', () => {
    const result = applyOps(
      { APP_foo: '  val  ' },
      [{ type: 'stripPrefix', value: 'APP_' }, { type: 'upper' }, { type: 'trim' }]
    );
    expect(result).toEqual({ FOO: 'val' });
  });

  it('returns unchanged map when no ops', () => {
    expect(applyOps({ A: '1' }, [])).toEqual({ A: '1' });
  });
});

describe('runTransformCommand', () => {
  it('writes transformed output to file', () => {
    const input = writeTmp('foo=bar\nbaz=qux\n');
    const output = path.join(os.tmpdir(), `envwatch-out-${Date.now()}.env`);
    runTransformCommand(['--input', input, '--output', output, '--upper']);
    const content = fs.readFileSync(output, 'utf8');
    expect(content).toContain('FOO=bar');
    expect(content).toContain('BAZ=qux');
    fs.unlinkSync(input);
    fs.unlinkSync(output);
  });

  it('exits with error for missing input file', () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    expect(() => runTransformCommand(['--input', '/nonexistent/.env'])).toThrow('exit');
    mockExit.mockRestore();
  });
});
