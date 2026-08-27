import { getManufacturers, getModels } from './film-catalog.js';

function assetUrl(path) {
  return `${import.meta.env.BASE_URL}${path}`;
}

function modelVisual(model) {
  if (!model.packageImage) {
    return `<div class="package-fallback" aria-hidden="true"><span>${model.shortName}</span></div>`;
  }
  return `<img src="${assetUrl(model.packageImage)}" alt="${model.name} 官方商品图" loading="lazy" />`;
}

export function renderFilmPicker(container, selection, callbacks) {
  const availableManufacturers = getManufacturers(selection.format);
  const models = getModels(selection.format, selection.manufacturerId);
  const selectedModel = models.find((model) => model.modelId === selection.modelId) || models[0];
  const showVersions = selectedModel.versions.length > 1;

  container.innerHTML = `
    <div class="picker-step">
      <div class="picker-label"><span>01</span>厂商</div>
      <div class="manufacturer-tabs" role="group" aria-label="胶片厂商">
        ${availableManufacturers.map((manufacturer) => `
          <button type="button" data-manufacturer="${manufacturer.manufacturerId}" aria-pressed="${selection.manufacturerId === manufacturer.manufacturerId}">
            <img src="${assetUrl(manufacturer.logoPath)}" alt="${manufacturer.name}" />
          </button>
        `).join('')}
      </div>
    </div>
    <div class="picker-step">
      <div class="picker-label"><span>02</span>胶片型号</div>
      <div class="model-grid" role="group" aria-label="胶片型号">
        ${models.map((model) => `
          <button type="button" class="model-card" data-model="${model.modelId}" aria-pressed="${selection.modelId === model.modelId}">
            <span class="package-visual">${modelVisual(model)}</span>
            <span class="model-copy">
              <strong>${model.shortName}</strong>
              <small>${model.details}</small>
            </span>
            <span class="selection-dot" aria-hidden="true"></span>
          </button>
        `).join('')}
      </div>
    </div>
    ${showVersions ? `
      <div class="picker-step version-step">
        <div class="picker-label"><span>03</span>边框编号</div>
        <div class="version-buttons" role="group" aria-label="边框编号">
          ${selectedModel.versions.map((version) => `
            <button type="button" data-version="${version.versionId}" aria-pressed="${selection.versionId === version.versionId}">${version.label}</button>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;

  container.querySelectorAll('.package-visual img').forEach((image) => {
    image.addEventListener('error', () => {
      image.closest('.package-visual').innerHTML = `<div class="package-fallback"><span>${image.alt.replace(' 官方商品图', '')}</span></div>`;
    }, { once: true });
  });

  container.onclick = (event) => {
    const manufacturer = event.target.closest('[data-manufacturer]');
    const modelButton = event.target.closest('[data-model]');
    const version = event.target.closest('[data-version]');
    if (manufacturer) callbacks.onManufacturer(manufacturer.dataset.manufacturer);
    if (modelButton) callbacks.onModel(modelButton.dataset.model);
    if (version) callbacks.onVersion(version.dataset.version);
  };
}
