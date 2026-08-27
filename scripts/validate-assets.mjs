import { access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { filmCatalog, manufacturers } from '../src/film-catalog.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const expected = new Set();

for (const manufacturer of manufacturers) {
  expected.add(manufacturer.logoPath);
}

for (const film of filmCatalog) {
  for (const packageImage of Object.values(film.packageImages)) expected.add(packageImage);
  for (const [format, versions] of Object.entries(film.formats)) {
    for (const versionId of versions) {
      expected.add(`frames/${format}/${film.modelId}-${versionId}.png`);
    }
  }
}

const missing = [];
for (const relativePath of expected) {
  try {
    await access(path.join(root, relativePath));
  } catch {
    missing.push(relativePath);
  }
}

if (missing.length) {
  console.error(`Missing ${missing.length} catalog assets:`);
  for (const relativePath of missing) console.error(`- ${relativePath}`);
  process.exitCode = 1;
} else {
  console.log(`Validated ${expected.size} catalog assets.`);
}
