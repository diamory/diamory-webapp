import { assert } from 'assertthat';
import { sign, verify } from '@/lib/crypto/hmac';

describe('HMAC', (): void => {
  // Official test vector from https://csrc.nist.gov/CSRC/media/Projects/Cryptographic-Algorithm-Validation-Program/documents/mac/hmactestvectors.zip
  // L=32; Count=120 (starting on line 5577)
  const testVector = {
    key: Buffer.from(
      '992868504d2564c4fb47bcbd4ae482d8fb0e8e56d7b81864e61986a0e25682daeb5b50177c095edc9e971da95c3210c376e723365ac33d1b4f391817f4c35124',
      'hex'
    ),
    msg: Buffer.from(
      'ed4f269a8851eb3154771516b27228155200778049b2dc1963f3ac32ba46ea1387cfbb9c39151a2cc406cdc13c3c9860a27eb0b7fe8a7201ad11552afd041e33f70e53d97c62f17194b66117028fa9071cc0e04bd92de4972cd54f719010a694e414d4977abed7ca6b90ba612df6c3d467cded85032598a48546804f9cf2ecfe',
      'hex'
    ),
    mac: Buffer.from('2f8321f416b9bb249f113b13fc12d70e1668dc332839c10daa5717896cb70ddf', 'hex')
  };

  test('signs correctly, using test vector.', async (): Promise<void> => {
    const { key, msg, mac } = testVector;

    const actualMac = await sign(msg, key);

    assert.that(actualMac).is.equalTo(mac.toString('base64'));
  });

  test('verifies true, using test vector.', async (): Promise<void> => {
    const { key, msg, mac } = testVector;

    const result = await verify(msg, mac.toString('base64'), key);

    assert.that(result).is.true();
  });

  test('verifies false, using tampered with by one byte.', async (): Promise<void> => {
    const { key, msg, mac } = testVector;
    msg[0] = msg[0] === 0 ? 1 : 0;

    const result = await verify(msg, mac.toString('base64'), key);

    assert.that(result).is.false();
  });
});
