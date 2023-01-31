import MasterKey from "../types/MasterKey"
import { deriveKey } from "./scrypt";
import { getRandomValues } from "./webcrypto";
import { decryptKey, encryptKey } from "./wrapping";

const cost = 65_536;

const createSalt = (): string => Buffer.from(getRandomValues(new Uint8Array(16))).toString("base64");

const createMasterKey = async (password: string): Promise<MasterKey> => {
  const key = getRandomValues(new Uint8Array(32));
  const salt = createSalt();
  const passwordKey = await deriveKey(password, salt, 32, cost, 8, 1);
  const wrappedKey = await encryptKey(key, passwordKey);
  return { cost, salt, wrappedKey };
};

const getMasterKey = async (password: string, masterkeyObject: MasterKey): Promise<Uint8Array> => {
  const { cost, salt, wrappedKey } = masterkeyObject;
  const passwordKey = await deriveKey(password, salt, 32, cost, 8, 1);
  return await decryptKey(wrappedKey, passwordKey);
}

const updateMasterKey = async (oldPassword: string, newPassword: string, masterkeyObject: MasterKey): Promise<MasterKey> => {
  const key = await getMasterKey(oldPassword, masterkeyObject);
  const newSalt = createSalt();
  const newPasswordKey = await deriveKey(newPassword, newSalt, 32, cost, 8, 1);
  const newWrappedKey = await encryptKey(key, newPasswordKey);
  return { cost, salt: newSalt, wrappedKey: newWrappedKey };
}

export { createMasterKey, updateMasterKey, getMasterKey, cost };
