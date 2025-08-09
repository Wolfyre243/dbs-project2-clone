const speech = require('@google-cloud/speech');
const axios = require('axios'); // Add axios to dependencies if not already present
const levenshtein = require('fast-levenshtein');
const { enhanceWordTimings } = require('./wordAlignmentHelper');

const client = new speech.SpeechClient();

// ENHANCED CODE with word alignment and interpolation
const generateWordTimings = async (audioUrl, text, languageCode) => {
  try {
    console.log('Starting to generate enhanced word timings...', {
      textLength: text?.length,
      languageCode,
      audioUrl: audioUrl?.substring(0, 50) + '...',
    });

    const audioResponse = await axios.get(audioUrl, {
      responseType: 'arraybuffer',
      timeout: 10000,
    });
    const audioContent = Buffer.from(audioResponse.data).toString('base64');

    const mappedLanguage =
      languageCode === 'cmn-CN' ? 'cmn-Hans-CN' : languageCode || 'en-US';

    const audio = { content: audioContent };
    const config = {
      enableWordTimeOffsets: true,
      languageCode: mappedLanguage,
      model: 'default',
    };

    const request = { audio, config };
    const [operation] = await client.longRunningRecognize(request);
    const [sttResponse] = await operation.promise();
    const results = sttResponse.results || [];

    // Extract raw word timings from Google Speech-to-Text
    const rawWordTimings = results
      .flatMap((result) => result.alternatives[0]?.words || [])
      .map((wordInfo) => ({
        word: wordInfo.word,
        start:
          parseFloat(wordInfo.startTime?.seconds || 0) +
          (wordInfo.startTime?.nanos || 0) / 1e9,
        end:
          parseFloat(wordInfo.endTime?.seconds || 0) +
          (wordInfo.endTime?.nanos || 0) / 1e9,
      }));

    console.log('Raw Speech-to-Text result:', {
      detectedWords: rawWordTimings.length,
      firstFew: rawWordTimings.slice(0, 3),
    });

    // NEW: Enhance word timings with alignment and interpolation
    const enhancedTimings = enhanceWordTimings(
      text,
      rawWordTimings,
      languageCode,
    );

    console.log('Enhanced word timings generated:', {
      originalWords: text?.split(/\s+/).length || 0,
      detectedWords: rawWordTimings.length,
      enhancedWords: enhancedTimings.length,
    });

    return enhancedTimings;
  } catch (error) {
    console.error(
      'Enhanced word timing generation error:',
      error.message,
      error.stack,
    );

    // Enhanced fallback: create timing for every word in original text
    const normalizedText = text ? text.replace(/\s+/g, ' ').trim() : '';
    if (!normalizedText) return [];

    const words = normalizedText.split(/\s+/);
    const avgWordDuration = 0.6; // seconds per word fallback

    console.log('Using fallback word timings for', words.length, 'words');

    return words.map((word, index) => ({
      word: word.replace(/[^\w\s'-]/g, ''), // remove punctuation but keep apostrophes/hyphens
      start: index * avgWordDuration,
      end: (index + 1) * avgWordDuration,
      source: 'fallback',
    }));
  }
};

const generateWordTimingsBatch = async (subtitles) => {
  try {
    console.log(
      'Starting enhanced batch processing for',
      subtitles.length,
      'subtitles',
    );

    // Download audio files in parallel
    const startDownload = Date.now();
    const audioResponsesSettled = await Promise.allSettled(
      subtitles.map(async ({ subtitleId, audioUrl }) => {
        try {
          const response = await axios.get(audioUrl, {
            responseType: 'arraybuffer',
            timeout: 10000,
          });
          return {
            subtitleId,
            audioContent: Buffer.from(response.data).toString('base64'),
          };
        } catch (error) {
          console.warn(
            `Audio download failed for ${subtitleId}: ${error.message}`,
          );
          return { subtitleId, audioContent: null };
        }
      }),
    );

    const audioResponses = audioResponsesSettled.map((result, idx) =>
      result.status === 'fulfilled'
        ? result.value
        : { subtitleId: subtitles[idx].subtitleId, audioContent: null },
    );
    console.log(`Batch audio download took ${Date.now() - startDownload}ms`);

    // Create audio map for easy lookup
    const audioMap = audioResponses.reduce(
      (acc, { subtitleId, audioContent }) => {
        acc[subtitleId] = audioContent;
        return acc;
      },
      {},
    );

    // Process Speech-to-Text requests in parallel with enhanced word timing
    const startApi = Date.now();
    const resultsSettled = await Promise.allSettled(
      subtitles.map(async ({ subtitleId, text, languageCode, audioUrl }) => {
        const audioContent = audioMap[subtitleId];
        const normalizedText = text ? text.replace(/\s+/g, ' ').trim() : '';

        if (!audioContent) {
          console.warn(
            `No audio content for subtitle ${subtitleId}, using text-based fallback`,
          );
          // Enhanced fallback using original text
          const words = normalizedText ? normalizedText.split(/\s+/) : [];
          const avgWordDuration = 0.6;

          return {
            subtitleId,
            wordTimings: words.map((word, index) => ({
              word: word.replace(/[^\w\s'-]/g, ''),
              start: index * avgWordDuration,
              end: (index + 1) * avgWordDuration,
              source: 'fallback',
            })),
          };
        }

        try {
          // Use the enhanced generateWordTimings function
          const wordTimings = await generateWordTimings(
            audioUrl, // Use original URL instead of base64 data
            normalizedText,
            languageCode,
          );
          return { subtitleId, wordTimings };
        } catch (error) {
          console.error(
            `Error processing subtitle ${subtitleId}:`,
            error.message,
          );
          // Enhanced fallback
          const words = normalizedText ? normalizedText.split(/\s+/) : [];
          const avgWordDuration = 0.6;

          return {
            subtitleId,
            wordTimings: words.map((word, index) => ({
              word: word.replace(/[^\w\s'-]/g, ''),
              start: index * avgWordDuration,
              end: (index + 1) * avgWordDuration,
              source: 'fallback',
            })),
          };
        }
      }),
    );

    const results = resultsSettled.map((result, idx) =>
      result.status === 'fulfilled'
        ? result.value
        : {
            subtitleId: subtitles[idx].subtitleId,
            wordTimings: subtitles[idx].text
              ? subtitles[idx].text
                  .replace(/\s+/g, ' ')
                  .trim()
                  .split(/\s+/)
                  .map((word, index) => ({
                    word: word.replace(/[^\w\s'-]/g, ''),
                    start: index * 0.6,
                    end: (index + 1) * 0.6,
                    source: 'fallback',
                  }))
              : [],
          },
    );

    console.log(
      `Enhanced batch Speech-to-Text took ${Date.now() - startApi}ms`,
    );
    console.log('Batch processing summary:', {
      totalSubtitles: results.length,
      enhancedWords: results.reduce((sum, r) => sum + r.wordTimings.length, 0),
    });

    return results;
  } catch (error) {
    console.error('Enhanced batch processing error:', {
      message: error.message,
      stack: error.stack,
    });
    // Enhanced fallback for entire batch
    return subtitles.map(({ subtitleId, text }) => {
      const words = text ? text.replace(/\s+/g, ' ').trim().split(/\s+/) : [];
      return {
        subtitleId,
        wordTimings: words.map((word, index) => ({
          word: word.replace(/[^\w\s'-]/g, ''),
          start: index * 0.6,
          end: (index + 1) * 0.6,
          source: 'fallback',
        })),
      };
    });
  }
};

module.exports = {
  generateWordTimings,
  generateWordTimingsBatch,
};
