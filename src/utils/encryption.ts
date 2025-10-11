import CryptoJS from 'crypto-js';

// Use a secret key from env, but for demo, hardcode or use a derived key.
// In production, use a strong key from env.
const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-secret-key-change-in-prod';

export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
}

export function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export function hash(text: string): string {
  return CryptoJS.SHA256(text).toString();
}
