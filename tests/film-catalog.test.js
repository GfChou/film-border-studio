import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getModels,
  normalizeFilmSelection,
  resolveFilm,
} from '../src/film-catalog.js';

test('catalog exposes every numbered 135 Gold 200 frame', () => {
  const gold = getModels('135', 'kodak').find((model) => model.modelId === 'gold200');

  assert.deepEqual(gold.versions.map((version) => version.versionId), ['0', '1', '2', '3']);
  assert.equal(gold.versions[2].framePath, 'frames/135/gold200-2.png');
});

test('catalog exposes CineStill and E100 frame variants', () => {
  const cinestill = getModels('135', 'cinestill').find((model) => model.modelId === 'cinestill800t');
  const e100 = getModels('645', 'kodak').find((model) => model.modelId === 'e100');

  assert.deepEqual(cinestill.versions.map((version) => version.versionId), ['0', '1', '2']);
  assert.deepEqual(e100.versions.map((version) => version.versionId), ['0', '1']);
});

test('catalog exposes every 67 master in 68 and 69 formats', () => {
  const e10068 = getModels('68', 'kodak').find((model) => model.modelId === 'e100');
  const e10069 = getModels('69', 'kodak').find((model) => model.modelId === 'e100');

  assert.deepEqual(e10068.versions.map((version) => version.versionId), ['0', '1']);
  assert.equal(e10068.versions[1].framePath, 'frames/68/e100-1.png');
  assert.deepEqual(e10069.versions.map((version) => version.versionId), ['0', '1']);
  assert.equal(e10069.versions[1].framePath, 'frames/69/e100-1.png');
});

test('format changes preserve a model when that model remains available', () => {
  const selection = normalizeFilmSelection({
    format: '645',
    manufacturerId: 'fujifilm',
    modelId: 'rdpiii',
    versionId: '0',
  });

  assert.deepEqual(selection, {
    format: '645',
    manufacturerId: 'fujifilm',
    modelId: 'rdpiii',
    versionId: '0',
  });
});

test('68 and 69 are accepted as normalized formats', () => {
  for (const format of ['68', '69']) {
    const selection = normalizeFilmSelection({
      format,
      manufacturerId: 'fujifilm',
      modelId: 'rdpiii',
      versionId: '0',
    });

    assert.equal(selection.format, format);
    assert.equal(selection.modelId, 'rdpiii');
  }
});

test('format changes fall back deterministically when a model is unavailable', () => {
  const selection = normalizeFilmSelection({
    format: '67',
    manufacturerId: 'kodak',
    modelId: 'gold200',
    versionId: '3',
  });
  const resolved = resolveFilm(selection);

  assert.equal(selection.manufacturerId, 'kodak');
  assert.equal(selection.modelId, '100tmx');
  assert.equal(selection.versionId, '0');
  assert.equal(resolved.framePath, 'frames/67/100tmx-0.png');
});
