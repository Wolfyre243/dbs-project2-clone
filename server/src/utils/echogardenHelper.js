const speech = require('@google-cloud/speech');
const axios = require('axios'); // Add axios to dependencies if not already present
const levenshtein = require('fast-levenshtein');

const client = new speech.SpeechClient();

// OLD CODE
const generateWordTimings = async (audioUrl, text, languageCode) => {
  try {
    console.log('Starting to generate word timings...');

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

    const wordTimings = results
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

    // console.log('Google Speech-to-Text result:', wordTimings);
    return wordTimings;
  } catch (error) {
    console.error('Google Speech-to-Text error:', error.message, error.stack);
    const normalizedText = text ? text.replace(/\s+/g, ' ').trim() : '';
    return normalizedText
      ? normalizedText.split(/\s+/).map((word) => ({ word, start: 0, end: 0 }))
      : [];
  }
};

const generateWordTimingsBatch = async (subtitles) => {
  try {
    console.log('Starting batch processing for', subtitles.length, 'subtitles');

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

    // Process Speech-to-Text requests in parallel
    const startApi = Date.now();
    const resultsSettled = await Promise.allSettled(
      subtitles.map(async ({ subtitleId, text, languageCode }) => {
        const audioContent = audioMap[subtitleId];
        const normalizedText = text ? text.replace(/\s+/g, ' ').trim() : '';

        if (!audioContent) {
          console.warn(`No audio content for subtitle ${subtitleId}`);
          return {
            subtitleId,
            wordTimings: normalizedText
              ? normalizedText
                  .split(/\s+/)
                  .map((word) => ({ word, start: 0, end: 0 }))
              : [],
          };
        }

        try {
          const wordTimings = await generateWordTimings(
            `data:audio/wav;base64,${audioContent}`,
            normalizedText,
            languageCode,
          );
          return { subtitleId, wordTimings };
        } catch (error) {
          console.error(
            `Error processing subtitle ${subtitleId}:`,
            error.message,
          );
          return {
            subtitleId,
            wordTimings: normalizedText
              ? normalizedText
                  .split(/\s+/)
                  .map((word) => ({ word, start: 0, end: 0 }))
              : [],
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
                  .map((word) => ({ word, start: 0, end: 0 }))
              : [],
          },
    );
    console.log(`Batch Speech-to-Text took ${Date.now() - startApi}ms`);

    return results;
  } catch (error) {
    console.error('Batch processing error:', {
      message: error.message,
      stack: error.stack,
    });
    return subtitles.map(({ subtitleId, text }) => ({
      subtitleId,
      wordTimings: text
        ? text
            .replace(/\s+/g, ' ')
            .trim()
            .split(/\s+/)
            .map((word) => ({ word, start: 0, end: 0 }))
        : [],
    }));
  }
};

module.exports = {
  generateWordTimings,
  generateWordTimingsBatch,
};
