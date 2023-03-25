import { Backend, BackendConfig } from '../../types/backend';

class S3Backend implements Backend {
  public name = 'S3Backend';
  private _config: BackendConfig;

  constructor(config: BackendConfig) {
    this._config = config;
  }

  public init = async (): Promise<void> => {
    // TODO: implement
  };

  public createMasterKeyFile = async (content: string): Promise<string> => {
    // TODO: implement
    return '';
  };

  public updateMasterKeyFile = async (content: string): Promise<void> => {
    // TODO: implement
  };

  public putItem = async (id: string, body: Uint8Array): Promise<void> => {
    // TODO: implement
  };

  public getItem = async (id: string): Promise<Uint8Array> => {
    // TODO: implement
    return new Uint8Array();
  };

  public deleteItem = async (id: string): Promise<void> => {
    // TODO: implement
  };
}

export { S3Backend };
