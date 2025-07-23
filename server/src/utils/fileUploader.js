const supabase = require('../services/supabase');
const { decode } = require('base64-arraybuffer');
const crypto = require('crypto');

// Upload file using standard upload
/**
 * @param {*} file The file from multer, aka in req.file
 * @param {*} fileType Either 'audio' or 'images'
 * @returns {String} The public url of the uploaded file
 */
async function uploadFile(file, fileType) {
  console.log('[UPLOAD] ☁️ Uploading file to cloud...');

  if (fileType !== 'audio' && fileType !== 'images')
    throw new Error('Error Uploading File: Invalid file type specified');

  let contentType;
  if (fileType === 'audio') {
    contentType = 'audio/wav';
  } else if (fileType === 'images') {
    contentType = 'image/jpg';
  }

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
  const { data: uploadedFile } = supabase.storage
    .from('uploads')
    .getPublicUrl(data.path);

  const publicUrl = uploadedFile.publicUrl;
  return { fileLink: publicUrl, fileName: uniqueName };
}

/**
 * @param {*} fileBuffer The generated buffer from the translation client
 * @returns {String} The public url of the uploaded file
 */
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
  const { data: audio } = supabase.storage
    .from('uploads')
    .getPublicUrl(data.path);

  const publicUrl = audio.publicUrl;
  return { fileLink: publicUrl, fileName: uniqueName };
}

// Delete files
async function deleteFile(folderName, fileName) {
  await supabase.storage.from('uploads').remove([`${folderName}/${fileName}`]);
  return;
}

module.exports = {
  uploadFile,
  saveAudioFile,
};
