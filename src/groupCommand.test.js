const fs = require('fs');
const os = require('os');
const path = require('path');
const { parseGroupArgs, runGroupCommand } = require('./groupCommand');

function writeTmp(content) {
  const p = path.join(os.tmpdir(), `envgroup-${Date.now()}.env`);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('parseGroupArgs', () => {
  it('defaults to prefix mode', () => {
    const args = parseGroupArgs([]);
    expect(args.mode).toBe('prefix');
    expect(args.separator).toBe('_');
  });

  it('parses --file and --output', () => {
    const args = parseGroupArgs(['--file', 'prod.env', '--output', 'out.env']);
    expect(args.file).toBe('prod.env');
    expect(args.output).toBe('out.env');
  });

  it('parses --group and sets mode to keys', () => {
    const args = parseGroupArgs(['--group', 'db=DB_HOST,DB_PORT']);
    expect(args.mode).toBe('keys');
    expect(args.groupDefs['db']).toEqual(['DB_HOST', 'DB_PORT']);
  });

  it('parses custom separator', () => {
    const args = parseGroupArgs(['--separator', '.']);
    expect(args.separator).toBe('.');
  });
});

describe('runGroupCommand', () => {
  it('groups by prefix and writes to output', () => {
    const input = writeTmp('DB_HOST=localhost\nDB_PORT=5432\nAPP_NAME=test\n');
    const output = path.join(os.tmpdir(), `out-${Date.now()}.env`);
    runGroupCommand(['--file', input, '--output', output]);
    const content = fs.readFileSync(output, 'utf8');
    expect(content).toContain('# [DB]');
    expect(content).toContain('DB_HOST=localhost');
    expect(content).toContain('# [APP]');
    fs.unlinkSync(input);
    fs.unlinkSync(output);
  });

  it('groups by explicit key defs', () => {
    const input = writeTmp('DB_HOST=localhost\nSECRET=abc\n');
    const output = path.join(os.tmpdir(), `out2-${Date.now()}.env`);
    runGroupCommand(['--file', input, '--group', 'database=DB_HOST', '--output', output]);
    const content = fs.readFileSync(output, 'utf8');
    expect(content).toContain('# [database]');
    expect(content).toContain('# [__ungrouped__]');
    fs.unlinkSync(input);
    fs.unlinkSync(output);
  });
});
