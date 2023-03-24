import { assert } from 'assertthat';
import { sha256 } from '@/lib/crypto/sha256';

describe('HMAC', (): void => {
  // Official test vector from https://www.dlitz.net/crypto/shad256-test-vectors/
  // -> Sample test vectors -> NIST.1
  const testVector = {
    input: Buffer.from('abc', 'utf8'),
    sum: Buffer.from('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad', 'hex').toString('base64')
  };

  test('hashes correctly, using test vector.', async (): Promise<void> => {
    const { input, sum } = testVector;

    const actualSum = await sha256(input);

    assert.that(actualSum).is.equalTo(sum);
  });
});
