'use strict';

const { parseEnvContent } = require('./envParser');

describe('parseEnvContent', () => {
  test('parses simple key=value pairs', () => {
    const content = 'FOO=bar\nBAZ=qux';
    expect(parseEnvContent(content)).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  test('ignores comment lines', () => {
    const content = '# this is a comment\nFOO=bar';
    expect(parseEnvContent(content)).toEqual({ FOO: 'bar' });
  });

  test('ignores blank lines', () => {
    const content = '\nFOO=bar\n\nBAZ=qux\n';
    expect(parseEnvContent(content)).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });

  test('strips double-quoted values', () => {
    const content = 'FOO="hello world"';
    expect(parseEnvContent(content)).toEqual({ FOO: 'hello world' });
  });

  test('strips single-quoted values', () => {
    const content = "FOO='hello world'";
    expect(parseEnvContent(content)).toEqual({ FOO: 'hello world' });
  });

  test('strips inline comments', () => {
    const content = 'FOO=bar # this is inline';
    expect(parseEnvContent(content)).toEqual({ FOO: 'bar' });
  });

  test('handles values with equals sign', () => {
    const content = 'FOO=bar=baz';
    expect(parseEnvContent(content)).toEqual({ FOO: 'bar=baz' });
  });

  test('handles empty values', () => {
    const content = 'FOO=';
    expect(parseEnvContent(content)).toEqual({ FOO: '' });
  });

  test('trims whitespace around keys', () => {
    const content = '  FOO  =  bar  ';
    expect(parseEnvContent(content)).toEqual({ FOO: 'bar' });
  });

  test('returns empty object for empty content', () => {
    expect(parseEnvContent('')).toEqual({});
  });

  test('handles windows-style line endings', () => {
    const content = 'FOO=bar\r\nBAZ=qux';
    expect(parseEnvContent(content)).toEqual({ FOO: 'bar', BAZ: 'qux' });
  });
});
