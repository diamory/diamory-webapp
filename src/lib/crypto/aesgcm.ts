import { subtle } from './webcrypto';

const keyUsages: KeyUsage[] = ['encrypt', 'decrypt'];
const name = 'AES-GCM';

const encrypt = async (
  data: Uint8Array,
  keyData: Uint8Array,
  iv: Uint8Array,
  additionalData: Uint8Array
): Promise<Uint8Array> => {
  const key = await subtle.importKey('raw', keyData, 'aes-gcm', true, keyUsages);
  const encrypted = await subtle.encrypt({ name, iv, additionalData }, key, data);
  return new Uint8Array(encrypted);
};

const decrypt = async (
  cipherAndTag: Uint8Array,
  keyData: Uint8Array,
  iv: Uint8Array,
  additionalData: Uint8Array
): Promise<Uint8Array> => {
  const key = await subtle.importKey('raw', keyData, 'aes-gcm', true, keyUsages);
  const decrypted = await subtle.decrypt({ name, iv, additionalData }, key, cipherAndTag);
  return new Uint8Array(decrypted);
};

export { encrypt, decrypt };
