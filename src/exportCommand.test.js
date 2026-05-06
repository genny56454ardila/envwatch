const { parseExportArgs, SUPPORTED_FORMATS, DEFAULT_OUTPUT_NAMES } = require('./exportCommand');

describe('SUPPORTED_FORMATS', () => {
  it('includes shell, json, docker', () => {
    expect(SUPPORTED_FORMATS).toContain('shell');
    expect(SUPPORTED_FORMATS).toContain('json');
    expect(SUPPORTED_FORMATS).toContain('docker');
  });
});

describe('DEFAULT_OUTPUT_NAMES', () => {
  it('has a default name for each format', () => {
    SUPPORTED_FORMATS.forEach(fmt => {
      expect(DEFAULT_OUTPUT_NAMES[fmt]).toBeDefined();
    });
  });
});

describe('parseExportArgs', () => {
  it('returns defaults when no args given', () => {
    const args = parseExportArgs([]);
    expect(args.format).toBe('json');
    expect(args.envFile).toBe('.env');
    expect(args.output).toBeNull();
  });

  it('parses --format flag', () => {
    const args = parseExportArgs(['--format', 'shell']);
    expect(args.format).toBe('shell');
  });

  it('parses -f shorthand', () => {
    const args = parseExportArgs(['-f', 'docker']);
    expect(args.format).toBe('docker');
  });

  it('parses --env flag', () => {
    const args = parseExportArgs(['--env', '.env.production']);
    expect(args.envFile).toBe('.env.production');
  });

  it('parses -e shorthand', () => {
    const args = parseExportArgs(['-e', '.env.staging']);
    expect(args.envFile).toBe('.env.staging');
  });

  it('parses --output flag', () => {
    const args = parseExportArgs(['--output', '/tmp/myenv.sh']);
    expect(args.output).toBe('/tmp/myenv.sh');
  });

  it('parses -o shorthand', () => {
    const args = parseExportArgs(['-o', 'out.json']);
    expect(args.output).toBe('out.json');
  });

  it('parses combined flags', () => {
    const args = parseExportArgs(['-f', 'shell', '-e', '.env.local', '-o', 'result.sh']);
    expect(args.format).toBe('shell');
    expect(args.envFile).toBe('.env.local');
    expect(args.output).toBe('result.sh');
  });
});
