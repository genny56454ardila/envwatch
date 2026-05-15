const { inferType, generateSchema, validateAgainstSchema, serializeSchema } = require('./envSchema');

function makeMap(obj) {
  return new Map(Object.entries(obj));
}

describe('inferType', () => {
  test('detects boolean true', () => expect(inferType('true')).toBe('boolean'));
  test('detects boolean false', () => expect(inferType('false')).toBe('boolean'));
  test('detects number', () => expect(inferType('42')).toBe('number'));
  test('detects float', () => expect(inferType('3.14')).toBe('number'));
  test('detects string', () => expect(inferType('hello')).toBe('string'));
  test('detects empty-ish string', () => expect(inferType('')).toBe('string'));
});

describe('generateSchema', () => {
  test('produces valid schema structure', () => {
    const map = makeMap({ PORT: '3000', DEBUG: 'true', NAME: 'app' });
    const schema = generateSchema(map);
    expect(schema.$schema).toContain('json-schema.org');
    expect(schema.type).toBe('object');
    expect(schema.properties.PORT.type).toBe('number');
    expect(schema.properties.DEBUG.type).toBe('boolean');
    expect(schema.properties.NAME.type).toBe('string');
  });

  test('includes required keys by default', () => {
    const map = makeMap({ FOO: 'bar' });
    const schema = generateSchema(map);
    expect(schema.required).toContain('FOO');
  });

  test('omits required when option is false', () => {
    const map = makeMap({ FOO: 'bar' });
    const schema = generateSchema(map, { required: false });
    expect(schema.required).toBeUndefined();
  });

  test('uses custom title', () => {
    const schema = generateSchema(makeMap({}), { title: 'my app' });
    expect(schema.title).toBe('my app');
  });
});

describe('validateAgainstSchema', () => {
  test('no issues when env matches schema', () => {
    const map = makeMap({ PORT: '8080', DEBUG: 'false' });
    const schema = generateSchema(map);
    expect(validateAgainstSchema(map, schema)).toHaveLength(0);
  });

  test('reports missing required key', () => {
    const schema = { properties: { PORT: { type: 'number' } }, required: ['PORT'] };
    const issues = validateAgainstSchema(new Map(), schema);
    expect(issues[0]).toMatch(/Missing required key: PORT/);
  });

  test('reports type mismatch', () => {
    const schema = { properties: { PORT: { type: 'boolean' } }, required: [] };
    const issues = validateAgainstSchema(makeMap({ PORT: '3000' }), schema);
    expect(issues[0]).toMatch(/Type mismatch for PORT/);
  });
});

describe('serializeSchema', () => {
  test('returns pretty JSON string', () => {
    const schema = generateSchema(makeMap({ X: '1' }));
    const out = serializeSchema(schema);
    expect(() => JSON.parse(out)).not.toThrow();
    expect(out).toContain('\n');
  });
});
