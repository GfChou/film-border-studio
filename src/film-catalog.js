export const manufacturers = [
  { manufacturerId: 'kodak', name: 'Kodak', logoPath: 'brands/kodak.png' },
  { manufacturerId: 'fujifilm', name: 'Fujifilm', logoPath: 'brands/fujifilm.png' },
  { manufacturerId: 'cinestill', name: 'CineStill', logoPath: 'brands/cinestill.png' },
  { manufacturerId: 'harman', name: 'HARMAN', logoPath: 'brands/harman.png' },
];

const packageArt = (filename, groups) => Object.fromEntries(
  groups.map((group) => [group, `packages/illustrated/${group}/${filename}.png`]),
);

const model = (modelId, manufacturerId, name, shortName, details, formats, packageImages) => ({
  modelId,
  manufacturerId,
  name,
  shortName,
  details,
  packageImages,
  formats,
});

export const filmCatalog = [
  model('100tmx', 'kodak', 'KODAK PROFESSIONAL T-MAX 100 Film', 'T-MAX 100', '黑白负片 · ISO 100', {
    645: ['0'], 66: ['0'], 67: ['0'], 68: ['0'], 69: ['0'],
  }, packageArt('tmax100', ['120'])),
  model('5294', 'kodak', 'KODAK EKTACHROME 100D Color Reversal Film 5294', 'EKTACHROME 100D 5294', '电影彩色反转片 · ISO 100', {
    135: ['0', '1'],
  }, packageArt('5294', ['135'])),
  model('e100', 'kodak', 'KODAK PROFESSIONAL EKTACHROME E100 Color Reversal Film', 'EKTACHROME E100', '彩色反转片 · ISO 100', {
    645: ['0', '1'], 66: ['0', '1'], 67: ['0', '1'], 68: ['0', '1'], 69: ['0', '1'],
  }, packageArt('e100', ['120'])),
  model('e100vs', 'kodak', 'KODAK PROFESSIONAL EKTACHROME E100VS Color Reversal Film', 'EKTACHROME E100VS', '彩色反转片 · ISO 100', {
    135: ['0'], 645: ['0'], 66: ['0'], 67: ['0'], 68: ['0'], 69: ['0'],
  }, packageArt('e100vs', ['135', '120'])),
  model('ektar100', 'kodak', 'KODAK PROFESSIONAL EKTAR 100 Film', 'EKTAR 100', '彩色负片 · ISO 100', {
    135: ['0'],
  }, packageArt('ektar100', ['135'])),
  model('gold200', 'kodak', 'KODAK GOLD 200 Film', 'GOLD 200', '彩色负片 · ISO 200', {
    135: ['0', '1', '2', '3'],
  }, packageArt('gold200', ['135'])),
  model('portra160', 'kodak', 'KODAK PROFESSIONAL PORTRA 160 Film', 'PORTRA 160', '彩色负片 · ISO 160', {
    135: ['0'],
  }, packageArt('portra160', ['135'])),
  model('portra400', 'kodak', 'KODAK PROFESSIONAL PORTRA 400 Film', 'PORTRA 400', '彩色负片 · ISO 400', {
    645: ['0'], 66: ['0'], 67: ['0'], 68: ['0'], 69: ['0'],
  }, packageArt('portra400', ['120'])),
  model('ultra100', 'kodak', 'KODAK PROFESSIONAL Ultra Color 100UC Film', 'Ultra Color 100UC', '彩色负片 · ISO 100', {
    645: ['0'], 66: ['0'], 67: ['0'], 68: ['0'], 69: ['0'],
  }, {}),
  model('ultramax400', 'kodak', 'KODAK ULTRAMAX 400 Film', 'ULTRAMAX 400', '彩色负片 · ISO 400', {
    135: ['0'],
  }, packageArt('ultramax400', ['135'])),
  model('c100', 'fujifilm', 'FUJICOLOR 100 Color Negative Film', 'FUJICOLOR 100', '彩色负片 · ISO 100', {
    135: ['0'],
  }, packageArt('fujicolor100', ['135'])),
  model('rdpiii', 'fujifilm', 'FUJICHROME PROVIA 100F Professional', 'PROVIA 100F', '彩色反转片 · ISO 100', {
    135: ['0'], 645: ['0'], 66: ['0'], 67: ['0'], 68: ['0'], 69: ['0'],
  }, packageArt('provia100f', ['135', '120'])),
  model('rvp100', 'fujifilm', 'FUJICHROME Velvia 100 Professional', 'Velvia 100', '彩色反转片 · ISO 100', {
    135: ['0'],
  }, packageArt('velvia100', ['135'])),
  model('rvp50', 'fujifilm', 'FUJICHROME Velvia 50 Professional', 'Velvia 50', '彩色反转片 · ISO 50', {
    135: ['0'], 645: ['0'], 66: ['0'], 67: ['0'], 68: ['0'], 69: ['0'],
  }, packageArt('velvia50', ['135', '120'])),
  model('cinestill800t', 'cinestill', 'CineStill 800Tungsten Color Negative Film', '800Tungsten', '电影彩色负片 · ISO 800', {
    135: ['0', '1', '2'], 645: ['0'], 66: ['0'], 67: ['0'], 68: ['0'], 69: ['0'],
  }, packageArt('cinestill800t', ['135', '120'])),
  model('phoenix200ii', 'harman', 'HARMAN Phoenix II Color Film', 'Phoenix II', '彩色负片 · ISO 200', {
    135: ['0'],
  }, packageArt('phoenix200ii', ['135'])),
];

