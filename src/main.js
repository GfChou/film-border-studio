import './styles.css';
import { normalizeFilmSelection, resolveFilm } from './film-catalog.js';
import { renderFilmPicker } from './film-picker.js';

const formatFamilies = ['135', '120'];
const mediumFormats = ['645', '66', '67', '68', '69'];

const apertures = {
  '135': { width: 6000, height: 4000, x: 120, y: 820 },
  '645': { width: 6000, height: 4500, x: 240, y: 240 },
  '66': { width: 5500, height: 5500, x: 240, y: 240 },
  '67': { width: 7000, height: 5500, x: 240, y: 240 },
  '68': { width: 8000, height: 5500, x: 240, y: 240 },
  '69': { width: 9000, height: 5500, x: 240, y: 240 },
};

const qualityPresets = {
  standard: { label: '标准', value: 0.82 },
  high: { label: '高', value: 0.94 },
  lossless: { label: '无损', value: 1 },
};

const state = {
  format: '67',
  manufacturerId: 'fujifilm',
  modelId: 'rdpiii',
  versionId: '0',
  quality: 'high',
  exportType: 'image/png',
  exportEngine: 'canvas',
  orientation: 'landscape',
  last120Format: '67',
  imageFile: null,
  sourceBitmap: null,
  frameBitmap: null,
};

const app = document.querySelector('#app');
app.innerHTML = `
  <div class="app">
    <aside class="panel">
      <div class="brand">
        <img src="${import.meta.env.BASE_URL}brand/film-border-studio-logo.png" alt="Film Border Studio" />
        <p>导入照片，套用已制作的胶片边框，并按所选画幅自动居中裁切。</p>
      </div>

      <div class="control">
        <label>照片</label>
        <div class="file-zone">
          <input id="fileInput" type="file" accept="image/*,.tif,.tiff,.heic,.heif,.avif" />
          <div>
            <strong>选择或拖入照片</strong>
            <span id="fileName">支持浏览器可解码的图片格式</span>
          </div>
        </div>
      </div>

      <div class="control">
        <div class="section-title">画幅</div>
        <div class="format-picker">
          <div class="segmented format-family" id="formatFamilyButtons"></div>
          <div class="segmented format-submenu" id="formatButtons"></div>
        </div>
      </div>

      <div class="control">
        <div class="section-title">方向</div>
        <div class="segmented orientation" id="orientationButtons"></div>
      </div>

      <div class="control">
        <div class="section-title">胶片</div>
        <div id="filmPicker" class="film-picker"></div>
      </div>

      <div class="control">
        <div class="section-title">画质</div>
        <div class="qualities" id="qualityButtons"></div>
      </div>

      <div class="control">
        <div class="section-title">导出格式</div>
        <div class="format-grid">
          <label><input type="radio" name="exportType" value="image/png" checked />PNG</label>
          <label><input type="radio" name="exportType" value="image/jpeg" />JPEG</label>
          <label><input type="radio" name="exportType" value="image/webp" />WebP</label>
          <label><input type="radio" name="exportType" value="image/png16" />16-bit PNG</label>
        </div>
      </div>

      <button class="primary" id="exportButton" disabled>导出照片</button>
      <div class="status" id="status"></div>
    </aside>

    <section class="workspace">
      <div class="topbar">
        <h2 id="previewTitle">预览</h2>
        <div class="meta" id="previewMeta"></div>
      </div>
      <div class="stage" id="stage">
        <div class="empty">
          <strong>尚未导入照片</strong>
          <div class="hint">选择照片后会自动裁切到当前画幅并叠加边框。</div>
        </div>
      </div>
    </section>
  </div>
`;

const formatFamilyButtons = document.querySelector('#formatFamilyButtons');
const formatButtons = document.querySelector('#formatButtons');
const orientationButtons = document.querySelector('#orientationButtons');
const filmPicker = document.querySelector('#filmPicker');
const qualityButtons = document.querySelector('#qualityButtons');
const fileInput = document.querySelector('#fileInput');
const fileName = document.querySelector('#fileName');
const stage = document.querySelector('#stage');
const statusEl = document.querySelector('#status');
const exportButton = document.querySelector('#exportButton');
const previewTitle = document.querySelector('#previewTitle');
const previewMeta = document.querySelector('#previewMeta');

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d', { colorSpace: 'display-p3' }) || canvas.getContext('2d');
let frameLoadRequestId = 0;

function setStatus(message) {
  statusEl.textContent = message;
}

function frameUrl() {
  return `${import.meta.env.BASE_URL}${resolveFilm(state).framePath}`;
}

