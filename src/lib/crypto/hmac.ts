import { subtle } from "./webcrypto";

const keyUsages: KeyUsage[] = ["sign", "verify"];
const algo = { 
  name: "HMAC",
  hash: {name: "SHA-256"}
};

const sign = async (msg: Uint8Array, keyData: Uint8Array): Promise<string> => {
  const key = await subtle.importKey("raw", keyData, algo, true, keyUsages);
  const mac = await subtle.sign("HMAC", key, msg);
  return Buffer.from(mac).toString("base64");
};

const verify = async (msg: Uint8Array, mac: string, keyData: Uint8Array): Promise<boolean> => {
  const key = await subtle.importKey("raw", keyData, algo, true, keyUsages);
  return await subtle.verify("HMAC", key, Buffer.from(mac, "base64"), msg);
};

export { sign, verify };
