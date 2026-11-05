import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // Standard 96-bit IV for GCM
const AUTH_TAG_LENGTH = 16; // Standard 128-bit Auth Tag

/**
 * Derives a 32-byte key buffer from environment variables or fallbacks
 */
function getEncryptionKey(): Buffer {
  const secret =
    process.env.ENCRYPTION_MASTER_KEY ||
    process.env.DATABASE_ENCRYPTION_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "securesite-studio-master-encryption-key-fallback-32b";

  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns base64 encoded string containing: iv + authTag + encryptedData
 */
export function encryptCredential(plaintext: string): string {
  if (!plaintext) return "";

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Combine IV (12 bytes) + AuthTag (16 bytes) + EncryptedData into a single base64 payload
  const combined = Buffer.concat([iv, authTag, encrypted]);
  return combined.toString("base64");
}

/**
 * Decrypts a base64 encoded payload using AES-256-GCM.
 * Throws an error if payload is tampered with or key is invalid.
 */
export function decryptCredential(encryptedBase64: string): string {
  if (!encryptedBase64) return "";

  const key = getEncryptionKey();
  const buffer = Buffer.from(encryptedBase64, "base64");

  if (buffer.length < IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error("Invalid encrypted payload: buffer too short");
  }

  const iv = buffer.subarray(0, IV_LENGTH);
  const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encryptedText = buffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString("utf8");
}

/**
 * Masks an API key for safe display in the frontend UI.
 * e.g., "sk-proj-1234567890abcdef" -> "sk-proj-••••••••••••cdef"
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 8) return "••••••••";

  const prefix = apiKey.startsWith("sk-")
    ? apiKey.slice(0, 7)
    : apiKey.startsWith("AIza")
    ? apiKey.slice(0, 6)
    : apiKey.slice(0, 4);

  const suffix = apiKey.slice(-4);
  return `${prefix}••••••••${suffix}`;
}

