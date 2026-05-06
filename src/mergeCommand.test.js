const fs = require('fs');
const os = require('os');
const path = require('path');
const { parseMergeArgs, runMergeCommand } = require('./mergeCommand');

function writeTmp(name, content) {
  const p = path.join(os.tmpdir(), name);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('parseMergeArgs', () => {
  test('parses file list', () => {
    const { files } = parseMergeArgs(['node', 'merge', '.env', '.env.local']);
    expect(files).toEqual(['.env', '.env.local']);
  });

  test('parses --output flag', () => {
    const { output } = parseMergeArgs(['node', 'merge', 'a', 'b', '--output', 'out.env']);
    expect(output).toBe('out.env');
  });

  test('parses --priority flag', () => {
    const { usePriority } = parseMergeArgs(['node', 'merge', 'a', 'b', '--priority']);
    expect(usePriority).toBe(true);
  });

  test('defaults output to null and usePriority to false', () => {
    const { output, usePriority } = parseMergeArgs(['node', 'merge', 'a', 'b']);
    expect(output).toBeNull();
    expect(usePriority).toBe(false);
  });
});

describe('runMergeCommand', () => {
  test('writes merged output to file', () => {
    const f1 = writeTmp('merge1.env', 'A=1\nB=2\n');
    const f2 = writeTmp('merge2.env', 'B=3\nC=4\n');
    const out = path.join(os.tmpdir(), 'merged_out.env');
    runMergeCommand(['node', 'merge', f1, f2, '--output', out]);
    const content = fs.readFileSync(out, 'utf8');
    expect(content).toContain('A=1');
    expect(content).toContain('B=3');
    expect(content).toContain('C=4');
  });

  test('exits with error if fewer than 2 files provided', () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    expect(() => runMergeCommand(['node', 'merge', 'only_one.env'])).toThrow('exit');
    mockExit.mockRestore();
  });
});
