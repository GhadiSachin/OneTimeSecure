# Product Documentation: OneTime Secure

## 1. Cover Page
- **Application Name:** OneTime Secure
- **Document Title:** Comprehensive Product Documentation
- **Version:** 1.0.0
- **Author:** Development Team
- **Date:** October 5, 2026
- **Document Status:** Final Draft

---

## 2. Document Control
| Document Version | Date | Author | Reviewer | Approver | Status | Change Summary |
|---|---|---|---|---|---|---|
| 1.0.0 | Oct 5, 2026 | Dev Team | TBD | TBD | Draft | Initial creation of the documentation based on the MVP release. |

---

## 3. Table of Contents
1. Cover Page
2. Document Control
3. Table of Contents
4. Executive Summary
5. Product Overview
6. Target Users and Personas
7. User Journey
8. Application Screens
9. Functional Requirements
10. User Stories
11. Business Rules
12. Content and UX Guidelines
13. Technical Overview
14. System Architecture
15. API Documentation
16. Data and Database Documentation
17. Security
18. QA and Testing
19. Operations and Support
20. Deployment
21. Known Issues and Limitations
22. Future Enhancements
23. Release Notes
24. FAQ
25. Glossary
26. Appendix

---

## 4. Executive Summary
**What is this application?**  
OneTime Secure is a self-hosted, web-based platform that allows users to securely share sensitive information (such as passwords, API keys, or confidential notes) using single-use, self-destructing links.

**Why was it created?**  
Sharing passwords over email, Slack, or SMS is highly insecure. These communication channels keep permanent logs of the text. OneTime Secure was created to solve this problem by ensuring sensitive data exists only temporarily and can only be viewed once.

**What problem does it solve?**  
It mitigates the risk of sensitive credential exposure by utilizing zero-knowledge encryption and atomic deletion. Even if the transmission channel (e.g., Slack) is compromised later, the shared link will be completely useless since the data has already self-destructed.

**Who benefits from it?**  
IT administrators, software developers, DevOps teams, and non-technical business personnel who need a secure, compliant way to exchange sensitive information.

**What is the expected value?**  
Reduced risk of data breaches, simplified compliance with security policies, and an easy-to-use platform that requires no specialized technical knowledge for end users.

---

## 5. Product Overview
- **Product Vision:** To become the standard self-hosted secure messaging tool for modern engineering and operations teams.
- **Product Purpose:** Provide an end-to-end encrypted, zero-knowledge platform for sharing single-use credentials.
- **Business Problem:** Credential sprawl and insecure sharing methods (Slack/Email).
- **Proposed Solution:** A web dashboard that encrypts data in the browser, stores an encrypted blob, and destroys it atomically upon the first viewing attempt.
- **Key Capabilities:** Local AES-256-GCM encryption, PostgreSQL atomic locking, one-time link generation.
- **Benefits:** Assured confidentiality, ease of use, self-hosted data ownership.
- **Scope:** In-browser encryption, API for storage and atomic retrieval, web UI.
- **Out of Scope:** Multi-recipient sharing, permanent storage, file attachments (currently TBD).
- **Assumptions:** Users have access to modern browsers supporting the Web Crypto API.
- **Dependencies:** Docker for deployment, PostgreSQL, Redis.
- **Constraints:** Links cannot be recovered once consumed.

---

## 6. Target Users and Personas

### 1. End User (Sender)
- **Role:** An employee needing to send a credential.
- **Goals:** Generate a secure link quickly without configuring encryption tools.
- **Responsibilities:** Entering the correct sensitive data and sending the link securely to the correct person.
- **How they interact:** Uses the "Create Secret" screen.
- **What information they need:** Needs to know that the link will expire or self-destruct.

### 2. End User (Recipient)
- **Role:** The receiver of the secret.
- **Goals:** Retrieve the credential safely.
- **Responsibilities:** Copying the credential immediately upon viewing, as it will be destroyed.
- **How they interact:** Opens the shared link, clicks "Decrypt & View".

