import MasterKey from "../types/MasterKey"
import { sign, verify } from "./hmac";
import { deriveKey } from "./scrypt";
import { getRandomValues } from "./webcrypto";
import { decryptKey, encryptKey } from "./wrapping";

const cost = 65_536;
const version = "initial";

interface Keys {
  version: string,
  encryptionKey: Uint8Array,
  versionMacKey: Uint8Array,
  versionMac: string
}

const createSalt = (): string => Buffer.from(getRandomValues(new Uint8Array(16))).toString("base64");

const createMasterKey = async (password: string): Promise<MasterKey> => {
  const encryptionKey = getRandomValues(new Uint8Array(32));
  const versionMacKey = getRandomValues(new Uint8Array(32));
  const salt = createSalt();
  const passwordKey = await deriveKey(password, salt, 32, cost, 8, 1);
  const wrappedEncryptionKey = await encryptKey(encryptionKey, passwordKey);
  const wrappedVersionMacKey = await encryptKey(versionMacKey, passwordKey);
  const versionMac = await sign(Buffer.from(version, "utf8"), versionMacKey);
  return { version, cost, salt, wrappedEncryptionKey, wrappedVersionMacKey, versionMac };
};

const getRawProperties = async (password: string, masterkeyObject: MasterKey): Promise<Keys> => {
  const { version, cost, salt, wrappedEncryptionKey, wrappedVersionMacKey, versionMac } = masterkeyObject;
  const passwordKey = await deriveKey(password, salt, 32, cost, 8, 1);
  const encryptionKey = await decryptKey(wrappedEncryptionKey, passwordKey);
  const versionMacKey = await decryptKey(wrappedVersionMacKey, passwordKey);
  return { version, encryptionKey, versionMacKey, versionMac };
};

const getEncryptionKey = async (password: string, masterkeyObject: MasterKey): Promise<Uint8Array> => {
  return (await getRawProperties(password, masterkeyObject)).encryptionKey;
};

const getCryptoVersion = async (password: string, masterkeyObject: MasterKey): Promise<string> => {
  const { version, versionMacKey, versionMac } = await getRawProperties(password, masterkeyObject);
  const valid = await verify(Buffer.from(version, "utf8"), versionMac, versionMacKey);
  if (valid) {
    return version;
  }
  throw new Error("Unauthentic Version");
};

const updateMasterKey = async (oldPassword: string, newPassword: string, masterkeyObject: MasterKey): Promise<MasterKey> => {
  const { encryptionKey, versionMacKey, versionMac } = await getRawProperties(oldPassword, masterkeyObject);
  const salt = createSalt();
  const newPasswordKey = await deriveKey(newPassword, salt, 32, cost, 8, 1);
  const wrappedEncryptionKey = await encryptKey(encryptionKey, newPasswordKey);
  const wrappedVersionMacKey = await encryptKey(versionMacKey, newPasswordKey);
  return { version, cost, salt, wrappedEncryptionKey, wrappedVersionMacKey, versionMac };
}

export { createMasterKey, updateMasterKey, getEncryptionKey, getCryptoVersion, cost, version, getRawProperties };
