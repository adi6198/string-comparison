const TextMatcher = require('../TextMatcher');

describe('TextMatcher', () => {
  let matcher;

  beforeEach(() => {
    matcher = new TextMatcher();
  });

  test('Identical strings produce score 1.0', () => {
    const result = matcher.compare('Hello World!', 'hello world'); // Test case-insensitivity and punctuation
    expect(result.score).toBe(1.0);
    expect(result.strategies.exact).toBe(1.0);
    expect(result.strategies.tokenOverlap).toBe(1.0);
  });

  test('Completely unrelated strings produce score below 0.3', () => {
    const result = matcher.compare('The quick brown fox', 'Jumping over the lazy dog');
    expect(result.score).toBeLessThan(0.3);
  });

  test('Near-duplicate strings (one word changed) produce score above 0.7', () => {
    const result = matcher.compare(
      'This is a very long test string that has many words',
      'This is a very long different string that has many words'
    );
    expect(result.score).toBeGreaterThan(0.7);
  });

  test('Empty string inputs do not throw and return score 0.0', () => {
    expect(() => matcher.compare('', '')).not.toThrow();
    const result = matcher.compare('', '');
    expect(result.score).toBe(0.0);
  });

  test('Stop words are excluded from matchedTokens', () => {
    const result = matcher.compare('The cat is on the mat', 'A cat was on a mat');
    expect(result.matchedTokens).toContain('cat');
    expect(result.matchedTokens).toContain('mat');
    expect(result.matchedTokens).not.toContain('the');
    expect(result.matchedTokens).not.toContain('is');
    expect(result.matchedTokens).not.toContain('a');
    expect(result.matchedTokens).not.toContain('was');
  });
});
