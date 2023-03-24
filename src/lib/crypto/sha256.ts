import { subtle } from './webcrypto';

const sha256 = async (input: Uint8Array): Promise<string> => {
  const sum = await subtle.digest('SHA-256', input);
  return Buffer.from(sum).toString('base64');
};

export { sha256 };
