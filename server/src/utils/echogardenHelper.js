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
const speech = require('@google-cloud/speech').v1;
const axios = require('axios'); // Add axios to dependencies if not already present

const client = new speech.SpeechClient();

module.exports.generateWordTimings = async (audioUrl, text, languageCode) => {
  try {
    console.log('Calling Google Speech-to-Text with:', {
      audioUrl,
      text,
      languageCode,
    });

    // Download audio from Supabase
    const audioResponse = await axios.get(audioUrl, {
      responseType: 'arraybuffer',
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
      .flatMap((result) => result.alternatives[0].words || [])
      .map((wordInfo) => ({
        word: wordInfo.word,
        start:
          parseFloat(wordInfo.startTime.seconds || 0) +
          (wordInfo.startTime.nanos || 0) / 1e9,
        end:
          parseFloat(wordInfo.endTime.seconds || 0) +
          (wordInfo.endTime.nanos || 0) / 1e9,
      }));

    // console.log('Google Speech-to-Text result:', wordTimings);
    return wordTimings;
  } catch (error) {
    console.error('Google Speech-to-Text error:', error.message, error.stack);
    return [];
  }
};

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
