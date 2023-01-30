import { assert } from "assertthat";
import { deriveKey } from "@/lib/crypto/scrypt";

describe("SCRYPT", (): void => {
  test("returns correct key.", async (): Promise<void> => {
    // expected value taken from here (vector 3): https://www.rfc-editor.org/rfc/rfc7914#page-13
    const expectedKey = Buffer.from("7023bdcb3afd7348461c06cd81fd38ebfda8fbba904f8e3ea9b543f6545da1f2d5432955613f0fcf62d49705242a9af9e61e85dc0d651e40dfcf017b45575887", "hex");

    const key = await deriveKey("pleaseletmein", "SodiumChloride", 64, 16384, 8, 1);

    assert.that(key).is.equalTo(expectedKey);
  });
});