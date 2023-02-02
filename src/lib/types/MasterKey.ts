export default interface MasterKey {
  version: string,
  cost: number,
  salt: string,
  wrappedEncryptionKey: string,
  wrappedVersionMacKey: string,
  versionMac: string
}