### 3. Administrator / Operations
- **Role:** System maintainer.
- **Goals:** Keep the service running securely with high uptime.
- **Responsibilities:** Deploying Docker containers, rotating DB credentials, monitoring Redis.
- **How they interact:** Through the CLI, Docker, and logging tools.

### 4. Developer
- **Role:** Software Engineer.
- **Goals:** Maintain and add features to the codebase.
- **Responsibilities:** Updating Fastify/React code, maintaining Tailwind CSS.
- **How they interact:** Modifying the monorepo codebase.

---

## 7. User Journey
**Complete End-to-End User Journey:**
1. **Sender Action:** User opens OneTime Secure homepage.
2. **Input:** User types "DatabasePassword123" into the text area.
3. **Submit:** User clicks "Generate Secure Link".
4. **Local Processing:** Browser generates AES key, encrypts text, sends ciphertext to API.
5. **System Processing:** API generates a token, stores ciphertext in Postgres, returns token.
6. **Result Generation:** Browser constructs `http://domain.com/s/TOKEN#KEY`.
7. **Share:** Sender copies URL and sends it to Recipient.
8. **Recipient Action:** Recipient opens the URL.
9. **View Trigger:** Recipient clicks "Decrypt & View Secret".
10. **Atomic Deletion:** Backend retrieves ciphertext and instantly deletes the database record.
11. **Decryption:** Browser decrypts the ciphertext using the `#KEY`.
12. **Result:** Plaintext is shown to the Recipient.

---

## 8. Application Screens

### Screen 1: Create Secret
- **Purpose:** Allow users to encrypt and submit a secret.
- **Who uses it:** Sender.
- **What the user can see:** Split dashboard layout, security guarantees, text input box.
- **Available actions:** Input text, Generate link.
- **Input fields:** `textarea` for the secret.
- **Buttons/controls:** "Generate Secure Link" button.
- **Validation:** Textarea cannot be empty.
- **Success behavior:** Transitions to the "Link Generated" state with a copyable URL.
- **Error behavior:** Browser alert or inline error if API fails.
- **Navigation:** Default route (`/`).
*[INSERT SCREENSHOT HERE: Create Secret]*

### Screen 2: Link Generated (Success State)
- **Purpose:** Provide the user with the copyable one-time link.
- **Who uses it:** Sender.
- **What the user can see:** Read-only input with URL, Copy button, warning text.
- **Available actions:** Copy to clipboard, Create Another Secret.
- **Navigation:** Triggers "Create Another Secret" to reset state.
*[INSERT SCREENSHOT HERE: Link Generated]*

### Screen 3: Receive Secret
- **Purpose:** Warn the user that the secret is single-use before they consume it.
- **Who uses it:** Recipient.
- **What the user can see:** Warning prompt, lock icon.
- **Available actions:** "Decrypt & View Secret" button.
- **Navigation:** Reached via `/s/:token`.
*[INSERT SCREENSHOT HERE: Receive Secret]*

### Screen 4: Decrypted Secret
- **Purpose:** Show the plaintext secret to the user.
- **What the user can see:** Decrypted text, Copy button, permanent destruction warning.
- **Available actions:** Copy text.
- **Success behavior:** Secret is displayed. Refreshing the page will cause a failure.
*[INSERT SCREENSHOT HERE: Decrypted Secret]*

### Screen 5: Secret Unavailable (Error)
- **Purpose:** Inform the user the secret is invalid or consumed.
- **What the user can see:** "Secret Unavailable" message.
- **Available actions:** "Create a new secret" button.
*[INSERT SCREENSHOT HERE: Error State]*

---

## 9. Functional Requirements

### Feature 1: Zero-Knowledge Secret Generation
- **Purpose:** Encrypt the secret so the server cannot read it.
- **Actors:** Sender.
- **Preconditions:** Network connection, modern browser.
- **Inputs:** Plaintext secret.
- **Process:** User inputs text -> Browser Web Crypto generates AES-256-GCM key -> text is encrypted -> POST to backend -> URL assembled.
- **Business Rules:** The decryption key MUST be placed in the URL fragment (`#hash`).
- **Validations:** Input must not be empty.
- **Success Result:** Returns URL.
- **Failure Scenarios:** Network error returns UI alert.
- **Acceptance Criteria:** The backend database contains encrypted text. The server logs contain no plaintext or keys.

