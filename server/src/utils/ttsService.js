// Import types
const AppError = require('../utils/AppError');

// Import translation tools
const { SpeechClient } = require('@google-cloud/speech');
const { Translate } = require('@google-cloud/translate').v2;
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');

// Import services
const logger = require('../utils/logger');
const fileUploader = require('../utils/fileUploader');

// Import models
const languageModel = require('../models/languageModel');

// Initialize Google Cloud clients
const speechClient = new SpeechClient();
const translateClient = new Translate();
let textToSpeechClient;

try {
  textToSpeechClient = new TextToSpeechClient();
  logger.debug('TextToSpeechClient initialized successfully');
} catch (error) {
  logger.error(
    `Failed to initialize TextToSpeechClient: ${JSON.stringify(error, null, 2)}`,
  );
  throw new AppError('Failed to initialize Text-to-Speech client', 500);
}

// Transcribe and translate audio
module.exports.transcribeAndTranslateAudio = async (file, languageCode) => {
  const supportedLanguages = await languageModel.getActiveLanguages();

  // Step 1: Transcribe audio
  const audio = {
    content: file.buffer.toString('base64'),
  };

  const request = {
    config: {
      languageCode,
    },
    audio,
  };

  logger.debug(
    `Sending recognition request with languageCode: ${languageCode}`,
  );

  const [response] = await speechClient.recognize(request);
  const transcription = response.results
    .map((result) => result.alternatives[0].transcript)
    .join('\n');

  if (!transcription) {
    throw new AppError('No transcription generated', 400);
  }

  logger.debug(`Transcription (${languageCode}): ${transcription}`);

  // Step 2: Include transcription in translations for the source language
  const translations = {
    [languageCode]: transcription, // Include transcription as translation for source language
  };

  // Step 3: Translate to other supported languages
  for (const targetLangCode of supportedLanguages) {
    if (targetLangCode !== languageCode) {
      logger.debug(`Translating to ${targetLangCode} (${targetLangCode})`);
      const [translatedText] = await translateClient.translate(
        transcription,
        targetLangCode,
      );
      translations[targetLangCode] = translatedText;
      logger.debug(
        `Translation to ${targetLangCode} [${targetLangCode}]: ${translatedText}`,
      );
    }
  }

  return { transcription, translations };
};

// Convert text to speech and save to disk
module.exports.textToSpeech = async (text, languageCode) => {
  const supportedLanguages = await languageModel.getActiveLanguages();
  // Validate language code
  if (!supportedLanguages.includes(languageCode)) {
    throw new AppError(
      `Unsupported language code: ${languageCode}. Supported: ${supportedLanguages.join(', ')}`,
      400,
    );
  }

  if (!textToSpeechClient) {
    logger.error('TextToSpeechClient is not initialized');
    throw new Error('TextToSpeechClient is not initialized');
  }

  // Create the text-to-speech request
  const request = {
    input: { text },
    voice: {
      languageCode,
      ssmlGender: 'NEUTRAL',
    },
    audioConfig: {
      audioEncoding: 'LINEAR16', // WAV format
      sampleRateHertz: 16000,
    },
  };

  logger.debug(`Generating speech for text in language: ${languageCode}`);
  let response;
  try {
    [response] = await textToSpeechClient.synthesizeSpeech(request);
  } catch (error) {
    logger.error(
      `Error in synthesizeSpeech: ${JSON.stringify(error, null, 2)}`,
    );
    throw new Error(`Failed to synthesize speech: ${error.message}`);
  }

  if (!response || !response.audioContent) {
    logger.error('No audio content returned from synthesizeSpeech');
    throw new Error('No audio content generated');
  }

  const { fileLink, fileName } = await fileUploader.saveAudioFile(
    response.audioContent,
  );
  console.log('Successfully Generated Audio');
  return { fileLink, fileName };
};
