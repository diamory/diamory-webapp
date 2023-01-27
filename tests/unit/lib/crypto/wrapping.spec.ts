import { assert } from "assertthat";
import { encryptKey, decryptKey } from "@/lib/crypto/wrapping";

describe("Crypto: Wrapping", (): void => {
  // official test vector from https://datatracker.ietf.org/doc/html/rfc3394#section-4.6
  const testVector = {
    key: new Uint8Array(
      Buffer.from(
        "00112233445566778899AABBCCDDEEFF000102030405060708090A0B0C0D0E0F",
        "hex"
      )
    ),
    kek: new Uint8Array(
      Buffer.from(
        "000102030405060708090A0B0C0D0E0F101112131415161718191A1B1C1D1E1F",
        "hex"
      )
    ),
    wrappedKey: Buffer.from(
      "28C9F404C4B810F4CBCCB35CFB87F8263F5786E2D80ED326CBC7F0E71A99F43BFB988B9B7A02DD21",
      "hex"
    ).toString("base64"),
  };

  test("returns wrapped key.", async (): Promise<void> => {
    const { key, kek, wrappedKey } = testVector;

    const actualWrappedKey = await encryptKey(key, kek);

    assert.that(actualWrappedKey).is.equalTo(wrappedKey);
  });

  test("returns unwrapped key.", async (): Promise<void> => {
    const { key, kek, wrappedKey } = testVector;

    const actualUnwrappedKey = await decryptKey(wrappedKey, kek);

    assert.that(actualUnwrappedKey).is.equalTo(key);
  });
});
