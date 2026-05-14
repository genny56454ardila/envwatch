const fs = require('fs');
const os = require('os');
const path = require('path');
const { cloneEnvFile, previewClone } = require('./envClone');

function writeTmp(name, content) {
  const p = path.join(os.tmpdir(), `envclone_${Date.now()}_${name}`);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('cloneEnvFile', () => {
  test('clones all keys from source to dest', () => {
    const src = writeTmp('src.env', 'A=1\nB=2\nC=3\n');
    const dest = path.join(os.tmpdir(), `envclone_dest_${Date.now()}.env`);
    const result = cloneEnvFile(src, dest);
    expect(result.count).toBe(3);
    expect(result.written).toBe(dest);
    const written = fs.readFileSync(dest, 'utf8');
    expect(written).toContain('A=1');
    expect(written).toContain('B=2');
    fs.unlinkSync(dest);
  });

  test('filters by prefix', () => {
    const src = writeTmp('src2.env', 'DB_HOST=localhost\nDB_PORT=5432\nAPP_NAME=test\n');
    const dest = path.join(os.tmpdir(), `envclone_dest2_${Date.now()}.env`);
    const result = cloneEnvFile(src, dest, { prefix: 'DB_' });
    expect(result.count).toBe(2);
    const written = fs.readFileSync(dest, 'utf8');
    expect(written).toContain('DB_HOST');
    expect(written).not.toContain('APP_NAME');
    fs.unlinkSync(dest);
  });

  test('filters by only keys', () => {
    const src = writeTmp('src3.env', 'A=1\nB=2\nC=3\n');
    const dest = path.join(os.tmpdir(), `envclone_dest3_${Date.now()}.env`);
    cloneEnvFile(src, dest, { only: ['A', 'C'] });
    const written = fs.readFileSync(dest, 'utf8');
    expect(written).toContain('A=1');
    expect(written).toContain('C=3');
    expect(written).not.toContain('B=2');
    fs.unlinkSync(dest);
  });

  test('throws if source does not exist', () => {
    expect(() => cloneEnvFile('/no/such/file.env', '/tmp/out.env')).toThrow('Source file not found');
  });

  test('throws if dest exists and overwrite is false', () => {
    const src = writeTmp('src4.env', 'A=1\n');
    const dest = writeTmp('dest4.env', 'X=9\n');
    expect(() => cloneEnvFile(src, dest)).toThrow('Destination already exists');
    fs.unlinkSync(dest);
  });

  test('overwrites dest when overwrite=true', () => {
    const src = writeTmp('src5.env', 'A=1\n');
    const dest = writeTmp('dest5.env', 'X=9\n');
    const result = cloneEnvFile(src, dest, { overwrite: true });
    expect(result.count).toBe(1);
    fs.unlinkSync(dest);
  });
});

describe('previewClone', () => {
  test('returns entries without writing', () => {
    const src = writeTmp('prev.env', 'FOO=bar\nBAZ=qux\n');
    const dest = '/tmp/preview_out.env';
    const result = previewClone(src, dest);
    expect(result.dest).toBe(dest);
    expect(result.entries.FOO).toBe('bar');
    expect(fs.existsSync(dest)).toBe(false);
  });

  test('throws if source missing', () => {
    expect(() => previewClone('/missing.env', '/out.env')).toThrow('Source file not found');
  });
});
