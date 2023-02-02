import { assert } from "assertthat";
import { createMasterKey, updateMasterKey, getEncryptionKey, getCryptoVersion, version, cost } from "@/lib/crypto/masterkey";
import { deriveKey } from "@/lib/crypto/scrypt";
import { encryptKey } from "@/lib/crypto/wrapping";
import { sign } from "@/lib/crypto/hmac";

// causes to be encryptionKey and versionMacKey to be equal (fixed in masterkey.unequal.spec.ts)
jest.mock("@/lib/crypto/webcrypto", () => {
  const originalModule = jest.requireActual("@/lib/crypto/webcrypto");

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
  const wrappedEncryptionKey = await encryptKey(key, passwordKey);
  const wrappedEncryptionKey2 = await encryptKey(key, passwordKey2);
  const versionMac = await sign(Buffer.from(version, "utf8"), key);
  const expectedMasterKeyObject = {
    version,
    cost,
    salt,
    wrappedEncryptionKey: wrappedEncryptionKey,
    wrappedVersionMacKey: wrappedEncryptionKey,
    versionMac
  };
  const expectedMasterKeyObject2 = {
    version,
    cost,
    salt,
    wrappedEncryptionKey: wrappedEncryptionKey2,
    wrappedVersionMacKey: wrappedEncryptionKey2,
    versionMac
  };

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

    const masterKey = await getEncryptionKey(password, expectedMasterKeyObject);

    assert.that(masterKey).is.equalTo(key);
  });

  test("returns correct version.", async (): Promise<void> => {
    const { expectedMasterKeyObject } = await getTestValues();

    const actualVersion = await getCryptoVersion(password, expectedMasterKeyObject);

    assert.that(actualVersion).is.equalTo(version);
  });

  test("throws exception due to invalid password.", async (): Promise<void> => {
    const { expectedMasterKeyObject } = await getTestValues();

    assert.that(async (): Promise<void> => {
      await getEncryptionKey("invalid", expectedMasterKeyObject);
    }).is.throwingAsync("Cipher job failed");
  });

  test("throws exception due to invalid version.", async (): Promise<void> => {
    const { expectedMasterKeyObject } = await getTestValues();
    expectedMasterKeyObject.version = "jnitial"

    assert.that(async (): Promise<void> => {
      await getCryptoVersion(password, expectedMasterKeyObject);
    }).is.throwingAsync("Unauthentic Version");
  });
});
