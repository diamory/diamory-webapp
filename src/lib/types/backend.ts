interface Backend {
  init: () => Promise<void>;
  createMasterKeyFile: (content: string) => Promise<string>;
  updateMasterKeyFile: (content: string) => Promise<void>;
  putItem: (id: string, body: Uint8Array) => Promise<void>;
  getItem: (id: string) => Promise<Uint8Array>;
  deleteItem: (id: string) => Promise<void>;
  name: string;
}

type BackendConfig = Record<string, string | number | boolean | null>;

export { Backend, BackendConfig };
