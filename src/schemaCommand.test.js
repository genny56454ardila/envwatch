const fs = require('fs');
const os = require('os');
const path = require('path');
const { parseSchemaArgs, runSchemaCommand } = require('./schemaCommand');

function writeTmp(name, content) {
  const p = path.join(os.tmpdir(), name);
  fs.writeFileSync(p, content, 'utf8');
  return p;
}

describe('parseSchemaArgs', () => {
  test('defaults to generate mode', () => {
    const opts = parseSchemaArgs(['node', 'schema']);
    expect(opts.mode).toBe('generate');
    expect(opts.envFile).toBe('.env');
    expect(opts.required).toBe(true);
  });

  test('parses --validate flag', () => {
    const opts = parseSchemaArgs(['node', 'schema', '--validate', 'schema.json']);
    expect(opts.mode).toBe('validate');
    expect(opts.schemaFile).toBe('schema.json');
  });

  test('parses --env and --output', () => {
    const opts = parseSchemaArgs(['node', 'schema', '--env', '.env.prod', '--output', 'out.json']);
    expect(opts.envFile).toBe('.env.prod');
    expect(opts.output).toBe('out.json');
  });

  test('parses --no-required', () => {
    const opts = parseSchemaArgs(['node', 'schema', '--no-required']);
    expect(opts.required).toBe(false);
  });
});

describe('runSchemaCommand generate', () => {
  test('generates schema and writes to output file', async () => {
    const envFile = writeTmp('schema-gen.env', 'PORT=3000\nDEBUG=true\nNAME=app\n');
    const outFile = path.join(os.tmpdir(), 'generated-schema.json');
    const result = await runSchemaCommand({ mode: 'generate', envFile, output: outFile, required: true });
    expect(result.success).toBe(true);
    const written = JSON.parse(fs.readFileSync(outFile, 'utf8'));
    expect(written.properties.PORT.type).toBe('number');
    expect(written.required).toContain('NAME');
  });
});

describe('runSchemaCommand validate', () => {
  test('passes validation when env matches schema', async () => {
    const envFile = writeTmp('schema-val.env', 'PORT=8080\nDEBUG=false\n');
    const schema = {
      properties: { PORT: { type: 'number' }, DEBUG: { type: 'boolean' } },
      required: ['PORT', 'DEBUG']
    };
    const schemaFile = writeTmp('val-schema.json', JSON.stringify(schema));
    const result = await runSchemaCommand({ mode: 'validate', envFile, schemaFile });
    expect(result.success).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  test('fails when required key is missing', async () => {
    const envFile = writeTmp('schema-miss.env', 'DEBUG=true\n');
    const schema = { properties: { PORT: { type: 'number' } }, required: ['PORT'] };
    const schemaFile = writeTmp('miss-schema.json', JSON.stringify(schema));
    const result = await runSchemaCommand({ mode: 'validate', envFile, schemaFile });
    expect(result.success).toBe(false);
    expect(result.issues[0]).toMatch(/PORT/);
  });

  test('returns error when schema file missing', async () => {
    const envFile = writeTmp('schema-nofile.env', 'X=1\n');
    const result = await runSchemaCommand({ mode: 'validate', envFile, schemaFile: '/nonexistent/schema.json' });
    expect(result.success).toBe(false);
  });
});
