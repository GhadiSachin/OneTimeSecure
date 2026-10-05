import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Pool } from 'pg';
import crypto from 'crypto';

const fastify = Fastify({ logger: true });

// Register CORS
fastify.register(cors, {
  origin: true // Allow all origins for the MVP
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/onetime_secure'
});

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS secrets (
        id SERIAL PRIMARY KEY,
        token_hash VARCHAR(255) UNIQUE NOT NULL,
        encrypted_payload TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        consumed_at TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active'
      );
      CREATE INDEX IF NOT EXISTS idx_secrets_token_hash ON secrets(token_hash);
    `);
  } finally {
    client.release();
  }
}

// POST /api/secrets - Create a new secret
fastify.post('/api/secrets', async (request, reply) => {
  const { encrypted_payload, expires_in_minutes } = request.body as any;
  
  if (!encrypted_payload || !expires_in_minutes) {
    return reply.status(400).send({ error: 'Missing parameters' });
  }

  // Generate a random token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  
  const expiresAt = new Date(Date.now() + expires_in_minutes * 60000);

  const client = await pool.connect();
  try {
    await client.query(
      'INSERT INTO secrets (token_hash, encrypted_payload, expires_at) VALUES ($1, $2, $3)',
      [tokenHash, encrypted_payload, expiresAt]
    );
    return { token: rawToken, expires_at: expiresAt };
  } finally {
    client.release();
  }
});

// POST /api/public/secrets/:token/consume - Atomically consume a secret
fastify.post('/api/public/secrets/:token/consume', async (request, reply) => {
  const { token } = request.params as any;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const client = await pool.connect();
  try {
    // Atomic consumption using UPDATE ... RETURNING
    const result = await client.query(`
      UPDATE secrets
      SET status = 'consumed', consumed_at = NOW()
      WHERE token_hash = $1 
        AND status = 'active'
        AND expires_at > NOW()
      RETURNING encrypted_payload
    `, [tokenHash]);

    if (result.rowCount === 0) {
      return reply.status(404).send({ error: 'Secret not found, expired, or already consumed.' });
    }

    // Since it's zero-knowledge, we just return the encrypted payload
    return { encrypted_payload: result.rows[0].encrypted_payload };
  } finally {
    client.release();
  }
});

const start = async () => {
  try {
    await initDB();
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();