function safeFilmName() {
  return resolveFilm(state).shortName
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function shouldUsePortraitFrame() {
  return state.format !== '66' && state.orientation === 'portrait';
}

function rotateApertureClockwise(aperture, frameWidth, frameHeight) {
  return {
    width: aperture.height,
    height: aperture.width,
    x: frameHeight - aperture.y - aperture.height,
    y: aperture.x,
  };
}

function effectiveLayout(frame) {
  const baseAperture = apertures[state.format];
  const rotateFrame = shouldUsePortraitFrame();
  if (!rotateFrame) {
    return {
      aperture: baseAperture,
      outputWidth: frame.width,
      outputHeight: frame.height,
      rotateFrame: false,
    };
  }
  return {
    aperture: rotateApertureClockwise(baseAperture, frame.width, frame.height),
    outputWidth: frame.height,
    outputHeight: frame.width,
    rotateFrame: true,
  };
}

function renderControls() {
  const activeFamily = state.format === '135' ? '135' : '120';
  formatFamilyButtons.innerHTML = formatFamilies.map((family) => (
    `<button type="button" class="${activeFamily === family ? 'active' : ''}" data-format-family="${family}">${family}</button>`
  )).join('');
  formatButtons.hidden = activeFamily !== '120';
  formatButtons.innerHTML = mediumFormats.map((format) => (
    `<button type="button" class="${state.format === format ? 'active' : ''}" data-format="${format}">${format}</button>`
  )).join('');

  qualityButtons.innerHTML = Object.entries(qualityPresets).map(([key, preset]) => (
    `<button type="button" class="${state.quality === key ? 'active' : ''}" data-quality="${key}">${preset.label}</button>`
  )).join('');

  const effectiveOrientation = state.format === '66' ? 'landscape' : state.orientation;
  orientationButtons.innerHTML = [
    ['landscape', '横向'],
    ['portrait', '竖向'],
  ].map(([key, label]) => (
    `<button type="button" class="${effectiveOrientation === key ? 'active' : ''}" data-orientation="${key}" ${state.format === '66' && key === 'portrait' ? 'disabled' : ''}>${label}</button>`
  )).join('');

  renderFilmPicker(filmPicker, state, {
    onManufacturer(manufacturerId) {
      Object.assign(state, normalizeFilmSelection({ ...state, manufacturerId, modelId: null, versionId: null }));
      renderControls();
      void drawPreview();
    },
    onModel(modelId) {
      Object.assign(state, normalizeFilmSelection({ ...state, modelId, versionId: null }));
      renderControls();
      void drawPreview();
    },
    onVersion(versionId) {
      Object.assign(state, normalizeFilmSelection({ ...state, versionId }));
      renderControls();
      void drawPreview();
    },
  });
}

async function loadBitmapFromUrl(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('边框素材加载失败');
  const blob = await response.blob();
  return createImageBitmap(blob);
}

async function loadImageFile(file) {
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.decoding = 'async';
      image.src = url;
      await image.decode();
      return image;
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

function cropSourceRect(source, targetRatio) {
  const sw = source.width;
  const sh = source.height;
  const sourceRatio = sw / sh;
  if (sourceRatio > targetRatio) {
    const width = sh * targetRatio;
    return { x: (sw - width) / 2, y: 0, width, height: sh };
  }
  const height = sw / targetRatio;
  return { x: 0, y: (sh - height) / 2, width: sw, height };
}

async function drawPreview() {
  const requestId = ++frameLoadRequestId;
  exportButton.disabled = true;
  const selectedFilm = resolveFilm(state);
  const baseAperture = apertures[state.format];
  const versionNote = selectedFilm.versions.length > 1 ? ` · ${selectedFilm.label}` : '';
  previewTitle.textContent = `${state.format} · ${selectedFilm.shortName}${versionNote}`;
  previewMeta.textContent = `${baseAperture.width} x ${baseAperture.height}`;
  if (!state.sourceBitmap) return;
  setStatus('正在加载边框素材...');

  let nextFrame;
  try {
    nextFrame = await loadBitmapFromUrl(frameUrl());
  } catch (error) {
    if (requestId === frameLoadRequestId) setStatus(error.message);
    return;
  }
  if (requestId !== frameLoadRequestId) {
    nextFrame.close?.();
    return;
  }
  state.frameBitmap?.close?.();
  state.frameBitmap = nextFrame;
  const layout = effectiveLayout(state.frameBitmap);
  const aperture = layout.aperture;
  canvas.width = layout.outputWidth;
  canvas.height = layout.outputHeight;
  previewMeta.textContent = `${aperture.width} x ${aperture.height}${layout.rotateFrame ? ' · 竖版边框' : ''}`;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const crop = cropSourceRect(state.sourceBitmap, aperture.width / aperture.height);
  ctx.drawImage(
    state.sourceBitmap,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    aperture.x,
    aperture.y,
    aperture.width,
    aperture.height,
  );
  if (layout.rotateFrame) {
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(state.frameBitmap, 0, 0);
    ctx.restore();
  } else {
    ctx.drawImage(state.frameBitmap, 0, 0);
  }

  if (!canvas.parentNode) {
    stage.innerHTML = '';
    stage.appendChild(canvas);
  }

  exportButton.disabled = false;
  const orientationNote = layout.rotateFrame ? '已使用竖向边框。' : '当前使用横向边框。';
  const hdrNote = supportsWideGamut() ? '当前浏览器支持宽色域显示。' : '当前浏览器未报告宽色域支持；HDR 会按浏览器能力降级。';
  setStatus(`${orientationNote} ${hdrNote}`);
}

function supportsWideGamut() {
  return window.matchMedia?.('(color-gamut: p3)').matches;
}

function exportExtension(type) {
  if (type === 'image/png16') return 'png';
  if (type === 'image/jpeg') return 'jpg';
  if (type === 'image/webp') return 'webp';
  return 'png';
}

function canvasToBlob(canvasEl, type, quality) {
  return new Promise((resolve) => {
    if (type === 'image/png') {
      canvasEl.toBlob(resolve, 'image/png');
    } else {
      canvasEl.toBlob(resolve, type, quality);
    }
  });
}

async function exportImage() {
  if (!state.sourceBitmap || !state.frameBitmap) return;
  exportButton.disabled = true;
  setStatus('正在导出...');
  const quality = qualityPresets[state.quality].value;
  const type = state.exportType;
  if (type === 'image/png16') {
    await exportSixteenBitPng();
    exportButton.disabled = false;
    return;
  }
  const blob = await canvasToBlob(canvas, type, quality);
  if (!blob) {
    setStatus('当前浏览器不支持所选导出格式。');
    exportButton.disabled = false;
    return;
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const original = state.imageFile?.name?.replace(/\.[^.]+$/, '') || 'photo';
  link.href = url;
  link.download = `${original}_${state.format}_${safeFilmName()}.${exportExtension(type)}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setStatus('已导出。');
  exportButton.disabled = false;
}

function runHighDepthExport(payload) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./worker-16bit.js', import.meta.url), { type: 'module' });
    worker.onmessage = (event) => {
      const { type, message, blob } = event.data;
      if (type === 'progress') setStatus(message);
      if (type === 'done') {
        worker.terminate();
        resolve(blob);
      }
      if (type === 'error') {
        worker.terminate();
        reject(new Error(message));
      }
    };
    worker.onerror = (event) => {
      worker.terminate();
      reject(new Error(event.message || '16-bit 导出失败'));
    };
    worker.postMessage(payload, [payload.sourceBuffer]);
  });
}

async function exportSixteenBitPng() {
  try {
    const layout = effectiveLayout(state.frameBitmap);
    const sourceBuffer = await state.imageFile.arrayBuffer();
    const blob = await runHighDepthExport({
      sourceBuffer,
      sourceType: state.imageFile.type,
      frameUrl: frameUrl(),
      aperture: layout.aperture,
      rotateFrame: layout.rotateFrame,
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const original = state.imageFile?.name?.replace(/\.[^.]+$/, '') || 'photo';
    link.href = url;
    link.download = `${original}_${state.format}_${safeFilmName()}_16bit.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus('已导出 16-bit PNG。');
  } catch (error) {
    setStatus(`16-bit PNG 导出失败：${error.message}`);
  }
}

formatFamilyButtons.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-format-family]');
  if (!button) return;
  const format = button.dataset.formatFamily === '135' ? '135' : state.last120Format;
  Object.assign(state, normalizeFilmSelection({ ...state, format }));
  renderControls();
  await drawPreview();
});

