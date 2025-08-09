const levenshtein = require('fast-levenshtein');

/**
 * Helper functions for character type detection
 */
function isCJKCharacter(char) {
  const code = char.charCodeAt(0);
  return (
    (code >= 0x4e00 && code <= 0x9fff) || // CJK Unified Ideographs
    (code >= 0x3400 && code <= 0x4dbf) || // CJK Extension A
    (code >= 0x20000 && code <= 0x2a6df) || // CJK Extension B
    (code >= 0x2a700 && code <= 0x2b73f) || // CJK Extension C
    (code >= 0x2b740 && code <= 0x2b81f) || // CJK Extension D
    (code >= 0x3040 && code <= 0x309f) || // Hiragana
    (code >= 0x30a0 && code <= 0x30ff) || // Katakana
    (code >= 0xac00 && code <= 0xd7af) // Hangul
  );
}

function isPunctuation(char) {
  const punctuationChars = '.,;:!?，。；：！？""\'\'()[]{}（）【】《》';
  return (
    punctuationChars.includes(char) ||
    /[\u2000-\u206F\u2E00-\u2E7F\u3000-\u303F]/.test(char)
  );
}

function isDigit(char) {
  return /\d/.test(char);
}

function isLatinLetter(char) {
  return /[a-zA-Z]/.test(char);
}

/**
 * Tokenize text for word alignment, handling different languages and punctuation
 * @param {string} text - Original subtitle text
 * @param {string} languageCode - Language code (e.g., 'en-GB', 'cmn-CN')
 * @returns {Array} Array of words/characters with their original indices
 */
function tokenizeText(text, languageCode) {
  if (!text || typeof text !== 'string') return [];

  // Language type detection
  const cjkLanguages = ['cmn-CN', 'zh-CN', 'cmn-Hans-CN', 'ja-JP', 'ko-KR'];
  const spaceSeparatedLanguages = [
    'en-GB',
    'es-ES',
    'fr-FR',
    'de-DE',
    'ru-RU',
    'it-IT',
    'ms-MY',
    'ta-IN',
    'hi-IN',
  ];

  const isCJK = cjkLanguages.includes(languageCode);
  const isSpaceSeparated = spaceSeparatedLanguages.includes(languageCode);

  if (isCJK) {
    // CJK language tokenization (character-based with grouping)
    return tokenizeCJKText(text);
  } else if (isSpaceSeparated) {
    // Space-separated language tokenization (preserving punctuation)
    return tokenizeSpaceSeparatedText(text);
  } else {
    // Unknown language - default to space-separated with punctuation preservation
    return tokenizeSpaceSeparatedText(text);
  }
}

/**
 * Tokenize CJK (Chinese, Japanese, Korean) text
 * @param {string} text - CJK text
 * @returns {Array} Array of character/word units
 */
function tokenizeCJKText(text) {
  const tokens = [];
  let currentIndex = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (isPunctuation(char)) {
      // Punctuation as separate token
      tokens.push({
        word: char,
        originalWord: char,
        index: currentIndex++,
        cleanWord: char,
        type: 'punctuation',
      });
    } else if (isDigit(char)) {
      // Group consecutive digits and related characters (like 年, 月, 日)
      let numberGroup = char;
      let j = i + 1;
      while (
        j < text.length &&
        (isDigit(text[j]) || '年月日时分秒'.includes(text[j]))
      ) {
        numberGroup += text[j];
        j++;
      }
      tokens.push({
        word: numberGroup,
        originalWord: numberGroup,
        index: currentIndex++,
        cleanWord: numberGroup,
        type: 'number',
      });
      i = j - 1; // Skip the characters we've consumed
    } else if (isLatinLetter(char)) {
      // Group consecutive Latin letters (for mixed content)
      let latinGroup = char;
      let j = i + 1;
      while (j < text.length && isLatinLetter(text[j])) {
        latinGroup += text[j];
        j++;
      }
      tokens.push({
        word: latinGroup,
        originalWord: latinGroup,
        index: currentIndex++,
        cleanWord: latinGroup.toLowerCase(),
        type: 'latin',
      });
      i = j - 1; // Skip the characters we've consumed
    } else if (isCJKCharacter(char)) {
      // Individual CJK characters (could be enhanced with word segmentation)
      tokens.push({
        word: char,
        originalWord: char,
        index: currentIndex++,
        cleanWord: char,
        type: 'cjk',
      });
    } else if (char.trim()) {
      // Other non-whitespace characters
      tokens.push({
        word: char,
        originalWord: char,
        index: currentIndex++,
        cleanWord: char,
        type: 'other',
      });
    }
    // Skip whitespace characters
  }

  return tokens;
}

