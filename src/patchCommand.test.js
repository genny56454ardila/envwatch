const fs = require('fs');
const os = require('os');
const path = require('path');
const { parsePatchArgs, runPatchCommand } = require('./patchCommand');

function writeTmp(content) {
  const p = path.join(os.tmpdir(), `envpatch_${Date.now()}.env`);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('parsePatchArgs', () => {
  test('parses file and --set', () => {
    const opts = parsePatchArgs(['node', 'patch', '.env', '--set', 'FOO=bar', 'BAZ=qux']);
    expect(opts.file).toBe('.env');
    expect(opts.set.FOO).toBe('bar');
    expect(opts.set.BAZ).toBe('qux');
  });

  test('parses --remove', () => {
    const opts = parsePatchArgs(['node', 'patch', '.env', '--remove', 'OLD_KEY']);
    expect(opts.remove).toContain('OLD_KEY');
  });

  test('parses --rename', () => {
    const opts = parsePatchArgs(['node', 'patch', '.env', '--rename', 'OLD:NEW']);
    expect(opts.rename['OLD']).toBe('NEW');
  });

  test('parses --dry-run flag', () => {
    const opts = parsePatchArgs(['node', 'patch', '.env', '--dry-run']);
    expect(opts.dryRun).toBe(true);
  });

  test('defaults to no file and empty ops', () => {
    const opts = parsePatchArgs(['node', 'patch']);
    expect(opts.file).toBeNull();
    expect(opts.remove).toHaveLength(0);
  });
});

describe('runPatchCommand', () => {
  test('sets a new key in the file', () => {
    const file = writeTmp('EXISTING=yes\n');
    runPatchCommand({ file, set: { NEW_KEY: 'hello' }, remove: [], rename: {}, dryRun: false });
    const content = fs.readFileSync(file, 'utf8');
    expect(content).toContain('NEW_KEY=hello');
    expect(content).toContain('EXISTING=yes');
    fs.unlinkSync(file);
  });

  test('removes a key from the file', () => {
    const file = writeTmp('KEEP=1\nDROP=2\n');
    runPatchCommand({ file, set: {}, remove: ['DROP'], rename: {}, dryRun: false });
    const content = fs.readFileSync(file, 'utf8');
    expect(content).not.toContain('DROP');
    expect(content).toContain('KEEP=1');
    fs.unlinkSync(file);
  });

  test('renames a key in the file', () => {
    const file = writeTmp('OLD_NAME=value\n');
    runPatchCommand({ file, set: {}, remove: [], rename: { OLD_NAME: 'NEW_NAME' }, dryRun: false });
    const content = fs.readFileSync(file, 'utf8');
    expect(content).toContain('NEW_NAME=value');
    expect(content).not.toContain('OLD_NAME');
    fs.unlinkSync(file);
  });

  test('dry run does not write file', () => {
    const file = writeTmp('A=1\n');
    const original = fs.readFileSync(file, 'utf8');
    const spy = jest.spyOn(process.stdout, 'write').mockImplementation(() => {});
    runPatchCommand({ file, set: { A: '999' }, remove: [], rename: {}, dryRun: true });
    const after = fs.readFileSync(file, 'utf8');
    expect(after).toBe(original);
    spy.mockRestore();
    fs.unlinkSync(file);
  });
});
