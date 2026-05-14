const fs = require('fs');
const os = require('os');
const path = require('path');
const { parseDefaultsArgs, runDefaultsCommand } = require('./defaultsCommand');

function writeTmp(name, content) {
  const p = path.join(os.tmpdir(), name);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('parseDefaultsArgs', () => {
  test('parses --target and --defaults', () => {
    const args = parseDefaultsArgs(['--target', 'my.env', '--defaults', 'defaults.json']);
    expect(args.target).toBe('my.env');
    expect(args.defaultsFile).toBe('defaults.json');
  });

  test('parses short flags', () => {
    const args = parseDefaultsArgs(['-t', '.env.local', '-d', 'base.env']);
    expect(args.target).toBe('.env.local');
    expect(args.defaultsFile).toBe('base.env');
  });

  test('parses --output and --preview', () => {
    const args = parseDefaultsArgs(['--output', 'out.env', '--preview']);
    expect(args.output).toBe('out.env');
    expect(args.preview).toBe(true);
  });

  test('defaults target to .env', () => {
    const args = parseDefaultsArgs([]);
    expect(args.target).toBe('.env');
    expect(args.preview).toBe(false);
  });
});

describe('runDefaultsCommand', () => {
  test('applies missing keys from a JSON defaults file', () => {
    const targetFile = writeTmp('target.env', 'FOO=existing\n');
    const defaultsFile = writeTmp('defaults.json', JSON.stringify({ FOO: 'ignored', BAR: 'new_value' }));
    const outputFile = path.join(os.tmpdir(), 'out_defaults.env');

    runDefaultsCommand(['--target', targetFile, '--defaults', defaultsFile, '--output', outputFile]);

    const result = fs.readFileSync(outputFile, 'utf8');
    expect(result).toContain('FOO=existing');
    expect(result).toContain('BAR=new_value');
  });

  test('applies missing keys from a .env defaults file', () => {
    const targetFile = writeTmp('target2.env', 'KEEP=yes\n');
    const defaultsFile = writeTmp('defaults2.env', 'KEEP=no\nNEW_KEY=hello\n');
    const outputFile = path.join(os.tmpdir(), 'out_defaults2.env');

    runDefaultsCommand(['--target', targetFile, '--defaults', defaultsFile, '--output', outputFile]);

    const result = fs.readFileSync(outputFile, 'utf8');
    expect(result).toContain('KEEP=yes');
    expect(result).toContain('NEW_KEY=hello');
  });

  test('does not write when no missing keys', () => {
    const targetFile = writeTmp('target3.env', 'A=1\nB=2\n');
    const defaultsFile = writeTmp('defaults3.json', JSON.stringify({ A: 'x', B: 'y' }));
    const outputFile = path.join(os.tmpdir(), 'out_defaults3.env');

    runDefaultsCommand(['--target', targetFile, '--defaults', defaultsFile, '--output', outputFile]);

    expect(fs.existsSync(outputFile)).toBe(false);
  });

  test('exits with error when --defaults is missing', () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    expect(() => runDefaultsCommand([])).toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });
});
