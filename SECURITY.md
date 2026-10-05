# Security Architecture

## Threat Model
OneTime Secure is designed to protect sensitive credentials (passwords, tokens, API keys) transmitted over the internet from being intercepted or accessed by unauthorized parties, including the server administrators themselves.

### What is protected?
- The plaintext content of the secret is protected from the server, database, and any logs.
- The secret is protected from interception if the transport layer (HTTPS) is compromised, provided the URL was transmitted securely.
- Replay attacks are prevented via strict, atomic single-use consumption.

### What is NOT protected?
- We cannot guarantee the identity of the person who opens the URL. Anyone with the URL can open it.
- Once the secret is decrypted and displayed in the recipient's browser, we cannot prevent them from copying, saving, screenshotting, or photographing it.
- If the administrator's machine or the recipient's machine is compromised with malware (e.g., keyloggers, DOM scrapers), the secret can be stolen.

## Zero-Knowledge Encryption Model
1. **Client-Side Encryption:** When creating a secret, the user's browser generates a random 256-bit AES-GCM key and a random 96-bit Initialization Vector (IV).
2. **Payload:** The secret is encrypted in the browser. The IV and ciphertext are concatenated or sent as a single payload to the server.
3. **Storage:** The server stores this encrypted payload. It NEVER receives the encryption key.
4. **URL Fragment:** The encryption key is base64-encoded and appended to the secret link as a URL fragment (e.g., `https://.../s/<token>#<base64-key>`).
5. **Decryption:** Browsers do not send URL fragments (everything after `#`) to the server. When the recipient visits the URL, the client-side JavaScript extracts the key from the fragment, requests the encrypted payload from the server, and decrypts it locally.

## Token Security
- The raw token is generated using cryptographically secure random values (e.g., `crypto.getRandomValues`).
- The server stores the `SHA-256` hash of the token. The raw token is only present in the URL.
- This prevents token enumeration and ensures that a database leak does not expose active secret URLs.

## One-Time Consumption Model
- Atomicity is guaranteed by using a PostgreSQL transaction with `SELECT ... FOR UPDATE` or an atomic `DELETE ... RETURNING` query.
- When a secret is requested, the backend atomically deletes or marks the row as consumed.
- Concurrent requests (race conditions) are handled correctly: only the first transaction to acquire the lock will succeed; all others will find the secret already gone.

## Password Hashing
- Admin passwords are mathematically hashed using Argon2id.

## Logging Policy
- Passwords, encryption keys, raw tokens, and secret contents are NEVER logged.
- Only non-sensitive metadata (e.g., event type `secret_consumed`, timestamps, error codes) is logged.
