import crypto from 'crypto';

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function comparePassword(password, storedHash) {
  try {
    if (!storedHash || !storedHash.includes(':')) return false;
    const [salt, originalHash] = storedHash.split(':');
    const hashToTest = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return originalHash === hashToTest;
  } catch (err) {
    return false;
  }
}
