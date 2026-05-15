const fs = require('fs');
const os = require('os');
const path = require('path');
const { parseRequireArgs, runRequireCommand } = require('./requireCommand');

function writeTmp(content, ext = '.env') {
  const p = path.join(os.tmpdir(), `envwatch-req-${Date.now()}${ext}`);
  fs.writeFileSync(p, content);
  return p;
}

beforeEach(() => { process.exitCode = undefined; });

describe('parseRequireArgs', () => {
  test('defaults', () => {
    const opts = parseRequireArgs(['node', 'requireCommand.js']);
    expect(opts.envFile).toBe('.env');
    expect(opts.keys).toEqual([]);
    expect(opts.requireFile).toBeNull();
  });
  test('parses --env and positional keys', () => {
    const opts = parseRequireArgs(['node', 'x', '--env', '.env.prod', 'PORT', 'DB_URL']);
    expect(opts.envFile).toBe('.env.prod');
    expect(opts.keys).toEqual(['PORT', 'DB_URL']);
  });
  test('parses --require-file', () => {
    const opts = parseRequireArgs(['node', 'x', '--require-file', 'keys.txt']);
    expect(opts.requireFile).toBe('keys.txt');
  });
});

describe('runRequireCommand', () => {
  test('exits 0 when all keys present', () => {
    const envFile = writeTmp('PORT=3000\nDB_URL=postgres://localhost/db\n');
    runRequireCommand({ envFile, requireFile: null, keys: ['PORT', 'DB_URL'] });
    expect(process.exitCode).toBeUndefined();
  });

  test('exits 1 when keys missing', () => {
    const envFile = writeTmp('PORT=3000\n');
    runRequireCommand({ envFile, requireFile: null, keys: ['PORT', 'SECRET'] });
    expect(process.exitCode).toBe(1);
  });

  test('loads keys from require file', () => {
    const envFile = writeTmp('PORT=3000\n');
    const reqFile = writeTmp('PORT\nDB_URL\n', '.txt');
    runRequireCommand({ envFile, requireFile: reqFile, keys: [] });
    expect(process.exitCode).toBe(1);
  });

  test('exits 1 for missing env file', () => {
    runRequireCommand({ envFile: '/no/such/.env', requireFile: null, keys: ['X'] });
    expect(process.exitCode).toBe(1);
  });

  test('warns when no keys specified', () => {
    const envFile = writeTmp('A=1\n');
    runRequireCommand({ envFile, requireFile: null, keys: [] });
    expect(process.exitCode).toBeUndefined();
  });
});
