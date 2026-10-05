import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const COST = 32768;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;
const KEY_LENGTH = 64;

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, KEY_LENGTH, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLELIZATION,
    maxmem: 64 * 1024 * 1024
  });

  return `scrypt$${COST}$${BLOCK_SIZE}$${PARALLELIZATION}$${salt.toString('hex')}$${key.toString('hex')}`;
}

export async function verifyPassword(password, encodedHash) {
  const [algorithm, cost, blockSize, parallelization, saltHex, keyHex] = String(encodedHash).split('$');
  if (algorithm !== 'scrypt' || !/^[0-9a-f]{32}$/i.test(saltHex || '') || !/^[0-9a-f]{128}$/i.test(keyHex || '')) {
    return false;
  }

  const expected = Buffer.from(keyHex, 'hex');
  const actual = await scrypt(password, Buffer.from(saltHex, 'hex'), expected.length, {
    N: Number(cost),
    r: Number(blockSize),
    p: Number(parallelization),
    maxmem: 64 * 1024 * 1024
  });

  return timingSafeEqual(expected, actual);
}
