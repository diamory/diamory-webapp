import { assert } from 'assertthat';
import { createLoginHash, loginPepper } from '@/lib/crypto/loginhash';
import { deriveHash } from '@/lib/crypto/pbkdf2';

describe('Login Hash', (): void => {
  test('returns correct hash.', async (): Promise<void> => {
    const expectedHashSpice = `${loginPepper}_username`;
    const expectedHash = await deriveHash('password', expectedHashSpice, 2500);

    const hash = await createLoginHash('username', 'password');

    assert.that(hash).is.equalTo(expectedHash);
  });
});
