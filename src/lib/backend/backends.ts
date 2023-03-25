import { S3Backend } from './backends/S3Backend';

type BackendClass = typeof S3Backend /* | typeof OtherBackend | ... */;

const backends: Record<string, BackendClass> = { S3Backend /* , OtherBackend, ... */ };

export { backends };
