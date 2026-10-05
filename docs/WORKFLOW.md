# OneTime Secure: System Workflow

This document visually maps out the step-by-step workflow for the two primary operations in OneTime Secure: **Creating a Secret** and **Consuming a Secret**.

## 1. Secret Creation Workflow

This flow describes how a secret is securely encrypted in the browser before any data reaches the server.

```mermaid
sequenceDiagram
    participant U as User (Sender)
    participant B as Browser (Web Crypto API)
    participant S as Server (Fastify API)
    participant DB as PostgreSQL Database

    U->>B: Types plaintext secret & clicks "Generate"
    Note over B: Generates secure AES-256-GCM key
    Note over B: Encrypts plaintext using key & IV
    B->>S: POST /api/secrets<br/>(Encrypted Payload + IV)
    Note over S: Generates random Token
    S->>DB: INSERT INTO secrets (token, encrypted_payload)
    DB-->>S: Success
    S-->>B: Returns { token }
    Note over B: Constructs URL:<br/>domain.com/s/TOKEN#KEY
    B-->>U: Displays secure URL to User
```

## 2. Secret Consumption Workflow

This flow demonstrates the atomic retrieval process and how the secret is decrypted locally, maintaining the zero-knowledge guarantee.

```mermaid
sequenceDiagram
    participant R as User (Recipient)
    participant B as Browser (Web Crypto API)
    participant S as Server (Fastify API)
    participant DB as PostgreSQL Database

    R->>B: Opens URL (domain.com/s/TOKEN#KEY)
    Note over B: Extracts TOKEN from URL path
    Note over B: Extracts KEY from URL fragment (#)
    R->>B: Clicks "Decrypt & View Secret"
    B->>S: POST /api/public/secrets/TOKEN/consume
    Note over S: Initiates Database Request
    S->>DB: UPDATE secrets SET is_consumed = TRUE<br/>WHERE token = TOKEN AND is_consumed = FALSE<br/>RETURNING encrypted_payload
    
    alt Secret Exists and NOT Consumed
        DB-->>S: Returns encrypted_payload (Atomic Success)
        S-->>B: Returns { encrypted_payload }
        Note over B: Decrypts payload using local KEY
        B-->>R: Displays plaintext secret
    else Secret Missing or ALREADY Consumed
        DB-->>S: Returns 0 rows (Atomic Failure)
        S-->>B: Returns 404 Not Found / Error
        B-->>R: Displays "Secret Unavailable" Error
    end
```

## Key Workflow Concepts

1. **Zero-Knowledge Encryption:** The `KEY` is never transmitted to the `Server`. It travels in the URL fragment (`#KEY`), which modern browsers strictly keep local and do not include in HTTP network requests.
2. **Atomic Row Locks:** The database uses a single `UPDATE ... RETURNING` query. This ensures that even if an attacker sends 100 simultaneous network requests attempting to read the secret, PostgreSQL will lock the row, process the first request, set `is_consumed = TRUE`, and instantly reject the remaining 99 requests.