formatButtons.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-format]');
  if (!button) return;
  state.last120Format = button.dataset.format;
  Object.assign(state, normalizeFilmSelection({ ...state, format: button.dataset.format }));
  renderControls();
  await drawPreview();
});

qualityButtons.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-quality]');
  if (!button) return;
  state.quality = button.dataset.quality;
  renderControls();
});

orientationButtons.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-orientation]');
  if (!button || button.disabled) return;
  state.orientation = button.dataset.orientation;
  renderControls();
  await drawPreview();
});

document.querySelectorAll('input[name="exportType"]').forEach((input) => {
  input.addEventListener('change', () => {
    state.exportType = input.value;
    if (state.exportType === 'image/png16') {
      state.quality = 'lossless';
      renderControls();
    }
  });
});

fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  state.imageFile = file;
  fileName.textContent = file.name;
  setStatus('正在读取照片...');
  try {
    state.sourceBitmap = await loadImageFile(file);
    await drawPreview();
  } catch (error) {
    setStatus(`无法读取这张照片：${error.message}`);
  }
});

exportButton.addEventListener('click', exportImage);

renderControls();
void drawPreview();
setStatus('普通导出走 Canvas；16-bit PNG 会在浏览器本地用独立像素管线合成，PNG16 输入可保留 16-bit 像素精度。');
