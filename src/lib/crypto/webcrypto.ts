import nodeCrypto from "crypto";
import { v4 as uuidv4 } from "uuid";

const webcrypto = window.crypto ?? nodeCrypto.webcrypto;
const { getRandomValues, subtle } = webcrypto;

const randomUUID = (): string => {
  return uuidv4();
};

export { getRandomValues, randomUUID, subtle };
