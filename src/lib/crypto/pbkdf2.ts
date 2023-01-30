import { subtle } from "./webcrypto";

const pbkdf2KeyUsages: KeyUsage[] = ["deriveBits", "deriveKey"];
const keyUsages: KeyUsage[] = ["encrypt", "decrypt"];
const keyAlgo = {
  name: "AES-GCM",
  length: 256
};

const pbkdf2Params = (salt: string, iterations: number) => {
  return {
    name: "PBKDF2",
    salt: Buffer.from(salt, "utf8"),
    iterations,
    hash: "SHA-256"
  }
};

const deriveHash = async (password: string, salt: string, iterations: number): Promise<string> => {
  const keyMaterial = await subtle.importKey( "raw", Buffer.from(password, "utf8"), "PBKDF2", false, pbkdf2KeyUsages);
  const cryptoKey = await subtle.deriveKey(pbkdf2Params(salt, iterations), keyMaterial, keyAlgo, true, keyUsages);
  const hash = await subtle.exportKey("raw", cryptoKey);

  return Buffer.from(hash).toString("base64");
};

export { deriveHash };
