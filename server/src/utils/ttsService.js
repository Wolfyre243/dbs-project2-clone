const fs = require('fs').promises;
const path = require('path');
const { SpeechClient } = require('@google-cloud/speech');
const { Translate } = require('@google-cloud/translate').v2;
const { TextToSpeechClient } = require('@google-cloud/text-to-speech');
const crypto = require('crypto');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');
const languageModel = require('../models/languageModel');
// logger.info(`Credentials path: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);

// Initialize Google Cloud clients
const speechClient = new SpeechClient();
const translateClient = new Translate();
let textToSpeechClient;

try {
  textToSpeechClient = new TextToSpeechClient();
  logger.info('TextToSpeechClient initialized successfully');
} catch (error) {
  logger.error(
    `Failed to initialize TextToSpeechClient: ${JSON.stringify(error, null, 2)}`,
  );
  throw new AppError('Failed to initialize Text-to-Speech client', 500);
}

// Transcribe and translate audio
module.exports.transcribeAndTranslateAudio = async (
  audioFilePath,
  languageCode,
) => {
  const supportedLanguages = await languageModel.getActiveLanguages();
  try {
    // Validate language code
    if (!supportedLanguages.includes(languageCode)) {
      throw new AppError(
        `Unsupported language code: ${languageCode}. Supported: ${supportedLanguages.join(', ')}`,
        400,
      );
    }

    logger.info(`Attempting to read file: ${audioFilePath}`);
    const file = await fs.readFile(audioFilePath);
    logger.info(`File read successfully, size: ${file.length} bytes`);

    // Step 1: Transcribe audio
    const audio = {
      content: file.toString('base64'),
    };

    const apiLanguageCode = languageCode;
    const request = {
      config: {
        languageCode: apiLanguageCode,
      },
      audio,
    };

    logger.info(
      `Sending recognition request with languageCode: ${apiLanguageCode}`,
    );
    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      .map((result) => result.alternatives[0].transcript)
      .join('\n');

    if (!transcription) {
      throw new AppError('No transcription generated', 400);
    }

    logger.info(`Transcription (${languageCode}): ${transcription}`);

    // Step 2: Include transcription in translations for the source language
    const translations = {
      [languageCode]: transcription, // Include transcription as translation for source language
    };

    // Step 3: Translate to other supported languages
    for (const targetLangCode of supportedLanguages) {
      if (targetLangCode !== languageCode) {
        const apiTargetLangCode = targetLangCode;
        logger.info(`Translating to ${targetLangCode} (${apiTargetLangCode})`);
        const [translatedText] = await translateClient.translate(
          transcription,
          apiTargetLangCode,
        );
        translations[targetLangCode] = translatedText;
        logger.info(
          `Translation to ${targetLangCode} [${targetLangCode}]: ${translatedText}`,
        );
      }
    }

    return { transcription, translations };
  } catch (error) {
    logger.error(
      `Error processing audio for ${languageCode}: ${JSON.stringify(error, null, 2)}`,
    );
    throw new AppError(`Failed to process audio: ${error.message}`, 500);
  }
};

// Convert text to speech and save to disk
module.exports.textToSpeech = async (text, languageCode, destinationPath) => {
  const supportedLanguages = await languageModel.getActiveLanguages();
  try {
    // Validate language code
    if (!supportedLanguages.includes(languageCode)) {
      throw new AppError(
        `Unsupported language code: ${languageCode}. Supported: ${supportedLanguages.join(', ')}`,
        400,
      );
    }

    if (!textToSpeechClient) {
      logger.error('TextToSpeechClient is not initialized');
      throw new AppError('TextToSpeechClient is not initialized', 500);
    }

    const apiLanguageCode = languageCode;

    // Create the text-to-speech request
    const request = {
      input: { text },
      voice: {
        languageCode: apiLanguageCode,
        ssmlGender: 'NEUTRAL',
      },
      audioConfig: {
        audioEncoding: 'LINEAR16', // WAV format
        sampleRateHertz: 16000,
      },
    };

    logger.info(`Generating speech for text in language: ${apiLanguageCode}`);
    let response;
    try {
      [response] = await textToSpeechClient.synthesizeSpeech(request);
    } catch (error) {
      logger.error(
        `Error in synthesizeSpeech: ${JSON.stringify(error, null, 2)}`,
      );
      throw new AppError(`Failed to synthesize speech: ${error.message}`, 500);
    }

    if (!response || !response.audioContent) {
      logger.error('No audio content returned from synthesizeSpeech');
      throw new AppError('No audio content generated', 500);
    }

    // Generate a unique filename
    const buf = crypto.randomBytes(4);
    const uniqueName = `${Date.now()}-${buf.toString('hex')}-output.wav`;

    // Define the full file path
    const filePath = path.join(destinationPath, uniqueName);

    // Save the audio content to disk
    await fs.writeFile(filePath, response.audioContent, 'binary');
    logger.info(`Audio file saved successfully: ${filePath}`);

    return { fileName: uniqueName, filePath };
  } catch (error) {
    logger.error(
      `Error generating speech for ${languageCode}: ${JSON.stringify(error, null, 2)}`,
    );
    throw new AppError(`Failed to generate speech: ${error.message}`, 500);
  }
};
