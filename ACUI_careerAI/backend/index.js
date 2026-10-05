import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { createApp } from './app.js';
import { openDatabase } from './database.js';
import { hashPassword } from './passwords.js';

const backendDirectory = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(backendDirectory, '..', '.env') });
const dataDirectory = process.env.CAREERAI_DATA_DIR
  ? resolve(process.env.CAREERAI_DATA_DIR)
  : join(backendDirectory, 'data');
const databasePath = join(dataDirectory, 'careerai.db');
const secretPath = join(dataDirectory, '.session-secret');

function getSessionSecret() {
  mkdirSync(dataDirectory, { recursive: true });
  if (existsSync(secretPath)) {
    const existingSecret = readFileSync(secretPath);
    if (existingSecret.length < 32) throw new Error(`Session secret at ${secretPath} is invalid.`);
    return existingSecret;
  }

  const secret = randomBytes(48);
  try {
    writeFileSync(secretPath, secret, { flag: 'wx', mode: 0o600 });
    return secret;
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    return readFileSync(secretPath);
  }
}

const sessionSecret = getSessionSecret();
const database = openDatabase(databasePath);

async function ensureOwnerAdmin() {
  const existing = database.prepare('SELECT COUNT(*) AS count FROM admin_users').get().count;
  if (existing > 0) return;

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 12) {
    throw new Error('Set a valid ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters before first startup.');
  }
  const passwordHash = await hashPassword(password);
  database.prepare(
    'INSERT INTO admin_users (name, email, password_hash, is_owner) VALUES (?, ?, ?, 1)'
  ).run('Owner', email, passwordHash);

  console.log(`Owner admin account created for ${email}.`);
}

await ensureOwnerAdmin();

const app = createApp({
  database,
  sessionSecret,
  isProduction: process.env.NODE_ENV === 'production'
});
const port = Number(process.env.API_PORT || 3001);
const server = app.listen(port, '127.0.0.1', () => {
  console.log(`CareerAI API listening at http://127.0.0.1:${port}`);
  console.log(`SQLite database: ${databasePath}`);
});

function shutdown() {
  server.close(() => {
    database.close();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
