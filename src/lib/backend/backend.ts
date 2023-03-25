import { Backend, BackendConfig } from '../types/backend';
import { backends } from './backends';

const getBackend = async (backendName: string, config: BackendConfig): Promise<Backend> => {
  return new backends[backendName](config);
};

export { getBackend };
