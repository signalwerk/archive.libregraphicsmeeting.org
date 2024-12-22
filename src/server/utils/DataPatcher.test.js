import { DataPatcher } from './DataPatcher';

describe('DataPatcher', () => {
  let patcher;

  beforeEach(() => {
    patcher = new DataPatcher();
  });

  it('should replace text using string pattern', () => {
    patcher.addRule({
      search: 'there',
      replace: 'world'
    });

    const result = patcher.patch('test.txt', 'hello there');
    expect(result).toBe('hello world');
  });

  it('should replace text using regex pattern', () => {
    patcher.addRule({
      search: /h\w+o/g,
      replace: 'world'
    });

    const result = patcher.patch('test.txt', 'hello hero');
    expect(result).toBe('world world');
  });

  it('should only apply patches for included paths', () => {
    patcher.addRule({
      search: 'hello',
      replace: 'world',
      includes: ['test.txt', /\.md$/]
    });

    const matchedResult = patcher.patch('test.txt', 'hello there');
    const matchedRegexResult = patcher.patch('readme.md', 'hello there');
    const unmatchedResult = patcher.patch('other.txt', 'hello there');

    expect(matchedResult).toBe('world there');
    expect(matchedRegexResult).toBe('world there');
    expect(unmatchedResult).toBe('hello there');
  });

  it('should skip patches for excluded paths', () => {
    patcher.addRule({
      search: 'hello',
      replace: 'world',
      excludes: ['excluded.txt', /\.skip$/]
    });

    const normalResult = patcher.patch('test.txt', 'hello there');
    const excludedResult = patcher.patch('excluded.txt', 'hello there');
    const excludedRegexResult = patcher.patch('test.skip', 'hello there');

    expect(normalResult).toBe('world there');
    expect(excludedResult).toBe('hello there');
    expect(excludedRegexResult).toBe('hello there');
  });

  it('should apply multiple rules in order', () => {
    patcher
      .addRule({
        search: 'hello',
        replace: 'hi'
      })
      .addRule({
        search: 'hi',
        replace: 'hey'
      });

    const result = patcher.patch('test.txt', 'hello there');
    expect(result).toBe('hey there');
  });

  it('should handle empty includes and excludes', () => {
    patcher.addRule({
      search: 'hello',
      replace: 'world',
      includes: [],
      excludes: []
    });

    const result = patcher.patch('test.txt', 'hello there');
    expect(result).toBe('world there');
  });
}); 