import { assert } from "assertthat";
import { encryptData, decryptData } from "@/lib/crypto/encryption";
import { encrypt } from "@/lib/crypto/aesgcm";
import { randomBytes } from "crypto";

jest.mock('@/lib/crypto/webcrypto', () => {
  const originalModule = jest.requireActual('@/lib/crypto/webcrypto');

  return {
    ...originalModule,
    getRandomValues(array: Uint8Array){
      return array;
    }
  };
});

const dataLength = 33_000;
const chunkLength = 32_768;

const getTestVector = async () => {
  const headerPayload = Buffer.from(`${"ff".repeat(8)}${"00".repeat(32)}`, "hex");
  const chunk1Payload = new Uint8Array(chunkLength);
  const chunk2Payload = new Uint8Array(dataLength - chunkLength);
  const key = new Uint8Array(32);
  const nonce = new Uint8Array(12);
  const headerAdditionalData = Buffer.concat([Buffer.from("id", "utf8"), Buffer.from("0002", "hex")]);
  const chunk1AdditionalData = Buffer.concat([Buffer.from("id", "utf8"), Buffer.from("0001", "hex")]);
  const chunk2AdditionalData = Buffer.concat([Buffer.from("id", "utf8"), Buffer.from("0002", "hex")]);
  const headerCipherAndTag = await encrypt(headerPayload, key, nonce, headerAdditionalData);
  const chunk1CipherAndTag = await encrypt(chunk1Payload, key, nonce, chunk1AdditionalData);
  const chun2kCipherAndTag = await encrypt(chunk2Payload, key, nonce, chunk2AdditionalData);

  return {
  data: new Uint8Array(dataLength),
  key,
  addidtionalData: "id",
  encrypted: Buffer.concat([ nonce, headerCipherAndTag, nonce, chunk1CipherAndTag, nonce, chun2kCipherAndTag ])
  };
};

describe("Encryption", (): void => {
  test("encrypts to correct length", async (): Promise<void> => {
    const data = new Uint8Array(dataLength); // 2 chunks of data
    const key = new Uint8Array(32);
    const additionalData = "";

    const encrypted = await encryptData(data, key, additionalData);

    assert.that(encrypted.length).is.equalTo(dataLength + 2*28 + 68);
  });

  test("encrypts correctly, using test vector.", async (): Promise<void> => {
    const { data, key, addidtionalData, encrypted } = await getTestVector();

    const actualEncryped = await encryptData(data, key, addidtionalData);

    assert.that(actualEncryped).is.equalTo(encrypted);
  });

  test("decrypts correctly, using test vector.", async (): Promise<void> => {
    const { data, key, addidtionalData, encrypted } = await getTestVector();

    const actualDecryped = await decryptData(encrypted, key, addidtionalData);

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
