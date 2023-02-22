import { assert } from 'assertthat';
import { createMasterKey, updateMasterKey, getRawProperties } from '@/lib/crypto/masterkey';

// to prevent mistesting caused by mocked random in masterkey.spec.ts (same keys while mocking)
test('returns different keys.', async (): Promise<void> => {
  const password = 'password';
  const password2 = 'password2';

  const masterkeyObject = await createMasterKey(password);
  const { encryptionKey, versionMacKey } = await getRawProperties(password, masterkeyObject);
  const masterkeyObject2 = await updateMasterKey(password, password2, masterkeyObject);

  assert.that(masterkeyObject.wrappedEncryptionKey).is.not.equalTo(masterkeyObject.wrappedVersionMacKey);
  assert.that(masterkeyObject2.wrappedEncryptionKey).is.not.equalTo(masterkeyObject2.wrappedVersionMacKey);
  assert.that(encryptionKey).is.not.equalTo(versionMacKey);
});
