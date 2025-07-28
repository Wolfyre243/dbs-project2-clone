// utils/echogardenHelper.js
/* const { alignWordsFromURL } = require('echogarden');

module.exports.generateWordTimings = async (audioUrl, text) => {
  try {
    const words = await alignWordsFromURL(audioUrl, text);
    return words; // already in [{ word, start, end }, ...] format
  } catch (error) {
    console.error('EchoGarden error:', error);
    return []; // fail silently, you can log or throw if preferred
  }
};

 */

// utils/echogardenHelper.js
// utils/echogardenHelper.js
/* const { align } = require('echogarden');

module.exports.generateWordTimings = async (audioUrl, text, languageCode) => {
  try {
    console.log('Calling align with:', { audioUrl, text, languageCode });

    // Map language codes to echogarden format
    const langMap = {
      'en-GB': 'en-GB',
      'cmn-CN': 'zh-CN', // Mandarin Chinese
    };
    const mappedLanguage = langMap[languageCode] || 'en-US'; // Fallback to en-US

    const alignmentOptions = {
      language: mappedLanguage,
      returnWords: true, // Ensure word-level timestamps
    };

    const result = await align(audioUrl, text, alignmentOptions);

    console.log('align result:', result);

    // Ensure result is in [{ word, start, end }, ...] format
    const wordTimings = result.words?.map((word) => ({
      word: word.text,
      start: word.startTime,
      end: word.endTime,
    })) || [];

    return wordTimings;
  } catch (error) {
    console.error('EchoGarden error:', error.message, error.stack);
    return [];
  }
}; */

// utils/echogardenHelper.js
/* const { align } = require('echogarden');

module.exports.generateWordTimings = async (audioUrl, text, languageCode) => {
  try {
    console.log('Calling align with:', { audioUrl, text, languageCode });

    // Map language codes to echogarden format
    const langMap = {
      'en-GB': 'en-GB',
      'cmn-CN': 'zh-CN', // Mandarin Chinese
    };
    const mappedLanguage = langMap[languageCode] || 'en-US'; // Fallback to en-US

    const alignmentOptions = {
      language: mappedLanguage,
      returnWords: true, // Ensure word-level timestamps
    };

    const result = await align(audioUrl, text, alignmentOptions);

    console.log('align result:', result);

    // Ensure result is in [{ word, start, end }, ...] format
    const wordTimings = result.words?.map((word) => ({
      word: word.text,
      start: word.startTime,
      end: word.endTime,
    })) || [];

    return wordTimings;
  } catch (error) {
    console.error('EchoGarden error:', error.message, error.stack);
    return [];
  }
}; */

// utils/echogardenHelper.js
const speech = require('@google-cloud/speech');
const axios = require('axios'); // Add axios to dependencies if not already present
const levenshtein = require('fast-levenshtein');

const client = new speech.SpeechClient();

// const { align } = require('echogarden');
// const generateWordTimings = async (audioUrl, text, languageCode) => {
//   try {
//     const mappedLanguage = languageCode === 'cmn-CN' ? 'zh-CN' : languageCode || 'en-US';
//     const result = await align(audioUrl, text, { language: mappedLanguage, returnWords: true });
//     return result.words?.map((word) => ({
//       word: word.text || word.word,
//       start: word.startTime || word.start,
//       end: word.endTime || word.end,
//     })) || [];
//   } catch (error) {
//     console.error('EchoGarden error:', error.message, error.stack);
//     return text.replace(/\s+/g, ' ').trim().split(/\s+/).map((word) => ({ word, start: 0, end: 0 }));
//   }
// };

// OLD CODE
const generateWordTimings = async (audioUrl, text, languageCode) => {
  try {
    // console.log('Calling Google Speech-to-Text with:', {
    //   audioUrl,
    //   text,
    //   languageCode,
    // });
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

// function alignTimings(originalWords, apiWordTimings, languageCode) {
//   if (!apiWordTimings.length || !originalWords.length) {
//     return originalWords.map((word, index) => ({
//       word,
//       start: index * 0.2, // Approximate 0.2s per word
//       end: (index + 1) * 0.2,
//     }));
//   }

//   const aligned = [];
//   let apiIndex = 0;
//   let lastEnd = 0;

//   for (let i = 0; i < originalWords.length; i++) {
//     const origWord = originalWords[i];

//     if (apiIndex < apiWordTimings.length) {
//       const apiWord = apiWordTimings[apiIndex].word.toLowerCase();
//       const distance = levenshtein.get(origWord.toLowerCase(), apiWord);

//       if (
//         distance <= 2 ||
//         origWord.toLowerCase().includes(apiWord) ||
//         apiWord.includes(origWord.toLowerCase())
//       ) {
//         let start = Math.max(apiWordTimings[apiIndex].start, lastEnd);
//         let end = Math.max(apiWordTimings[apiIndex].end, start + 0.1); // Ensure min duration
//         aligned.push({ word: origWord, start, end });
//         lastEnd = end;
//         apiIndex++;
//       } else {
//         // Estimate timing for unmatched word
//         let start = lastEnd;
//         let end = start + 0.2; // Default duration
//         if (apiIndex + 1 < apiWordTimings.length) {
//           end = Math.min(end, apiWordTimings[apiIndex + 1].start);
//         }
//         aligned.push({ word: origWord, start, end });
//         lastEnd = end;
//       }
//     } else {
//       // No more API timings
//       let start = lastEnd;
//       let end = start + 0.2;
//       aligned.push({ word: origWord, start, end });
//       lastEnd = end;
//     }
//   }

//   // Log mismatches
//   const alignedText = aligned.map((w) => w.word).join(' ');
//   const apiText = apiWordTimings.map((w) => w.word).join(' ');
//   if (alignedText.toLowerCase() !== apiText.toLowerCase()) {
//     console.warn('Text mismatch:', {
//       original: alignedText,
//       api: apiText,
//     });
//   }

//   return aligned;
// }

// utils/echogardenHelper.js
/* const { align } = require('echogarden');

module.exports.generateWordTimings = async (audioUrl, text, languageCode) => {
  try {
    console.log('Calling align with:', { audioUrl, text, languageCode });

    const mappedLanguage = languageCode === 'cmn-CN' ? 'zh-CN' : languageCode || 'en-US';

    const alignmentOptions = {
      language: mappedLanguage,
      returnWords: true,
    };

    const result = await align(audioUrl, text, alignmentOptions);
    console.log('align result:', result);

    const wordTimings = result.words?.map((word) => ({
      word: word.text || word.word,
      start: word.startTime || word.start,
      end: word.endTime || word.end,
    })) || [];

    return wordTimings;
  } catch (error) {
    console.error('EchoGarden error:', error.message, error.stack);
    return [];
  }
}; */

module.exports = {
  generateWordTimings,
  generateWordTimingsBatch,
};
