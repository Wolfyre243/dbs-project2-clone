require('dotenv').config();
const fs = require('fs');
const util = require('util');
const crypto = require('crypto');
const { Translate } = require('@google-cloud/translate').v2;
const textToSpeech = require('@google-cloud/text-to-speech');
const speech = require('@google-cloud/speech');

// Debug credentials path
console.log(
  'Full path:',
  fs.realpathSync(process.env.GOOGLE_APPLICATION_CREDENTIALS),
);

// Create API clients
const translateClient = new Translate();
const ttsClient = new textToSpeech.TextToSpeechClient();
const speechClient = new speech.SpeechClient();

// Define supported languages and voices
const LANGUAGES = {
  es: 'es-ES', // Spanish
  fr: 'fr-FR', // French
  de: 'de-DE', // German
  ja: 'ja-JP', // Japanese
  zh: 'cmn-CN', // Chinese (Mandarin)
  ml: 'ml-IN', // Malayalam
  ta: 'ta-IN', // Tamil
};

// Transcribe audio file to text for a specific language
async function transcribeAudio(audioFilePath, languageCode) {
  const file = fs.readFileSync(audioFilePath);
  const audio = {
    content: file.toString('base64'),
  };
  const config = {
    encoding: 'LINEAR16',
    languageCode: languageCode, // Dynamic language code
  };
  const request = {
    audio: audio,
    config: config,
  };
  try {
    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      .map((result) => result.alternatives[0].transcript)
      .join('\n');
    if (transcription) {
      console.log(`📝 Transcription (${languageCode}): ${transcription}`);
      return transcription;
    }
    return null; // Return null if no transcription
  } catch (error) {
    console.error(`❌ Error transcribing audio for ${languageCode}: `, error);
    return null;
  }
}

// Generate audio for a specific transcription and language
async function generateAudio(transcription, langCode, voiceLang) {
  if (!transcription) return;
  const [translatedText] = await translateClient.translate(
    transcription,
    langCode,
  );
  console.log(`✅ [${langCode}] ${translatedText}`);
  const ttsRequest = {
    input: { text: translatedText },
    voice: {
      languageCode: voiceLang,
      ssmlGender: 'MALE',
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 0.95,
      pitch: -1.5,
      volumeGainDb: 2.0,
    },
  };
  const [response] = await ttsClient.synthesizeSpeech(ttsRequest);
  const randBuf = crypto.randomBytes(8).toString('hex');
  const fileName = `${Date.now()}-${randBuf}-audio-${langCode}.mp3`;
  const filePath = `uploads/${fileName}`;
  await util.promisify(fs.writeFile)(filePath, response.audioContent, 'binary');
  console.log(`🎧 Saved: ${filePath}`);
}

// Main function to process audio for all languages
async function processAudioToTranslation(audioFilePath) {
  try {
    if (!fs.existsSync('output')) fs.mkdirSync('output');
    for (const [langCode, voiceLang] of Object.entries(LANGUAGES)) {
      const transcription = await transcribeAudio(audioFilePath, voiceLang);
      await generateAudio(transcription, langCode, voiceLang);
    }
  } catch (error) {
    console.error('❌ Error in processing:', error);
  }
}

// Run the script
const audioFilePath = 'uploads/sample.wav';
processAudioToTranslation(audioFilePath);
