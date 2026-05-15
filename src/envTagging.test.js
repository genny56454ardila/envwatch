const { parseTagComment, extractTags, filterByTag, validateTags, formatTagIssues } = require('./envTagging');

describe('parseTagComment', () => {
  test('parses single tag', () => {
    expect(parseTagComment('# @tags required')).toEqual(['required']);
  });

  test('parses multiple tags', () => {
    expect(parseTagComment('# @tags required,secret')).toEqual(['required', 'secret']);
  });

  test('returns empty for non-tag comment', () => {
    expect(parseTagComment('# just a comment')).toEqual([]);
  });

  test('handles extra spaces', () => {
    expect(parseTagComment('# @tags  secret , internal ')).toEqual(['secret', 'internal']);
  });
});

describe('extractTags', () => {
  const content = [
    '# @tags required,secret',
    'DB_PASSWORD=hunter2',
    '# just a comment',
    'APP_NAME=myapp',
    '# @tags internal',
    'INTERNAL_ID=42',
  ].join('\n');

  test('extracts tags for annotated keys', () => {
    const tagMap = extractTags(content);
    expect(tagMap.get('DB_PASSWORD')).toEqual(['required', 'secret']);
    expect(tagMap.get('INTERNAL_ID')).toEqual(['internal']);
  });

  test('does not tag keys without annotation', () => {
    const tagMap = extractTags(content);
    expect(tagMap.has('APP_NAME')).toBe(false);
  });
});

describe('filterByTag', () => {
  const envMap = new Map([['DB_PASSWORD', 'x'], ['APP_NAME', 'y'], ['INTERNAL_ID', '42']]);
  const tagMap = new Map([
    ['DB_PASSWORD', ['required', 'secret']],
    ['INTERNAL_ID', ['internal']],
  ]);

  test('filters to only tagged keys', () => {
    const result = filterByTag(envMap, tagMap, 'secret');
    expect([...result.keys()]).toEqual(['DB_PASSWORD']);
  });

  test('returns empty map if no match', () => {
    const result = filterByTag(envMap, tagMap, 'readonly');
    expect(result.size).toBe(0);
  });
});

describe('validateTags', () => {
  test('returns no issues for valid tags', () => {
    const tagMap = new Map([['KEY', ['required', 'secret']]]);
    expect(validateTags(tagMap)).toEqual([]);
  });

  test('flags unknown tags', () => {
    const tagMap = new Map([['KEY', ['required', 'experimental']]]);
    const issues = validateTags(tagMap);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toEqual({ key: 'KEY', tag: 'experimental' });
  });
});

describe('formatTagIssues', () => {
  test('formats issues as readable lines', () => {
    const issues = [{ key: 'FOO', tag: 'oops' }];
    expect(formatTagIssues(issues)).toContain('[unknown tag] FOO: "oops"');
  });
});
