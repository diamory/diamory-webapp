import { deriveHash } from './pbkdf2';
import { loginPepper, iterations } from './props';

const createLoginHash = async (username: string, password: string): Promise<string> => {
  const spice = `${loginPepper}_${username}`;
  return await deriveHash(password, spice, iterations);
};

export { createLoginHash, loginPepper };