### Feature 2: Atomic Secret Consumption
- **Purpose:** Prevent race conditions allowing multiple reads.
- **Actors:** Recipient.
- **Process:** User clicks view -> POST to backend -> Database executes `UPDATE ... RETURNING` -> returns payload.
- **Business Rules:** Must be atomic. 
- **Success Result:** Returns payload.
- **Failure Scenarios:** Returns 404 if already consumed.
- **Acceptance Criteria:** Firing 100 concurrent requests to the API results in exactly 1 success and 99 failures.

---

## 10. User Stories
| User Story | Acceptance Criteria | Priority | Related Feature |
|---|---|---|---|
| As a user, I want to securely encrypt a password so that the server cannot read it. | The key is generated via Web Crypto API and not sent to the server. | Must Have | Secret Generation |
| As a recipient, I want to view a shared secret exactly once so it remains confidential. | The secret is atomically deleted from the DB upon first read. | Must Have | Secret Consumption |
| As a user, I want a copy button so I can easily share the link. | Clicking the button adds the URL to the clipboard. | Should Have | UI Polish |

---

## 11. Business Rules
| Rule ID | Rule Description | Trigger | Expected Behavior | Exception |
|---|---|---|---|---|
| BR-01 | Single-use consumption | POST `/api/.../consume` | The row is marked consumed and payload is returned. | If already consumed, return 404. |
| BR-02 | Key in URL Fragment | Link generation | URL formatted as `domain.com/s/TOKEN#KEY`. | None. |
| BR-03 | Local Decryption | View Secret screen | The frontend parses the fragment and decrypts local payload. | If fragment missing, show error. |

---

## 12. Content and UX Guidelines
- **UI Terminology:** Use "Secret" instead of "Message". Use "Generate Secure Link" instead of "Submit".
- **Button labels:** "Generate Secure Link", "Decrypt & View Secret".
- **Field labels:** "Secret Content".
- **Help text:** "Paste passwords, API keys, or private notes..."
- **Error messages:** "The secret has been destroyed or the link is invalid."
- **Tone of voice:** Professional, secure, direct, reassuring.
- **Content ownership:** [TBD - Content Manager]

---

## 13. Technical Overview
- **Technology stack:** React, Node.js, Fastify, PostgreSQL.
- **Frontend:** React (Vite) + Tailwind CSS v4.
- **Backend:** Node.js with Fastify framework.
- **Database:** PostgreSQL (for atomic state management) and Redis (for future rate limiting).
- **APIs:** RESTful endpoints over HTTP.
- **Authentication:** Currently anonymous (Admin auth is TBD).
- **Configuration:** Handled via `.env` files and `docker-compose.yml`.
- **Environment setup:** `docker-compose up --build -d`.

---

## 14. System Architecture
```text
User Browser
    |
    | (HTTPS)
    v
Nginx (Reverse Proxy / Static Assets)
    |
    | (REST API)
    v
Fastify Backend Node API
    |
    | (SQL)
    v
PostgreSQL Database
```
- **Browser:** Handles crypto (AES-256-GCM).
- **Nginx:** Serves React SPA and routes `/api` requests to backend.
- **Fastify:** Handles routing and DB connection.
- **Postgres:** Provides ACID guarantees for atomic row deletion/updates.

---

## 15. API Documentation

### Create Secret
- **Endpoint:** `/api/secrets`
- **HTTP Method:** `POST`
- **Purpose:** Store encrypted ciphertext.
- **Request Body:**
  ```json
  {
    "encrypted_payload": "base64string...",
    "expires_in_minutes": 60
  }
  ```
- **Response:**
  ```json
  {
    "token": "hashed_token_string"
  }
  ```

### Consume Secret
- **Endpoint:** `/api/public/secrets/:token/consume`
- **HTTP Method:** `POST`
- **Purpose:** Atomically retrieve and destroy the ciphertext.
- **Response:**
  ```json
  {
    "encrypted_payload": "base64string..."
  }
  ```
- **Error Responses:** `404 Not Found` (if consumed or expired).

