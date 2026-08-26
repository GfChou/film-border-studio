import { decode, encode, hasPngSignature } from 'fast-png';
import UTIFModule from 'utif';

const UTIF = UTIFModule.default || UTIFModule;

self.onmessage = async (event) => {
  try {
    const { sourceBuffer, sourceType, frameUrl, aperture } = event.data;
    progress('正在解码原图...');
    const source = await decodeSource(new Uint8Array(sourceBuffer), sourceType);

    progress('正在解码 16-bit 边框...');
    const frameBytes = new Uint8Array(await (await fetch(frameUrl)).arrayBuffer());
    const frame = toRgba16(decode(frameBytes));

    progress('正在按画幅裁切并缩放...');
    const crop = cropRect(source.width, source.height, aperture.width / aperture.height);
    const photo = resizeRgba16(source, crop, aperture.width, aperture.height);

    progress('正在合成 16-bit 图像...');
    const output = new Uint16Array(frame.width * frame.height * 4);
    copyFrame(output, frame);
    pastePhoto(output, frame.width, photo, aperture.x, aperture.y);
    alphaCompositeFrame(output, frame);

    progress('正在编码 16-bit PNG...');
    const png = encode({
      width: frame.width,
      height: frame.height,
      data: output,
      depth: 16,
      channels: 4,
      text: {
        Software: 'Film Border Studio',
        PixelPipeline: `${source.depth}-bit source to 16-bit PNG`,
      },
    });
    self.postMessage({ type: 'done', blob: new Blob([png], { type: 'image/png' }) });
  } catch (error) {
    self.postMessage({ type: 'error', message: error.message || String(error) });
  }
};

function progress(message) {
  self.postMessage({ type: 'progress', message });
}

async function decodeSource(bytes, mime) {
  if (hasPngSignature(bytes)) {
    return toRgba16(decode(bytes));
  }
  if (isTiff(bytes, mime)) {
    const ifds = UTIF.decode(bytes.buffer);
    if (!ifds.length) throw new Error('TIFF 中没有可读取图像');
    UTIF.decodeImage(bytes.buffer, ifds[0]);
    return decodeTiffToRgba16(ifds[0]);
  }
  return decodeWithBrowser(bytes, mime);
}

function decodeTiffToRgba16(ifd) {
  const bits = Array.isArray(ifd.t258) ? ifd.t258 : [ifd.t258?.[0] || 8];
  const samples = ifd.t277?.[0] || bits.length || 1;
  const planar = ifd.t284?.[0] || 1;
  const photometric = ifd.t262?.[0] ?? 2;
  const sampleFormat = ifd.t339?.[0] || 1;
  const canReadNative16 =
    ifd.data &&
    bits.every((bit) => bit === 16) &&
    sampleFormat === 1 &&
    planar === 1 &&
    (samples === 1 || samples === 3 || samples === 4) &&
    (photometric === 1 || photometric === 2);

  if (!canReadNative16) {
    const rgba8 = UTIF.toRGBA8(ifd);
    return rgba8To16({ width: ifd.width, height: ifd.height, data: rgba8, depth: 8, channels: 4 });
  }

  const out = new Uint16Array(ifd.width * ifd.height * 4);
  const bytes = ifd.data;
  for (let i = 0, p = 0; i < ifd.width * ifd.height; i += 1) {
    if (samples === 1) {
      const v = readU16(bytes, i * 2, ifd.isLE);
      out[p++] = v; out[p++] = v; out[p++] = v; out[p++] = 65535;
    } else {
      const src = i * samples * 2;
      out[p++] = readU16(bytes, src, ifd.isLE);
      out[p++] = readU16(bytes, src + 2, ifd.isLE);
      out[p++] = readU16(bytes, src + 4, ifd.isLE);
      out[p++] = samples === 4 ? readU16(bytes, src + 6, ifd.isLE) : 65535;
    }
  }
  return { width: ifd.width, height: ifd.height, data: out, depth: 16 };
}

