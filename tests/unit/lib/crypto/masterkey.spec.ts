import { assert } from "assertthat";
import { createMasterKey, updateMasterKey, getMasterKey, cost } from "@/lib/crypto/masterkey";
import { deriveKey } from "@/lib/crypto/scrypt";
import { encryptKey } from "@/lib/crypto/wrapping";

jest.mock('@/lib/crypto/webcrypto', () => {
  const originalModule = jest.requireActual('@/lib/crypto/webcrypto');

  return {
    ...originalModule,
    getRandomValues(array: Uint8Array) {
      return array.fill(array.length);
    }
  };
});

const password = "pleaseletmein";
const password2 = "pleaseletmein42";
const salt = Buffer.from(new Uint8Array(16).fill(16)).toString("base64");
const key = new Uint8Array(32).fill(32);

const getTestValues = async () => {
  const passwordKey = await deriveKey(password, salt, 32, cost, 8, 1);
  const passwordKey2 = await deriveKey(password2, salt, 32, cost, 8, 1);
  const wrappedKey = await encryptKey(key, passwordKey);
  const wrappedKey2 = await encryptKey(key, passwordKey2);
  const expectedMasterKeyObject = { cost, salt, wrappedKey };
  const expectedMasterKeyObject2 = { cost, salt, wrappedKey: wrappedKey2 };

  return { expectedMasterKeyObject, expectedMasterKeyObject2 };
}

describe("Master", (): void => {
  test("returns correct created masterkey object.", async (): Promise<void> => {
    const { expectedMasterKeyObject } = await getTestValues();

    const masterkeyObject = await createMasterKey(password);

    assert.that(masterkeyObject).is.equalTo(expectedMasterKeyObject);
  });

  test("returns correct updated masterkey object.", async (): Promise<void> => {
    const { expectedMasterKeyObject, expectedMasterKeyObject2 } = await getTestValues();

    const masterkeyObject = await updateMasterKey(password, password2, expectedMasterKeyObject);

    assert.that(masterkeyObject).is.equalTo(expectedMasterKeyObject2);
  });

  test("returns correct masterkey.", async (): Promise<void> => {
    const { expectedMasterKeyObject } = await getTestValues();

    const masterKey = await getMasterKey(password, expectedMasterKeyObject);

    assert.that(masterKey).is.equalTo(key);
  });
});
