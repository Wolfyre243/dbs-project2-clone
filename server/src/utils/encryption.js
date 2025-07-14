const crypto = require("crypto");

const encryptionKey = process.env.ENCRYPTION_KEY;
const salt = process.env.ENCRYPTION_SALT;
const buffer_size = parseInt(process.env.ENCRYPTION_BUFFERSIZE);

// Note: AES-256-CBC requires a 32-byte key and a 16-byte IV
const algorithm = process.env.ENCRYPTION_ALGORITHM;
const key = crypto.scryptSync(encryptionKey, salt, 32); // Derive a 32-byte key
const iv = Buffer.alloc(buffer_size, 0); // Initialization vector (could also be random)

// Encrypt data
const encryptData = (data) => {
  if (!data) return null;

  // Create a cipher
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  // Update cipher obj with data to encrypt
  let encrypted = cipher.update(data, "utf8", "hex");
  // Finalize encryption
  encrypted += cipher.final("hex");
  return encrypted;
};

// Decrypt data
const decryptData = (encryptedData) => {
  if (!encryptedData) return null;

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

module.exports = {
  encryptData,
  decryptData,
};
