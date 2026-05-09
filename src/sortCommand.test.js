// sortCommand.test.js

const fs = require('fs');
const os = require('os');
const path = require('path');
const { parseSortArgs, runSortCommand } = require('./sortCommand');

function writeTmp(content) {
  const tmpFile = path.join(os.tmpdir(), `envwatch-sort-${Date.now()}.env`);
  fs.writeFileSync(tmpFile, content, 'utf8');
  return tmpFile;
}

describe('parseSortArgs', () => {
  it('returns defaults with no args', () => {
    const args = parseSortArgs([]);
    expect(args.file).toBe('.env');
    expect(args.mode).toBe('alpha');
    expect(args.write).toBe(false);
    expect(args.order).toEqual([]);
  });

  it('parses --file and --mode', () => {
    const args = parseSortArgs(['--file', 'prod.env', '--mode', 'prefix']);
    expect(args.file).toBe('prod.env');
    expect(args.mode).toBe('prefix');
  });

  it('parses --order as array', () => {
    const args = parseSortArgs(['--order', 'DB_HOST,DB_PORT,APP_NAME']);
    expect(args.order).toEqual(['DB_HOST', 'DB_PORT', 'APP_NAME']);
  });

  it('parses --write flag', () => {
    const args = parseSortArgs(['--write']);
    expect(args.write).toBe(true);
  });
});

describe('runSortCommand', () => {
  it('prints sorted output to stdout (alpha mode)', () => {
    const tmp = writeTmp('ZEBRA=1\nAPPLE=2\nMIDDLE=3\n');
    const spy = jest.spyOn(process.stdout, 'write').mockImplementation(() => {});
    runSortCommand(['--file', tmp]);
    const out = spy.mock.calls.map(c => c[0]).join('');
    expect(out.indexOf('APPLE')).toBeLessThan(out.indexOf('MIDDLE'));
    expect(out.indexOf('MIDDLE')).toBeLessThan(out.indexOf('ZEBRA'));
    spy.mockRestore();
    fs.unlinkSync(tmp);
  });

  it('writes sorted output back to file with --write', () => {
    const tmp = writeTmp('Z=last\nA=first\n');
    runSortCommand(['--file', tmp, '--write']);
    const content = fs.readFileSync(tmp, 'utf8');
    expect(content.indexOf('A=')).toBeLessThan(content.indexOf('Z='));
    fs.unlinkSync(tmp);
  });

  it('exits with error if file not found', () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    expect(() => runSortCommand(['--file', '/nonexistent/.env'])).toThrow('exit');
    mockExit.mockRestore();
  });

  it('exits if --order mode used without --order flag', () => {
    const tmp = writeTmp('A=1\n');
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    expect(() => runSortCommand(['--file', tmp, '--mode', 'order'])).toThrow('exit');
    mockExit.mockRestore();
    fs.unlinkSync(tmp);
  });
});
