// Native Web Crypto API utilities for SHA-256 password hashing

export const hashPassword = async (password) => {
  if (!password) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(password.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const verifySecret = async (input, machine) => {
  if (!machine) return false;
  const trimmed = (input || '').trim();

  // If machine has modern SHA-256 hash
  if (machine.secretHash) {
    const inputHash = await hashPassword(trimmed);
    return inputHash === machine.secretHash;
  }

  // Legacy fallback if machine has old plaintext secret
  if (machine.secret) {
    return trimmed === machine.secret.trim();
  }

  return true;
};
