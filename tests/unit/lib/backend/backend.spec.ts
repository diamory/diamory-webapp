import { assert } from 'assertthat';
import { getBackend } from '@/lib/backend/backend';

describe('Backend - General', (): void => {
  test('returns S3Backend correctly.', async (): Promise<void> => {
    const backendName = 'S3Backend';

    const backend = await getBackend(backendName, {});

    assert.that(backend.name).is.equalTo(backendName);
  });
});
