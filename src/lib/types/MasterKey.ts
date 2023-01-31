export default interface MasterKey {
  cost: number,
  salt: string,
  wrappedKey: string
}
