import { deriveHash } from "./pbkdf2";

const loginPepper = "aae21d0e-a1ac-11ed-8c7c-7fbb2f279774";

const createLoginHash = async (username: string, password: string): Promise<string> => {
  const spice = `${loginPepper}_${username}`;
  return await deriveHash(password, spice, 2500);
};

export { createLoginHash, loginPepper };
