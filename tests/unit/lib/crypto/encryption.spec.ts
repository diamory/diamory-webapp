import { assert } from 'assertthat';
import { encryptData, decryptData } from '@/lib/crypto/encryption';
import { randomBytes } from 'crypto';

jest.mock('@/lib/crypto/webcrypto', () => {
  const originalModule = jest.requireActual('@/lib/crypto/webcrypto');

  return {
    ...originalModule,
    getRandomValues(array: Uint8Array) {
      return array.fill(array.length);
    }
  };
});

jest.mock('@/lib/crypto/props', () => {
  const originalModule = jest.requireActual('@/lib/crypto/props');

  return { ...originalModule, chunkLength: 64 };
});

const dataLength = 96;

const key = new Uint8Array(32).fill(32);
const data = new Uint8Array(dataLength);
const encrypted = Buffer.from(
  'DAwMDAwMDAwMDAwMkNe1gS6RkABghQk9Vox2Q+VTh5YFbz8x0Fi1HIWCjzGsO3QWJeJiyIg/UcX23a4wRxT8En2Jw6oMDAwMDAwMDAwMDAxvKEp+0W5v/0ClKR12rFZjxXOntiVPHxHweJU8paKvEYwbVDYFwkLoxBSsk5wrWf7KjGEQ3sukwf1ESgqi4n0rZmRdzK9nangN0EpyCofUGwwMDAwMDAwMDAwMDG8oSn7Rbm//QKUpHXasVmPFc6e2JU8fEfB4lTyloq8Rw843ev3TiXY4hubeAMw9Ug==',
  'base64'
);
const additionalData = 'id';

describe('Encryption', (): void => {
  test('encrypts correctly, using test vector.', async (): Promise<void> => {
    const actualEncryped = await encryptData(data, key, additionalData);

    assert.that(actualEncryped).is.equalTo(encrypted);
  });

  test('decrypts correctly, using test vector.', async (): Promise<void> => {
    const actualDecryped = await decryptData(encrypted, key, additionalData);

    assert.that(actualDecryped).is.equalTo(data);
  });

  test('encrypts and decrypts back, correctly, using random data', async (): Promise<void> => {
    const data = randomBytes(dataLength);
    const key = randomBytes(32);
    const additionalData = randomBytes(8).toString('base64');

    const encrypted = await encryptData(data, key, additionalData);
    const decrypted = await decryptData(encrypted, key, additionalData);

    assert.that(decrypted).is.equalTo(data);
  });

  test('throws exceptions due to invalid data', async (): Promise<void> => {
    const data = randomBytes(50);
    const key = randomBytes(32);
    const additionalData = randomBytes(8).toString('base64');
    const encrypted = await encryptData(data, key, additionalData);
    encrypted[81] = encrypted[81] === 0 ? 1 : 0;

    assert
      .that(async (): Promise<void> => {
        await decryptData(encrypted, key, additionalData);
      })
      .is.throwingAsync('The operation failed for an operation-specific reason');
  });
});
