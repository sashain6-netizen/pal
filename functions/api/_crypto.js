/**
 * Hashes a password using PBKDF2
 */
export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    passwordKey,
    256
  );

  // Store salt and hash as hex strings
  return {
    hash: Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''),
    salt: Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('')
  };
}

/**
 * Verifies a password against a stored hash and salt
 */
export async function verifyPassword(password, storedHash, storedSalt) {
  const encoder = new TextEncoder();
  const salt = new Uint8Array(storedSalt.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    passwordKey,
    256
  );

  const currentHash = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  return currentHash === storedHash;
}