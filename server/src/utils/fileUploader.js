const supabase = require('../services/supabase');
const { decode } = require('base64-arraybuffer');
const crypto = require('crypto');

// Upload file using standard upload
async function uploadFile(file, fileType) {
  if (fileType !== 'audio' || fileType !== 'images')
    throw new Error('Error Uploading File: Invalid file type specified');

  const contentType = file.mimetype;

  // Decode file buffer
  const fileBase64 = decode(file.buffer.toString('base64'));

  const buf = crypto.randomBytes(4);
  const uniqueName =
    Date.now() + '-' + buf.toString('hex') + '-' + file.originalname;

  // Upload the file to supabase
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(`${fileType}/${uniqueName}`, fileBase64, {
      contentType,
    });

  if (error) {
    throw error;
  }

  // Get public url of the uploaded file
  const { data: uploadedFile } = await supabase.storage
    .from('uploads')
    .getPublicUrl(data.path);

  const publicUrl = uploadedFile.publicUrl;
  return publicUrl;
}

// Save generated audio file into supabase
async function saveAudioFile(fileBuffer) {
  // Decode file buffer
  const fileBase64 = decode(fileBuffer.toString('base64'));

  const buf = crypto.randomBytes(4);
  const uniqueName =
    Date.now() + '-' + buf.toString('hex') + '-' + 'output.wav';

  // Upload the file to supabase
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(`audio/${uniqueName}`, fileBase64, {
      contentType: 'audio/wav',
    });

  if (error) {
    throw error;
  }

  // Get public url of the uploaded file
  const { data: audio } = await supabase.storage
    .from('uploads')
    .getPublicUrl(data.path);

  const publicUrl = audio.publicUrl;
  return publicUrl;
}

module.exports = {
  uploadFile,
  saveAudioFile,
};
