import * as CryptoJS from "crypto-js";

function getSecretKey(): string {
  const secretKey = process.env.SECRET_KEY;
  if (!secretKey) {
    throw new Error("SECRET_KEY is not set in the environment variables.");
  }
  return secretKey;
}

export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, getSecretKey()).toString();
}

export function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, getSecretKey());
  return bytes.toString(CryptoJS.enc.Utf8);
}
