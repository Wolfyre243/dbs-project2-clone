const fs = require('fs').promises;
const { SpeechClient } = require('@google-cloud/speech');
const { Translate } = require('@google-cloud/translate').v2;
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');
logger.info(`Credentials path: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
// Initialize Google Cloud clients
const speechClient = new SpeechClient();
const translateClient = new Translate();

// Define supported languages for transcription and translation
// Define supported languages for transcription and translation
const supportedLanguages = {
  'eng': 'English',
  'spa': 'Spanish',
  'fre': 'French',
  'ger': 'German',
  'zho': 'Chinese (Mandarin)',
  'msa': 'Malay',
  'tam': 'Tamil',
};

// Map internal codes to Google Cloud API codes
const apiLanguageCodeMap = {
  'eng': 'en-GB',
  'spa': 'es-ES',
  'fre': 'fr-FR',
  'ger': 'de-DE',
  'zho': 'cmn-CN',
  'msa': 'ms-MY',
  'tam': 'ta-IN',
};


module.exports.transcribeAndTranslateAudio = async (audioFilePath, languageCode) => {
  try {
    // Validate language code
    if (!Object.keys(supportedLanguages).includes(languageCode)) {
      throw new AppError(`Unsupported language code: ${languageCode}. Supported: ${Object.keys(supportedLanguages).join(', ')}`, 400);
    }

    logger.info(`Attempting to read file: ${audioFilePath}`);
    const file = await fs.readFile(audioFilePath);
    logger.info(`File read successfully, size: ${file.length} bytes`);

    // Step 1: Transcribe audio
    const audio = {
      content: file.toString('base64'),
    };

    const apiLanguageCode = apiLanguageCodeMap[languageCode] || languageCode;
    const request = {
      config: {
       // encoding: 'LINEAR16', // Required for WAV files
        //sampleRateHertz: 16000, // Common sample rate; adjust if needed
        languageCode: apiLanguageCode,
      },
      audio,
    };

    logger.info(`Sending recognition request with languageCode: ${apiLanguageCode}`);
    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      .map((result) => result.alternatives[0].transcript)
      .join('\n');

    if (!transcription) {
      throw new AppError('No transcription generated', 500);
    }

    logger.info(`Transcription (${languageCode}): ${transcription}`);

    // Step 2: Translate to all supported languages
    const translations = {};
    for (const [targetLangCode, targetLangName] of Object.entries(supportedLanguages)) {
      if (targetLangCode !== languageCode) { // Skip translating to source language
        const apiTargetLangCode = apiLanguageCodeMap[targetLangCode] || targetLangCode;
        logger.info(`Translating to ${targetLangName} (${apiTargetLangCode})`);
        const [translatedText] = await translateClient.translate(transcription, apiTargetLangCode);
        translations[targetLangCode] = translatedText;
        logger.info(`Translation to ${targetLangName} [${targetLangCode}]: ${translatedText}`);
      }
    }

    return { transcription, translations };
  } catch (error) {
    logger.error(`Error processing audio for ${languageCode}: ${JSON.stringify(error, null, 2)}`);
    throw new AppError(`Failed to process audio: ${error.message}`, 500);
  }
};