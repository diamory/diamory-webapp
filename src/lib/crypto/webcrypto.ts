import nodeCrypto from "crypto";
import { v4 as uuidv4 } from "uuid";

const webcrypto = window.crypto ?? nodeCrypto.webcrypto;
const { subtle } = webcrypto;

const randomUUID = (): string => {
  return uuidv4();
};

const getRandomValues = (array: Uint8Array): Uint8Array => {
  return webcrypto.getRandomValues(array);
};

export { getRandomValues, randomUUID, subtle };
