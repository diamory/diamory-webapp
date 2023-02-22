import { assert } from "assertthat";
import { createMasterKey, updateMasterKey, getEncryptionKey, getCryptoVersion, version, cost } from "@/lib/crypto/masterkey";

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
const wrappedEncryptionKey = "VA4eu0SbDq5tg48YpfE3jYH5U1tvKmRIMzhahx0mz2qKKBmvwH2fkA==";
const wrappedEncryptionKey2 = "H7MkfZYuhDPFVO19qE+bCDlzaLyImpRjLLF+bNKk0YsKF7MwOa7yEg==";
const versionMac = "1VsWX4BW7l0tHKbNlw0yKjpmw/ceWVZvLlRIHHzeHtw=";
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

describe("Master", (): void => {
  test("returns correct created masterkey object.", async (): Promise<void> => {
    const masterkeyObject = await createMasterKey(password);

    assert.that(masterkeyObject).is.equalTo(expectedMasterKeyObject);
  });

  test("returns correct updated masterkey object.", async (): Promise<void> => {
    const masterkeyObject = await updateMasterKey(password, password2, expectedMasterKeyObject);

    assert.that(masterkeyObject).is.equalTo(expectedMasterKeyObject2);
  });

  test("returns correct masterkey.", async (): Promise<void> => {
    const masterKey = await getEncryptionKey(password, expectedMasterKeyObject);

    assert.that(masterKey).is.equalTo(key);
  });

  test("returns correct version.", async (): Promise<void> => {
    const actualVersion = await getCryptoVersion(password, expectedMasterKeyObject);

    assert.that(actualVersion).is.equalTo(version);
  });

  test("throws exception due to invalid password.", async (): Promise<void> => {
    assert.that(async (): Promise<void> => {
      await getEncryptionKey("invalid", expectedMasterKeyObject);
    }).is.throwingAsync("The operation failed for an operation-specific reason");
  });

  test("throws exception due to invalid version.", async (): Promise<void> => {
    expectedMasterKeyObject.version = "jnitial";

    assert.that(async (): Promise<void> => {
      await getCryptoVersion(password, expectedMasterKeyObject);
    }).is.throwingAsync("Unauthentic Version");
  });
});
