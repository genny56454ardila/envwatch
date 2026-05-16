const fs = require('fs');
const os = require('os');
const path = require('path');
const { parseAnnotateArgs, runAnnotateCommand } = require('./annotateCommand');

function writeTmp(content) {
  const p = path.join(os.tmpdir(), `envwatch-annotate-${Date.now()}.env`);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('parseAnnotateArgs', () => {
  test('parses add action', () => {
    const opts = parseAnnotateArgs(['node', 'annotate', 'add', 'FOO', 'required']);
    expect(opts.action).toBe('add');
    expect(opts.key).toBe('FOO');
    expect(opts.annotationKey).toBe('required');
  });

  test('parses strip action', () => {
    const opts = parseAnnotateArgs(['node', 'annotate', 'strip']);
    expect(opts.action).toBe('strip');
  });

  test('parses list action', () => {
    const opts = parseAnnotateArgs(['node', 'annotate', 'list']);
    expect(opts.action).toBe('list');
  });

  test('parses filter action', () => {
    const opts = parseAnnotateArgs(['node', 'annotate', 'filter', 'required']);
    expect(opts.action).toBe('filter');
    expect(opts.filter).toBe('required');
  });

  test('parses --file option', () => {
    const opts = parseAnnotateArgs(['node', 'annotate', '--file', '.env.test', 'list']);
    expect(opts.file).toBe('.env.test');
  });
});

describe('runAnnotateCommand - add', () => {
  test('adds annotation to key', () => {
    const p = writeTmp('FOO=bar\nBAZ=qux\n');
    runAnnotateCommand({ file: p, action: 'add', key: 'FOO', annotationKey: 'required', annotationValue: null });
    const result = fs.readFileSync(p, 'utf8');
    expect(result).toContain('@required');
    fs.unlinkSync(p);
  });

  test('adds annotation with value', () => {
    const p = writeTmp('NUM=42\n');
    runAnnotateCommand({ file: p, action: 'add', key: 'NUM', annotationKey: 'type', annotationValue: 'number' });
    const result = fs.readFileSync(p, 'utf8');
    expect(result).toContain('@type:number');
    fs.unlinkSync(p);
  });
});

describe('runAnnotateCommand - strip', () => {
  test('strips annotations from file', () => {
    const p = writeTmp('FOO=bar # @required\nBAZ=qux\n');
    runAnnotateCommand({ file: p, action: 'strip' });
    const result = fs.readFileSync(p, 'utf8');
    expect(result).not.toContain('@required');
    fs.unlinkSync(p);
  });
});

describe('runAnnotateCommand - filter', () => {
  test('prints keys with matching annotation', () => {
    const p = writeTmp('FOO=bar # @required\nBAZ=qux\n');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    runAnnotateCommand({ file: p, action: 'filter', filter: 'required' });
    expect(spy).toHaveBeenCalledWith('FOO');
    spy.mockRestore();
    fs.unlinkSync(p);
  });
});