/**
 * Tokenize space-separated text while preserving punctuation
 * @param {string} text - Space-separated text
 * @returns {Array} Array of word units
 */
function tokenizeSpaceSeparatedText(text) {
  const tokens = [];
  let currentIndex = 0;

  // Split by whitespace but preserve punctuation
  const words = text.trim().split(/\s+/);

  for (const word of words) {
    if (!word) continue;

    // Check if word has punctuation attached
    const cleanWord = word.replace(/[^\w'-]/g, '');

    if (cleanWord.length > 0) {
      tokens.push({
        word: cleanWord,
        originalWord: word,
        index: currentIndex++,
        cleanWord: cleanWord.toLowerCase(),
        type: 'word',
      });
    }

    // Extract punctuation if present
    const punctuation = word.replace(/[\w\s'-]/g, '');
    if (punctuation) {
      for (const punct of punctuation) {
        tokens.push({
          word: punct,
          originalWord: punct,
          index: currentIndex++,
          cleanWord: punct,
          type: 'punctuation',
        });
      }
    }
  }

  return tokens;
}

/**
 * Calculate similarity between two words using edit distance
 * @param {string} word1
 * @param {string} word2
 * @returns {number} Similarity score (0-1, higher is more similar)
 */
function calculateWordSimilarity(word1, word2) {
  if (!word1 || !word2) return 0;

  const clean1 = word1.toLowerCase().replace(/[^\w]/g, '');
  const clean2 = word2.toLowerCase().replace(/[^\w]/g, '');

  if (clean1 === clean2) return 1;
  if (clean1.length === 0 || clean2.length === 0) return 0;

  const maxLength = Math.max(clean1.length, clean2.length);
  const distance = levenshtein.get(clean1, clean2);

  return Math.max(0, (maxLength - distance) / maxLength);
}

/**
 * Align detected word timings with original subtitle words
 * @param {Array} originalWords - Tokenized original words/characters
 * @param {Array} detectedTimings - Word timings from speech recognition
 * @returns {Array} Alignment mapping
 */
function alignWordsToOriginal(originalWords, detectedTimings) {
  if (!originalWords.length || !detectedTimings.length) {
    return originalWords.map((word, index) => ({
      originalIndex: index,
      detectedIndex: null,
    }));
  }

  const alignment = [];
  let detectedIndex = 0;

  for (
    let originalIndex = 0;
    originalIndex < originalWords.length;
    originalIndex++
  ) {
    const originalWord = originalWords[originalIndex];

    // Skip punctuation in alignment - they don't have speech timings
    if (originalWord.type === 'punctuation') {
      alignment.push({
        originalIndex,
        detectedIndex: null,
        timing: null,
        similarity: 0,
        skipAlignment: true, // Flag for punctuation
      });
      continue;
    }

    let bestMatch = null;
    let bestSimilarity = 0;
    let bestDetectedIndex = null;

    // Look for the best match within a reasonable window
    const searchStart = Math.max(0, detectedIndex - 2);
    const searchEnd = Math.min(detectedTimings.length, detectedIndex + 5);

    for (let i = searchStart; i < searchEnd; i++) {
      if (detectedTimings[i].used) continue; // Skip already used words

      const similarity = calculateWordSimilarity(
        originalWord.cleanWord,
        detectedTimings[i].word,
      );

      // Adjust similarity threshold based on token type
      const minSimilarity = originalWord.type === 'cjk' ? 0.8 : 0.6; // Higher threshold for CJK

      if (similarity > bestSimilarity && similarity > minSimilarity) {
        bestSimilarity = similarity;
        bestDetectedIndex = i;
        bestMatch = detectedTimings[i];
      }
    }

    if (bestMatch && bestDetectedIndex !== null) {
      // Mark as used to avoid double-matching
      detectedTimings[bestDetectedIndex].used = true;
      alignment.push({
        originalIndex,
        detectedIndex: bestDetectedIndex,
        timing: bestMatch,
        similarity: bestSimilarity,
      });

      // Move detection pointer forward
      detectedIndex = Math.max(detectedIndex, bestDetectedIndex + 1);
    } else {
      // No good match found
      alignment.push({
        originalIndex,
        detectedIndex: null,
        timing: null,
        similarity: 0,
      });
    }
  }

  return alignment;
}

/**
 * Interpolate timing for words without detected timings
 * @param {Array} originalWords - Tokenized original words/characters
 * @param {Array} alignment - Word alignment mapping
 * @param {Array} detectedTimings - Original detected timings
 * @returns {Array} Complete word timings for all original words
 */
function interpolateWordTimings(originalWords, alignment, detectedTimings) {
  const enhancedTimings = [];

  // Calculate average speech rate from detected words
  const detectedWords = alignment.filter((a) => a.timing);
  let avgWordsPerSecond = 2.5; // Default fallback rate

  if (detectedWords.length > 1) {
    const totalDuration =
      Math.max(...detectedWords.map((w) => w.timing.end)) -
      Math.min(...detectedWords.map((w) => w.timing.start));
    if (totalDuration > 0) {
      avgWordsPerSecond = detectedWords.length / totalDuration;
    }
  }

  for (let i = 0; i < originalWords.length; i++) {
    const originalWord = originalWords[i];
    const alignmentEntry = alignment[i];

    if (alignmentEntry.timing) {
      // Use detected timing
      enhancedTimings.push({
        word: originalWord.originalWord, // Use originalWord to preserve punctuation
        start: alignmentEntry.timing.start,
        end: alignmentEntry.timing.end,
        source: 'detected',
        type: originalWord.type,
      });
    } else if (alignmentEntry.skipAlignment) {
      // Punctuation - attach to previous word's timing or interpolate
      const prevTiming = enhancedTimings[enhancedTimings.length - 1];
      if (prevTiming) {
        // Attach punctuation to end of previous word
        enhancedTimings.push({
          word: originalWord.originalWord,
          start: prevTiming.end,
          end: prevTiming.end + 0.1, // Very short duration for punctuation
          source: 'punctuation_attached',
          type: originalWord.type,
        });
      } else {
        // First word is punctuation, use start time
        enhancedTimings.push({
          word: originalWord.originalWord,
          start: 0,
          end: 0.1,
          source: 'punctuation_start',
          type: originalWord.type,
        });
      }
    } else {
      // Interpolate timing for word/character
      const interpolatedTiming = interpolateWordTiming(
        i,
        originalWords,
        enhancedTimings,
        alignment,
        avgWordsPerSecond,
      );
      enhancedTimings.push({
        word: originalWord.originalWord, // Use originalWord to preserve punctuation
        start: interpolatedTiming.start,
        end: interpolatedTiming.end,
        source: 'interpolated',
        type: originalWord.type,
      });
    }
  }

  return enhancedTimings;
}

/**
 * Interpolate timing for a single word based on surrounding context
 * @param {number} wordIndex - Index of word to interpolate
 * @param {Array} originalWords - All original words
 * @param {Array} enhancedTimings - Timings built so far
 * @param {Array} alignment - Word alignment mapping
 * @param {number} avgWordsPerSecond - Average speaking rate
 * @returns {Object} Interpolated timing {start, end}
 */
function interpolateWordTiming(
  wordIndex,
  originalWords,
  enhancedTimings,
  alignment,
  avgWordsPerSecond,
) {
  const wordLength = originalWords[wordIndex].originalWord.length;
  const avgWordDuration = Math.max(
    0.2,
    Math.min(1.0, wordLength / (avgWordsPerSecond * 5)),
  ); // 0.2s to 1.0s range

  // Find previous word with timing
  let prevTiming = null;
  for (let i = wordIndex - 1; i >= 0; i--) {
    if (enhancedTimings[i]) {
      prevTiming = enhancedTimings[i];
      break;
    }
  }

  // Find next word with timing
  let nextTiming = null;
  for (let i = wordIndex + 1; i < alignment.length; i++) {
    if (alignment[i].timing) {
      nextTiming = alignment[i].timing;
      break;
    }
  }

  let start, end;

  if (prevTiming && nextTiming) {
    // Interpolate between previous and next timings
    const gapDuration = nextTiming.start - prevTiming.end;
    const wordsInGap = countWordsInGap(wordIndex, alignment);
    const timePerWord = gapDuration / wordsInGap;
    const positionInGap = getPositionInGap(wordIndex, alignment);

    start = prevTiming.end + positionInGap * timePerWord;
    end = start + Math.min(timePerWord * 0.8, avgWordDuration);
  } else if (prevTiming) {
    // Extend from previous timing
    start = prevTiming.end;
    end = start + avgWordDuration;
  } else if (nextTiming) {
    // Work backwards from next timing
    end = Math.max(0, nextTiming.start - 0.1);
    start = Math.max(0, end - avgWordDuration);
  } else {
    // No surrounding context, use word index and average rate
    start = wordIndex / avgWordsPerSecond;
    end = start + avgWordDuration;
  }

  return { start, end };
}

/**
 * Count words in a gap between detected timings
 */
function countWordsInGap(currentIndex, alignment) {
  let count = 0;
  let i = currentIndex;

  // Count backwards until we find a detected word
  while (i >= 0 && !alignment[i].timing) {
    if (i <= currentIndex) count++;
    i--;
  }

  // Count forwards until we find a detected word
  i = currentIndex + 1;
  while (i < alignment.length && !alignment[i].timing) {
    count++;
    i++;
  }

  return Math.max(1, count);
}

/**
 * Get position of current word within a gap
 */
function getPositionInGap(currentIndex, alignment) {
  let position = 0;
  let i = currentIndex;

  // Count backwards until we find a detected word
  while (i >= 0 && !alignment[i].timing) {
    if (i < currentIndex) position++;
    i--;
  }

  return position;
}

/**
 * Main function to enhance word timings with alignment and interpolation
 * @param {string} originalText - Original subtitle text
 * @param {Array} detectedTimings - Raw word timings from speech recognition
 * @param {string} languageCode - Language code
 * @returns {Array} Enhanced word timings for all original words
 */
function enhanceWordTimings(originalText, detectedTimings, languageCode) {
  try {
    console.log('Enhancing word timings...', {
      originalLength: originalText.length,
      detectedCount: detectedTimings.length,
      languageCode,
    });

    // Step 1: Tokenize original text
    const originalWords = tokenizeText(originalText, languageCode);

    if (originalWords.length === 0) {
      console.warn('No words found in original text');
      return [];
    }

    if (detectedTimings.length === 0) {
      console.warn('No detected timings available, creating fallback timings');
      return createFallbackTimings(originalWords);
    }

    // Step 2: Align words
    const alignment = alignWordsToOriginal(originalWords, [...detectedTimings]); // Clone to avoid mutation

    // Step 3: Interpolate missing timings
    const enhancedTimings = interpolateWordTimings(
      originalWords,
      alignment,
      detectedTimings,
    );

    console.log('Word timing enhancement completed', {
      originalWords: originalWords.length,
      detectedWords: detectedTimings.length,
      enhancedWords: enhancedTimings.length,
      matchedWords: alignment.filter((a) => a.timing).length,
    });

    return enhancedTimings;
  } catch (error) {
    console.error('Error enhancing word timings:', error);
    // Fallback to simple timing distribution
    const originalWords = tokenizeText(originalText, languageCode);
    return createFallbackTimings(originalWords);
  }
}

/**
 * Create fallback timings when no detected timings are available
 * @param {Array} originalWords - Tokenized original words
 * @returns {Array} Basic word timings
 */
function createFallbackTimings(originalWords) {
  const avgWordDuration = 0.6; // seconds per word

  return originalWords.map((wordObj, index) => ({
    word: wordObj.originalWord, // Use originalWord to preserve punctuation
    start: index * avgWordDuration,
    end: (index + 1) * avgWordDuration,
    source: 'fallback',
    type: wordObj.type,
  }));
}

module.exports = {
  enhanceWordTimings,
  tokenizeText,
  alignWordsToOriginal,
  interpolateWordTimings,
  calculateWordSimilarity,
};
