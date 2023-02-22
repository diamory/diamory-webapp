import { subtle } from './webcrypto';

const encryptKey = async (keyData: Uint8Array, kekData: Uint8Array): Promise<string> => {
  const keyUsages: KeyUsage[] = ['encrypt', 'decrypt'];
  const kekUsages: KeyUsage[] = ['wrapKey', 'unwrapKey'];
  const key = await subtle.importKey('raw', keyData, 'aes-gcm', true, keyUsages);
  const kek = await subtle.importKey('raw', kekData, 'aes-kw', true, kekUsages);

  const wrappedKeyArrayBuffer = await subtle.wrapKey('raw', key, kek, 'aes-kw');

  return Buffer.from(wrappedKeyArrayBuffer).toString('base64');
};

const decryptKey = async (wrappedKeyData: string, kekData: Uint8Array): Promise<Uint8Array> => {
  const keyUsages: KeyUsage[] = ['encrypt', 'decrypt'];
  const kekUsages: KeyUsage[] = ['wrapKey', 'unwrapKey'];
  const kek = await subtle.importKey('raw', kekData, 'aes-kw', true, kekUsages);

  const wrappedKeyArrayBuffer = await subtle.unwrapKey(
    'raw',
    Buffer.from(wrappedKeyData, 'base64'),
    kek,
    'aes-kw',
    'aes-gcm',
    true,
    keyUsages
  );

  return new Uint8Array(await subtle.exportKey('raw', wrappedKeyArrayBuffer));
};

export { encryptKey, decryptKey };