---

## 16. Data and Database Documentation
**Table: `secrets`**
- `id` (UUID, Primary Key)
- `token` (String, Indexed, Unique) - Hashed lookup identifier.
- `encrypted_payload` (Text) - The base64 AES-GCM ciphertext + IV + AuthTag.
- `expires_at` (Timestamp)
- `is_consumed` (Boolean, default FALSE)
- `consumed_at` (Timestamp, Nullable)

**Data flow:** `encrypted_payload` flows from Browser -> API -> DB. It flows back DB -> API -> Browser once.

---

## 17. Security
- **Authentication:** None (Open platform).
- **Authorization:** Token-based possession (Whoever holds the URL holds access).
- **Sensitive data:** Never touches the server unencrypted.
- **Input validation:** Basic JSON payload validation on Fastify.
- **Session management:** N/A (Stateless).
- **Data protection:** AES-256-GCM.
- **Security assumptions:** The user's device and browser are not compromised with malware reading their screen.

---

## 18. QA and Testing
- **Functional testing:** E2E automated test script (`test-flow.js`) validates encryption/decryption loop.
- **UI testing:** Manual browser testing for responsiveness across breakpoints.
- **Negative testing:** Verifying a second read attempt fails correctly.

| Test ID | Feature | Scenario | Expected Result | Priority |
|---|---|---|---|---|
| TC-01 | Crypto | Encrypt and Decrypt flow | Ciphertext matches plaintext | High |
| TC-02 | Atomicity | Attempt to read consumed secret | API returns 404 | High |

---

## 19. Operations and Support
- **Application startup:** `docker-compose up -d`.
- **Monitoring:** Monitor PostgreSQL logs and Docker container health checks.
- **Common issues:** Port 8080 conflicts, Redis connection timeouts.
- **Troubleshooting:** Ensure `.env` vars match database credentials. Use `docker-compose logs web` or `api`.
- **Backup/recovery:** Since data is inherently temporary and encrypted, database backups are strictly optional and generally unnecessary.

---

## 20. Deployment
- **Development environment:** Local Docker Desktop (macOS/Windows).
- **Production environment:** [TBD]
- **Deployment process:** Trigger CI/CD to build Docker images, deploy to Swarm/K8s/VPS.
- **Dependencies:** Docker, docker-compose.
- **Rollback approach:** Revert Docker image tags.

---

## 21. Known Issues and Limitations
| ID | Issue/ Limitation | Impact | Workaround | Status |
|---|---|---|---|---|
| 01 | No Rate Limiting | Spam attacks could fill DB | [TBD - Implement Redis Rate Limiting] | Open |
| 02 | Hardcoded Expiry | Secrets expire in exactly 1 hour | N/A | Open |

---

## 22. Future Enhancements
- **Enhancement:** Redis-backed IP Rate Limiting.
- **Reason:** Prevent malicious actors from submitting billions of secrets.
- **Expected benefit:** Platform stability.
- **Priority:** High.

---

## 23. Release Notes
| Version | Date | Change | Type | Status |
|---|---|---|---|---|
| 1.0.0 | Oct 5, 2026 | Initial MVP Release | New Feature | Complete |

---

## 24. FAQ
**Q: Can the server admin read my passwords?**
A: No. The encryption key is generated in your browser and appended to the URL fragment (`#hash`). Browsers strictly prohibit sending URL fragments to the server. The database only stores an unreadable encrypted blob.

**Q: What if I send the link to the wrong person?**
A: If they click it, the secret is consumed. You will know it was compromised when your intended recipient tries to click it and gets a "Secret Unavailable" error. 

---

## 25. Glossary
- **Zero-Knowledge:** A system where the service provider has zero capability to decrypt or read user data.
- **AES-256-GCM:** Advanced Encryption Standard with 256-bit keys using Galois/Counter Mode.
- **URL Fragment:** The portion of a URL following a `#` symbol.
- **Atomic Operation:** A database operation that completes entirely or not at all, preventing race conditions.

---

## 26. Appendix
- [TBD - Screenshots]
- [TBD - Additional Architecture Diagrams]