function readU16(bytes, offset, littleEndian) {
  if (littleEndian) return bytes[offset] | (bytes[offset + 1] << 8);
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function isTiff(bytes, mime) {
  return mime?.includes('tiff') || (
    bytes.length > 4 &&
    ((bytes[0] === 0x49 && bytes[1] === 0x49 && bytes[2] === 0x2a && bytes[3] === 0x00) ||
      (bytes[0] === 0x4d && bytes[1] === 0x4d && bytes[2] === 0x00 && bytes[3] === 0x2a))
  );
}

async function decodeWithBrowser(bytes, mime) {
  if (!self.createImageBitmap || !self.OffscreenCanvas) {
    throw new Error('当前浏览器不支持 Worker 图像解码');
  }
  const blob = new Blob([bytes], { type: mime || 'application/octet-stream' });
  const bitmap = await createImageBitmap(blob, { imageOrientation: 'from-image' });
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d', { colorSpace: 'display-p3', willReadFrequently: true }) || canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close?.();
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return rgba8To16({ width: canvas.width, height: canvas.height, data: imageData.data, depth: 8, channels: 4 });
}

function toRgba16(image) {
  if (image.depth === 8) return rgba8To16(image);
  if (image.depth !== 16) throw new Error(`不支持的 PNG 位深：${image.depth}`);

  const { width, height, channels, data } = image;
  if (channels === 4) return { width, height, data, depth: 16 };
  const out = new Uint16Array(width * height * 4);
  for (let i = 0, j = 0; i < width * height; i += 1) {
    if (channels === 1) {
      const v = data[i];
      out[j++] = v; out[j++] = v; out[j++] = v; out[j++] = 65535;
    } else if (channels === 2) {
      const v = data[i * 2];
      out[j++] = v; out[j++] = v; out[j++] = v; out[j++] = data[i * 2 + 1];
    } else if (channels === 3) {
      const k = i * 3;
      out[j++] = data[k]; out[j++] = data[k + 1]; out[j++] = data[k + 2]; out[j++] = 65535;
    } else {
      throw new Error(`不支持的通道数：${channels}`);
    }
  }
  return { width, height, data: out, depth: 16 };
}

function rgba8To16(image) {
  const { width, height, channels, data } = image;
  const out = new Uint16Array(width * height * 4);
  for (let i = 0, j = 0; i < width * height; i += 1) {
    if (channels === 4) {
      const k = i * 4;
      out[j++] = data[k] * 257;
      out[j++] = data[k + 1] * 257;
      out[j++] = data[k + 2] * 257;
      out[j++] = data[k + 3] * 257;
    } else if (channels === 3) {
      const k = i * 3;
      out[j++] = data[k] * 257;
      out[j++] = data[k + 1] * 257;
      out[j++] = data[k + 2] * 257;
      out[j++] = 65535;
    } else if (channels === 1) {
      const v = data[i] * 257;
      out[j++] = v; out[j++] = v; out[j++] = v; out[j++] = 65535;
    } else {
      throw new Error(`不支持的 8-bit 通道数：${channels}`);
    }
  }
  return { width, height, data: out, depth: 8 };
}

function cropRect(sw, sh, targetRatio) {
  const sourceRatio = sw / sh;
  if (sourceRatio > targetRatio) {
    const width = sh * targetRatio;
    return { x: (sw - width) / 2, y: 0, width, height: sh };
  }
  const height = sw / targetRatio;
  return { x: 0, y: (sh - height) / 2, width: sw, height };
}

function resizeRgba16(source, crop, targetWidth, targetHeight) {
  const out = new Uint16Array(targetWidth * targetHeight * 4);
  const xScale = crop.width / targetWidth;
  const yScale = crop.height / targetHeight;
  for (let y = 0; y < targetHeight; y += 1) {
    const sy = clamp(crop.y + (y + 0.5) * yScale - 0.5, 0, source.height - 1);
    const y0 = Math.floor(sy);
    const y1 = Math.min(source.height - 1, y0 + 1);
    const wy = sy - y0;
    for (let x = 0; x < targetWidth; x += 1) {
      const sx = clamp(crop.x + (x + 0.5) * xScale - 0.5, 0, source.width - 1);
      const x0 = Math.floor(sx);
      const x1 = Math.min(source.width - 1, x0 + 1);
      const wx = sx - x0;
      const dst = (y * targetWidth + x) * 4;
      const p00 = (y0 * source.width + x0) * 4;
      const p10 = (y0 * source.width + x1) * 4;
      const p01 = (y1 * source.width + x0) * 4;
      const p11 = (y1 * source.width + x1) * 4;
      for (let c = 0; c < 3; c += 1) {
        const top = source.data[p00 + c] * (1 - wx) + source.data[p10 + c] * wx;
        const bottom = source.data[p01 + c] * (1 - wx) + source.data[p11 + c] * wx;
        out[dst + c] = Math.round(top * (1 - wy) + bottom * wy);
      }
      out[dst + 3] = 65535;
    }
  }
  return { width: targetWidth, height: targetHeight, data: out };
}

function copyFrame(output, frame) {
  output.set(frame.data);
}

function pastePhoto(output, outWidth, photo, x0, y0) {
  for (let y = 0; y < photo.height; y += 1) {
    const outStart = ((y + y0) * outWidth + x0) * 4;
    const srcStart = y * photo.width * 4;
    output.set(photo.data.subarray(srcStart, srcStart + photo.width * 4), outStart);
  }
}

function alphaCompositeFrame(output, frame) {
  const data = frame.data;
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a === 0) continue;
    if (a === 65535) {
      output[i] = data[i];
      output[i + 1] = data[i + 1];
      output[i + 2] = data[i + 2];
      output[i + 3] = 65535;
      continue;
    }
    const inv = 65535 - a;
    output[i] = Math.round((data[i] * a + output[i] * inv) / 65535);
    output[i + 1] = Math.round((data[i + 1] * a + output[i + 1] * inv) / 65535);
    output[i + 2] = Math.round((data[i + 2] * a + output[i + 2] * inv) / 65535);
    output[i + 3] = 65535;
  }
}

function clamp(value, min, max) {
  return value < min ? min : value > max ? max : value;
}
