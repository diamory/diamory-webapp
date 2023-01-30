import { scrypt } from "crypto";

const callback = (
  err: Error | null,
  key: Buffer,
  resolve: (value: Uint8Array | PromiseLike<Uint8Array>) => void,
  reject: (reason?: Error) => void
): void => {
  if (err) {
    reject(err);
    return;
  }
  resolve(key);
}

const deriveKey = (password: string, salt: string, keyLen: number, n: number, r: number, p: number): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    const params = { n, r, p };
    scrypt(
      Buffer.from(password, "utf8"),
      Buffer.from(salt, "utf8"),
      keyLen,
      params,
      (err, key) => {
        callback(err, key, resolve, reject);
      }
    );
  });
};

export { deriveKey };
