import { getRandomValues } from "./webcrypto";
import { encrypt, decrypt } from "./aesgcm";

const chunkLength = 32_768; //32Kib

const createAssociatedData = (id: string, n: number): Uint8Array => {
  const nFirstByte = Math.floor(n / 256)
  const nSecondByte = n - nFirstByte;
  const nAsTwoByte = new Uint8Array([ nFirstByte, nSecondByte ]);
  return Buffer.concat([
    Buffer.from(id, "utf8"),
    nAsTwoByte
  ]);
};

const createHeaderPayload = (contentKey: Uint8Array): Uint8Array => Buffer.concat([ 
    Buffer.from("ff".repeat(8), "hex"),
    contentKey
]);

const encryptChunk = async (data: Uint8Array, contentKey: Uint8Array, id: string, chunkNo: number): Promise<Uint8Array[]> => {
  const chunkStart = (chunkNo - 1) * chunkLength;
  const chunkStop = Math.min(chunkStart + chunkLength, data.length);
  const chunkNonce = getRandomValues(new Uint8Array(12));
  const chunkPayload = data.subarray(chunkStart, chunkStop);
  const chunkAdditionalData = createAssociatedData(id, chunkNo);
  const chunkCipherAndTag = await encrypt(chunkPayload, contentKey, chunkNonce, chunkAdditionalData);
  return [ chunkNonce, chunkCipherAndTag ];
};

const encryptData = async (data: Uint8Array, key: Uint8Array, id: string): Promise<Uint8Array> => {
  const dataLength = data.length;
  const chunkN = Math.ceil(dataLength / chunkLength);
  const headerNonce = getRandomValues(new Uint8Array(12));
  const contentKey = getRandomValues(new Uint8Array(32));
  const headerPayload = createHeaderPayload(contentKey);
  const headerAdditionalData = createAssociatedData(id, chunkN);
  const headerCipherAndTag = await encrypt(headerPayload, key, headerNonce, headerAdditionalData);
  const toJoin = [ headerNonce, headerCipherAndTag ];
  
  for (let chunkNo = 1; chunkNo <= chunkN; chunkNo++) {
    const [ nonce, cipherAndTag ] = await encryptChunk(data, contentKey, id, chunkNo);
    toJoin.push(nonce, cipherAndTag);
  }

  return Buffer.concat(toJoin);
};

const decryptChunk = async (data: Uint8Array, contentKey: Uint8Array, id: string, chunkNo: number): Promise<Uint8Array> => {
  const chunkStart = (chunkNo - 1) * (chunkLength + 28) + 68;
  const chunkStop = Math.min(chunkStart + chunkLength + 28, data.length);
  const chunkNonce = data.subarray(chunkStart, chunkStart + 12);
  const chunkCipherAndTag = data.subarray(chunkStart + 12, chunkStop);
  const chunkAdditionalData = createAssociatedData(id, chunkNo);
  return await decrypt(chunkCipherAndTag, contentKey, chunkNonce, chunkAdditionalData);
};

const decryptData = async (data: Uint8Array, key: Uint8Array, id: string): Promise<Uint8Array> => {
  const dataLength = data.length;
  const chunkN = Math.ceil((dataLength - 68) / (chunkLength + 28 ));
  const headerNonce = data.subarray(0, 12);
  const headerCipherAndTag = data.subarray(12, 68);
  const headerAdditionalData = createAssociatedData(id, chunkN);
  const contentKey = (await decrypt(headerCipherAndTag, key, headerNonce, headerAdditionalData)).subarray(8, 40);
  const toJoin = [];
  
  for (let chunkNo = 1; chunkNo <= chunkN; chunkNo++) {
    toJoin.push(await decryptChunk(data, contentKey, id, chunkNo));
  }

  return Buffer.concat(toJoin);
}

export { encryptData, decryptData };
