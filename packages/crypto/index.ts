/**
 * Zero-Knowledge Crypto Module for OneTime Secure
 */

/**
 * Generates a random 256-bit AES-GCM encryption key.
 */
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true, // extractable so we can put it in the URL
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts a plaintext string.
 * Returns the base64-encoded IV + ciphertext.
 */
export async function encryptSecret(key: CryptoKey, plaintext: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  // Generate a random 96-bit IV
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    data
  );

  // Concatenate IV and ciphertext
  const ciphertext = new Uint8Array(ciphertextBuffer);
  const payload = new Uint8Array(iv.length + ciphertext.length);
  payload.set(iv, 0);
  payload.set(ciphertext, iv.length);

  return arrayBufferToBase64(payload.buffer);
}

/**
 * Decrypts a payload string (base64 IV + ciphertext).
 */
export async function decryptSecret(key: CryptoKey, payloadBase64: string): Promise<string> {
  const payloadBuffer = base64ToArrayBuffer(payloadBase64);
  const payload = new Uint8Array(payloadBuffer);

  // Extract the 96-bit IV
  const iv = payload.slice(0, 12);
  const ciphertext = payload.slice(12);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    ciphertext
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

/**
 * Exports the CryptoKey to a base64 string for the URL fragment.
 */
export async function exportKeyToUrlFragment(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey("raw", key);
  // Using a URL-safe base64 encoding
  return arrayBufferToBase64(exported).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Imports the CryptoKey from the URL fragment base64 string.
 */
export async function importKeyFromUrlFragment(keyBase64Safe: string): Promise<CryptoKey> {
  // Restore standard base64 characters
  let keyBase64 = keyBase64Safe.replace(/-/g, '+').replace(/_/g, '/');
  while (keyBase64.length % 4) {
    keyBase64 += '=';
  }
  
  const keyBuffer = base64ToArrayBuffer(keyBase64);
  return await window.crypto.subtle.importKey(
    "raw",
    keyBuffer,
    "AES-GCM",
    true,
    ["encrypt", "decrypt"]
  );
}

// Helper: ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper: Base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}
