const fs = require('fs').promises;
const { SpeechClient } = require('@google-cloud/speech').v2;
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');
// Debug line to verify credentials path
//console.log('Full path:', fs.realpathSync(process.env.GOOGLE_APPLICATION_CREDENTIALS));

// Initialize Google Cloud Speech-to-Text client
const speechClient = new SpeechClient();

module.exports.transcribeAudio = async (audioFilePath, languageCode) => {
  try {
    // Debug: Check file existence and path
    logger.info(`Attempting to read file: ${audioFilePath}`);
    const file = await fs.readFile(audioFilePath);
    logger.info(`File read successfully, size: ${file.length} bytes`);

    const audio = {
      content: file.toString('base64'),
    };
    logger.info(`Base64 content length: ${audio.content.length}`); // Debug base64 data

    const config = {
      recognitionConfig: {
        encoding: 'LINEAR16',
        languageCode,
        sampleRateHertz: 16000, // Default sample rate; adjust based on file
        audioChannelCount: 1, // Mono audio; adjust if stereo
      },
    };
    const request = {
      ...config,
      audio,
    };

    logger.info(
      `Sending recognition request with config: ${JSON.stringify(config)}`,
    );
    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      .map((result) => result.alternatives[0].transcript)
      .join('\n');

    if (!transcription) {
      throw new AppError('No transcription generated', 500);
    }

    logger.info(`Transcription (${languageCode}): ${transcription}`);
    return transcription;
  } catch (error) {
    logger.error(
      `Error transcribing audio for ${languageCode}: ${error.message}`,
    );
    throw new AppError(`Failed to transcribe audio: ${error.message}`, 500);
  }
};
