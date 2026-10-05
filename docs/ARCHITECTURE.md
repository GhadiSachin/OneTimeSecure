# OneTime Secure: Architecture & Workflow

OneTime Secure is a self-hosted, open-source alternative to one-time secret sharing services. It utilizes a **Zero-Knowledge** architecture combined with **Atomic PostgreSQL operations** to ensure absolute security and prevent race conditions.

## 1. Zero-Knowledge Encryption Flow

The core security principle of OneTime Secure is that **the server must never be able to read the secret**. 

1. **User Input:** The administrator enters a sensitive text (e.g., password, API key) in the browser.
2. **Key Generation:** The browser's Web Crypto API generates a secure, random 256-bit AES-GCM key.
3. **Local Encryption:** The plaintext secret is encrypted locally inside the browser using the generated key and a random 96-bit Initialization Vector (IV).
4. **Transmission:** Only the **Encrypted Ciphertext** and the **IV** are sent to the backend server. The backend assigns a unique `token` (a hashed identifier) to this payload and stores it in the database.
5. **URL Construction:** The browser constructs a sharing URL. The decryption key is appended to the URL as a **URL Fragment** (e.g., `http://domain.com/s/TOKEN#KEY`). *URL fragments are never sent to servers by web browsers.*

## 2. Atomic Consumption Flow

When a recipient opens the link, the system must guarantee the secret can only be read exactly once, even if multiple requests arrive simultaneously (e.g., from network scanners or malicious actors).

1. **Link Clicked:** The recipient navigates to the URL. The React frontend extracts the `token` from the URL path and the `KEY` from the URL fragment.
2. **Consumption Request:** The frontend sends a `POST /api/secrets/:token/consume` request to the backend.
3. **Atomic Database Lock:** The backend executes an atomic PostgreSQL query:
   \`\`\`sql
   UPDATE secrets 
   SET is_consumed = TRUE, consumed_at = NOW() 
   WHERE token = $1 AND is_consumed = FALSE 
   RETURNING encrypted_payload;
   \`\`\`
   This guarantees that even if 100 requests arrive at the exact same millisecond, the database row is locked and updated atomically. Only the very first request receives the payload; all others receive a 404/Gone error.
4. **Local Decryption:** The server returns the encrypted payload to the browser. The frontend uses the `KEY` from the URL fragment to decrypt the payload locally.
5. **Display & Destroy:** The plaintext is displayed to the user. Refreshing the page will fail because the backend has already marked the secret as consumed.
