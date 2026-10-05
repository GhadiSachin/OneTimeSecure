# OneTime Secure

A self-hosted, open-source alternative to one-time secret sharing services with a zero-knowledge architecture.

## Architecture

* **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui
* **Backend**: Node.js, Fastify, PostgreSQL (for storage), Redis (for rate limiting and atomic locking)

## Zero-Knowledge Security Model

This application uses a zero-knowledge architecture. The backend never sees the plaintext secret.

1. **Encryption**: The browser generates a cryptographically random 256-bit AES-GCM key. It encrypts the secret text using the Web Crypto API.
2. **Storage**: The browser sends only the *encrypted payload* and a *token hash* to the server.
3. **Distribution**: The decryption key is appended to the one-time URL as a URL fragment (e.g., `https://domain.com/s/<token>#<encryption-key>`). The URL fragment is never sent to the server.
4. **Consumption**: The recipient visits the URL. The backend atomically returns the encrypted payload and marks the secret as consumed using a transactional row lock or Redis atomic delete.
5. **Decryption**: The recipient's browser reads the key from the URL fragment and decrypts the payload locally.

## Getting Started

### Local Development Setup (Using Docker)

The easiest way to run the entire stack (Database, Cache, API, and Web Frontend) is via Docker Compose.

1. Ensure you have Docker and Docker Compose installed.
2. Clone this repository.
3. (Optional) Create a `.env` file based on `.env.example` if you need to override the default credentials.
4. From the root directory, run:
   ```bash
   docker-compose up --build -d
   ```
5. The services will be available at:
   - **Frontend (Web)**: http://localhost:8080
   - **Backend API**: http://localhost:3000

To view logs:
```bash
docker-compose logs -f
```

To shut down the services:
```bash
docker-compose down
```

## MVP Status

Currently scaffolded:
- Project monorepo structure
- Docker Compose configuration for Postgres, Redis, API, and Web
- Dockerfiles (`infra/docker/api.Dockerfile`, `infra/docker/web.Dockerfile`)
- Core zero-knowledge cryptography logic (`packages/crypto/index.ts`)

To complete the MVP, follow the `SECURITY.md` guidelines and implement the Web Crypto logic across the React components and Fastify endpoints.
