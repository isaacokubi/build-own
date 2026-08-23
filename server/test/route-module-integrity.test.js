import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const routesDir = join(dirname(fileURLToPath(import.meta.url)), '../src/routes');

test('all route modules load successfully', async () => {
  const files = (await readdir(routesDir)).filter((name) => name.endsWith('.js')).sort();
  assert.ok(files.length > 0, 'No route modules found');

  const failures = [];
  for (const file of files) {
    try {
      await import(pathToFileURL(join(routesDir, file)).href);
    } catch (error) {
      failures.push(`${file}: ${error?.message || error}`);
    }
  }

  assert.deepEqual(failures, [], `Route module load failures:\n${failures.join('\n')}`);
});
