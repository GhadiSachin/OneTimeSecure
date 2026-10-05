# OneTime Secure: System Requirements & Acceptance Criteria

This document outlines the core requirements for the OneTime Secure MVP.

## 1. Core Requirements

- **Self-Hostable:** The application must be easily deployable via Docker Compose.
- **Zero-Knowledge Architecture:** The backend server must NEVER have access to the plaintext secrets. Encryption and decryption must happen exclusively in the browser.
- **One-Time Consumption:** A secret must be readable exactly once. Subsequent attempts must fail completely.
- **Expiry:** Secrets must automatically expire after a configurable duration if they are not consumed.

## 2. Technical Stack

- **Frontend:** React (Vite), TypeScript, Tailwind CSS v4, Lucide React Icons.
- **Backend:** Node.js, Fastify, TypeScript.
- **Database:** PostgreSQL (for atomic state management).
- **Caching/Rate-Limiting:** Redis.
- **Cryptography:** Web Crypto API (`AES-GCM`).

## 3. Acceptance Criteria

1. **Security & Cryptography**
   - Must use `AES-256-GCM` for local encryption.
   - Must use `crypto.getRandomValues()` (never `Math.random()`).
   - The decryption key must be passed via the URL Fragment (`#hash`) so it is never transmitted in HTTP headers.
2. **Database Atomicity**
   - Consumption must be handled by an atomic SQL transaction (`UPDATE ... RETURNING`) to prevent race conditions.
3. **Deployment**
   - The entire stack (Postgres, Redis, Backend API, Frontend Nginx) must run locally via a single `docker-compose up` command.
4. **User Interface**
   - Must provide a premium, modern, responsive, dark-mode SaaS dashboard.
   - Must provide clear warnings to recipients that the data is volatile and one-time-use only.
