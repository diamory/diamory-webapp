import { assert } from "assertthat";
import { encryptData, decryptData } from "@/lib/crypto/encryption";
import { randomBytes } from "crypto";
import { readFileSync } from "fs";

jest.mock("@/lib/crypto/webcrypto", () => {
  const originalModule = jest.requireActual("@/lib/crypto/webcrypto");

  return {
    ...originalModule,
    getRandomValues(array: Uint8Array){
      return array.fill(array.length);
    }
  };
});

const dataLength = 33_000;

// // encryption results for testing has been determined with internal core implementations, before they were hard coded here
const key = new Uint8Array(32).fill(32);
const data = new Uint8Array(dataLength);
const encrypted = readFileSync("./tests/testdata/encrypted");
const additionalData = "id";

describe("Encryption", (): void => {
  test("encrypts correctly, using test vector.", async (): Promise<void> => {
    const actualEncryped = await encryptData(data, key, additionalData);

    assert.that(actualEncryped).is.equalTo(encrypted);
  });

  test("decrypts correctly, using test vector.", async (): Promise<void> => {
    const actualDecryped = await decryptData(encrypted, key, additionalData);

    assert.that(actualDecryped).is.equalTo(data);
  });

  test("encrypts and decrypts back, correctly, using random data", async (): Promise<void> => {
    const data = randomBytes(dataLength);
    const key = randomBytes(32);
    const additionalData = randomBytes(8).toString("base64");

    const encrypted = await encryptData(data, key, additionalData);
    const decrypted = await decryptData(encrypted, key, additionalData);

    assert.that(decrypted).is.equalTo(data);
  });

  test("throws exceptions due to invalid data", async (): Promise<void> => {
    const data = randomBytes(50);
    const key = randomBytes(32);
    const additionalData = randomBytes(8).toString("base64");
    const encrypted = await encryptData(data, key, additionalData);
    encrypted[81] = encrypted[81] === 0 ? 1 : 0;
    
    assert.that(async (): Promise<void> => {
      await decryptData(encrypted, key, additionalData);
    }).is.throwingAsync("Cipher job failed");
  });
});
