const STOP_WORDS = new Set([
  'the', 'a', 'is', 'are', 'was', 'of', 'in'
]);

class TextMatcher {
  constructor(options = {}) {
    this.options = options;
  }

  normalize(text) {
    if (typeof text !== 'string') return '';
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ') // Replace punctuation with space
      .replace(/\s+/g, ' ')         // Collapse whitespace
      .trim();
  }

  tokenize(text) {
    if (!text) return [];
    return text.split(' ').filter(token => token.length > 0 && !STOP_WORDS.has(token));
  }

  calculateLevenshteinSimilarity(string1, string2) {
    if (string1 === string2) return 1.0;
    if (string1.length === 0 || string2.length === 0) return 0.0;
    
    // Optimized Levenshtein with O(min(m,n)) space
    let length1 = string1.length;
    let length2 = string2.length;
    
    if (length1 > length2) {
      let temporaryString = string1; 
      string1 = string2; 
      string2 = temporaryString;
      
      let temporaryLength = length1; 
      length1 = length2; 
      length2 = temporaryLength;
    }
    
    let previousRow = new Array(length1 + 1);
    let currentRow = new Array(length1 + 1);
    
    for (let rowIndex = 0; rowIndex <= length1; rowIndex++) {
      previousRow[rowIndex] = rowIndex;
    }
    
    for (let columnIndex = 1; columnIndex <= length2; columnIndex++) {
      currentRow[0] = columnIndex;
      for (let rowIndex = 1; rowIndex <= length1; rowIndex++) {
        if (string1[rowIndex - 1] === string2[columnIndex - 1]) {
          currentRow[rowIndex] = previousRow[rowIndex - 1];
        } else {
          currentRow[rowIndex] = Math.min(
            previousRow[rowIndex] + 1,      // deletion
            currentRow[rowIndex - 1] + 1,  // insertion
            previousRow[rowIndex - 1] + 1   // substitution
          );
        }
      }
      let temporaryRow = previousRow;
      previousRow = currentRow;
      currentRow = temporaryRow;
    }
    
    let distance = previousRow[length1];
    let maxLength = Math.max(length1, length2);
    return 1.0 - (distance / maxLength);
  }

  calculateJaccardSimilarity(tokens1, tokens2) {
    let tokenSet1 = new Set(tokens1);
    let tokenSet2 = new Set(tokens2);
    
    let intersection = new Set();
    for (let token of tokenSet1) {
      if (tokenSet2.has(token)) {
        intersection.add(token);
      }
    }
    
    let unionSize = tokenSet1.size + tokenSet2.size - intersection.size;
    if (unionSize === 0) return { score: 0.0, matchedTokens: [] };
    
    return {
      score: intersection.size / unionSize,
      matchedTokens: Array.from(intersection)
    };
  }

  _formatResult(score, exact, tokenOverlap, matchedTokens, processingMs) {
    return {
      score: Number(score.toFixed(2)),
      strategies: {
        exact: Number(exact.toFixed(2)),
        tokenOverlap: Number(tokenOverlap.toFixed(2))
      },
      matchedTokens: matchedTokens,
      processingMs: Number(processingMs.toFixed(3))
    };
  }

  compare(source, candidate) {
    const start = performance.now();
    
    // Empty string inputs must not throw - return score 0.0.
    if (typeof source !== 'string' || typeof candidate !== 'string' || source === '' || candidate === '') {
      return this._formatResult(0.0, 0.0, 0.0, [], performance.now() - start);
    }

    const normSource = this.normalize(source);
    const normCandidate = this.normalize(candidate);

    if (normSource === '' && normCandidate === '') {
        return this._formatResult(0.0, 0.0, 0.0, [], performance.now() - start);
    }

    // Identical strings (after normalization) must produce score 1.0
    if (normSource === normCandidate) {
        const tokens = this.tokenize(normSource);
        const uniqueTokens = Array.from(new Set(tokens));
        return this._formatResult(1.0, 1.0, 1.0, uniqueTokens, performance.now() - start);
    }

    const exactScore = this.calculateLevenshteinSimilarity(normSource, normCandidate);
    
    const sourceTokens = this.tokenize(normSource);
    const candidateTokens = this.tokenize(normCandidate);
    const jaccardResult = this.calculateJaccardSimilarity(sourceTokens, candidateTokens);
    
    const tokenOverlapScore = jaccardResult.score;
    const finalScore = (exactScore + tokenOverlapScore) / 2;

    return this._formatResult(
      finalScore, 
      exactScore, 
      tokenOverlapScore, 
      jaccardResult.matchedTokens, 
      performance.now() - start
    );
  }
}

module.exports = TextMatcher;
