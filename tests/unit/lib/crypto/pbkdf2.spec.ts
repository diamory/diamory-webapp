import { assert } from "assertthat";
import { deriveLoginHash } from "@/lib/crypto/pbkdf2";

describe("PBKDF2", (): void => {
  test("returns correct hash.", async (): Promise<void> => {
    // expected value taken from here (vector 5): https://github.com/cryptocoinjs/pbkdf2-sha256/blob/master/test/fixtures/pbkdf2.json
    const expectedHash = Buffer.from("c5e478d59288c841aa530db6845c4c8d962893a001ce4e11a4963873aa98134a", "hex").toString("base64");

    const hash = await deriveLoginHash("password", "salt", 4_096);

    assert.that(hash).is.equalTo(expectedHash);
  });
});