const { parseAnnotations, extractAnnotations, addAnnotation, stripAnnotations, filterByAnnotation } = require('./envAnnotate');

describe('parseAnnotations', () => {
  test('parses single annotation without value', () => {
    expect(parseAnnotations('FOO=bar # @required')).toEqual({ required: true });
  });

  test('parses annotation with value', () => {
    expect(parseAnnotations('FOO=bar # @type:string')).toEqual({ type: 'string' });
  });

  test('parses multiple annotations', () => {
    expect(parseAnnotations('FOO=bar # @required @type:number')).toEqual({ required: true, type: 'number' });
  });

  test('returns empty object for no annotations', () => {
    expect(parseAnnotations('FOO=bar # just a comment')).toEqual({});
  });

  test('returns empty object for line with no comment', () => {
    expect(parseAnnotations('FOO=bar')).toEqual({});
  });
});

describe('extractAnnotations', () => {
  const lines = [
    'FOO=bar # @required @type:string',
    'BAZ=qux',
    '# a comment',
    'NUM=42 # @type:number',
  ];

  test('extracts annotations for annotated keys', () => {
    const result = extractAnnotations(lines);
    expect(result.get('FOO')).toEqual({ required: true, type: 'string' });
    expect(result.get('NUM')).toEqual({ type: 'number' });
  });

  test('does not include unannotated keys', () => {
    const result = extractAnnotations(lines);
    expect(result.has('BAZ')).toBe(false);
  });
});

describe('addAnnotation', () => {
  test('adds annotation to line without comment', () => {
    const result = addAnnotation('FOO=bar', 'FOO', 'required');
    expect(result).toBe('FOO=bar # @required');
  });

  test('appends annotation to existing comment', () => {
    const result = addAnnotation('FOO=bar # existing', 'FOO', 'type', 'string');
    expect(result).toContain('@type:string');
  });

  test('does not modify other keys', () => {
    const content = 'FOO=bar\nBAZ=qux';
    const result = addAnnotation(content, 'FOO', 'required');
    expect(result).toContain('BAZ=qux');
    expect(result.split('\n')[1]).toBe('BAZ=qux');
  });
});

describe('stripAnnotations', () => {
  test('removes annotation tags from lines', () => {
    const result = stripAnnotations('FOO=bar # @required @type:string');
    expect(result).not.toContain('@required');
    expect(result).not.toContain('@type');
  });

  test('leaves lines without annotations unchanged', () => {
    const result = stripAnnotations('FOO=bar');
    expect(result).toBe('FOO=bar');
  });
});

describe('filterByAnnotation', () => {
  const lines = [
    'FOO=bar # @required',
    'BAZ=qux # @optional',
    'NUM=1 # @required @type:number',
  ];

  test('returns keys with given annotation', () => {
    expect(filterByAnnotation(lines, 'required')).toEqual(['FOO', 'NUM']);
  });

  test('returns empty array if none match', () => {
    expect(filterByAnnotation(lines, 'deprecated')).toEqual([]);
  });
});
