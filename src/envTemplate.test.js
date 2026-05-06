const { redactValue, generateTemplate, writeTemplate } = require('./envTemplate');
const fs = require('fs');
const os = require('os');
const path = require('path');

describe('redactValue', () => {
  test('redacts password keys', () => {
    expect(redactValue('DB_PASSWORD', 'supersecret')).toBe('your_db_password_here');
  });

  test('redacts token keys', () => {
    expect(redactValue('API_TOKEN', 'abc123')).toBe('your_api_token_here');
  });

  test('uses url placeholder for URL keys', () => {
    expect(redactValue('DATABASE_URL', 'postgres://user:pass@host/db')).toBe('http://example.com');
  });

  test('uses port placeholder for PORT keys', () => {
    expect(redactValue('PORT', '8080')).toBe('3000');
  });

  test('uses host placeholder for HOST keys', () => {
    expect(redactValue('DB_HOST', 'db.internal')).toBe('localhost');
  });

  test('uses email placeholder for EMAIL keys', () => {
    expect(redactValue('SMTP_EMAIL', 'admin@corp.com')).toBe('user@example.com');
  });

  test('returns REPLACE_ME for generic keys', () => {
    expect(redactValue('APP_NAME', 'myapp')).toBe('REPLACE_ME');
  });

  test('returns empty string for empty value', () => {
    expect(redactValue('SOME_KEY', '')).toBe('');
  });
});

describe('generateTemplate', () => {
  test('preserves blank lines and comments', () => {
    const input = '# App config\n\nAPP_NAME=myapp\nPORT=4000';
    const out = generateTemplate(input);
    expect(out).toContain('# App config');
    expect(out).toContain('\n\n');
  });

  test('redacts values', () => {
    const input = 'SECRET_KEY=abc123\nPORT=9000';
    const out = generateTemplate(input);
    expect(out).toContain('SECRET_KEY=your_secret_key_here');
    expect(out).toContain('PORT=3000');
  });

  test('handles lines without = sign', () => {
    const input = 'INVALID_LINE\nVALID=ok';
    const out = generateTemplate(input);
    expect(out).toContain('INVALID_LINE');
  });
});

describe('writeTemplate', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envtemplate-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('writes template file from input', () => {
    const input = path.join(tmpDir, '.env');
    const output = path.join(tmpDir, '.env.example');
    fs.writeFileSync(input, 'API_KEY=realsecret\nPORT=3000', 'utf8');
    writeTemplate(input, output);
    const result = fs.readFileSync(output, 'utf8');
    expect(result).toContain('API_KEY=your_api_key_here');
    expect(result).toContain('PORT=3000');
  });

  test('throws if input file does not exist', () => {
    expect(() => writeTemplate('/nonexistent/.env', '/tmp/out.example')).toThrow('Input file not found');
  });
});