function versionsFor(entry, format) {
  return (entry.formats[format] || []).map((versionId) => ({
    versionId,
    label: String(Number(versionId) + 1).padStart(2, '0'),
    framePath: `frames/${format}/${entry.modelId}-${versionId}.png`,
  }));
}

function packageImageFor(entry, format) {
  const group = format === '135' ? '135' : '120';
  return entry.packageImages[group] || null;
}

export function getManufacturers(format) {
  const available = new Set(filmCatalog.filter((entry) => entry.formats[format]).map((entry) => entry.manufacturerId));
  return manufacturers.filter((manufacturer) => available.has(manufacturer.manufacturerId));
}

export function getModels(format, manufacturerId) {
  return filmCatalog
    .filter((entry) => entry.manufacturerId === manufacturerId && entry.formats[format])
    .map((entry) => ({
      ...entry,
      packageImage: packageImageFor(entry, format),
      versions: versionsFor(entry, format),
    }));
}

export function normalizeFilmSelection(selection) {
  const format = ['135', '645', '66', '67', '68', '69'].includes(selection.format) ? selection.format : '67';
  const availableManufacturers = getManufacturers(format);
  const requestedModel = filmCatalog.find(
    (entry) => entry.modelId === selection.modelId && entry.formats[format],
  );
  const manufacturerId = requestedModel?.manufacturerId
    || (availableManufacturers.some((entry) => entry.manufacturerId === selection.manufacturerId)
      ? selection.manufacturerId
      : availableManufacturers[0].manufacturerId);
  const models = getModels(format, manufacturerId);
  const selectedModel = models.find((entry) => entry.modelId === selection.modelId) || models[0];
  const selectedVersion = selectedModel.versions.find((entry) => entry.versionId === selection.versionId)
    || selectedModel.versions[0];

  return {
    format,
    manufacturerId,
    modelId: selectedModel.modelId,
    versionId: selectedVersion.versionId,
  };
}

export function resolveFilm(selection) {
  const normalized = normalizeFilmSelection(selection);
  const selectedModel = getModels(normalized.format, normalized.manufacturerId)
    .find((entry) => entry.modelId === normalized.modelId);
  const selectedVersion = selectedModel.versions
    .find((entry) => entry.versionId === normalized.versionId);

  return {
    ...selectedModel,
    ...selectedVersion,
    format: normalized.format,
  };
}
