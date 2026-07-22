// src/utils/composer.js

export const FRAME_OPTIONS = [
  {
    id: 'frame0001',
    name: 'FRAME 0001',
    color: '#ffffff',
    preview: '/frames/frame_0001_button.png',
    src: '/frames/frame_0001.png',
  },
  {
    id: 'frame0002',
    name: 'FRAME 0002',
    color: '#ffffff',
    preview: '/frames/frame_0002_button.png',
    src: '/frames/frame_0002.png',
  },
];

export const FILTER_OPTIONS = [
  { id: 'original', name: '원본', swatch: 'linear-gradient(135deg,#f7f7f7,#d8dde3)' },
  { id: 'warm', name: '따뜻하게', swatch: 'linear-gradient(135deg,#ffd2a5,#a56a43)' },
  { id: 'cool', name: '시원하게', swatch: 'linear-gradient(135deg,#b9ddff,#536b91)' },
  { id: 'mono', name: '흑백', swatch: 'linear-gradient(135deg,#f5f5f5,#252525)' },
  { id: 'vivid', name: '선명하게', swatch: 'linear-gradient(135deg,#ff8f8f,#5a7dff)' },
];

const FILTER_MAP = {
  original: 'none',
  warm: 'sepia(.18) saturate(1.12) contrast(1.03)',
  cool: 'saturate(.9) hue-rotate(8deg) contrast(1.04)',
  mono: 'grayscale(1) contrast(1.08)',
  vivid: 'saturate(1.28) contrast(1.05)',
};

export const LAYOUT = {
  canvasWidth: 1152,
  canvasHeight: 2048,
  areas: [
    { x: 70, y: 84, width: 492, height: 732 },
    { x: 590, y: 84, width: 492, height: 732 },
    { x: 70, y: 842, width: 492, height: 734 },
    { x: 590, y: 842, width: 492, height: 734 }
  ],
  borderRadius: 0,
  backgroundColor: '#ffffff'
};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawImageCover(ctx, img, x, y, w, h, radius = 0) {
  ctx.save();
  if (radius > 0) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.clip();
  }

  const imgRatio = img.width / img.height;
  const areaRatio = w / h;
  let sx, sy, sw, sh;

  if (imgRatio > areaRatio) {
    sh = img.height;
    sw = sh * areaRatio;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = sw / areaRatio;
    sx = 0;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  ctx.restore();
}

export async function compose(canvas, photos, frameId = 'frame0001', filterId = 'original') {
  const ctx = canvas.getContext('2d');
  canvas.width = LAYOUT.canvasWidth;
  canvas.height = LAYOUT.canvasHeight;

  const frame = FRAME_OPTIONS.find(option => option.id === frameId) || FRAME_OPTIONS[0];
  ctx.fillStyle = frame.color || LAYOUT.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const areas = LAYOUT.areas;
  const photoImages = await Promise.all(
    photos.slice(0, 4).map(src => src ? loadImage(src) : null)
  );

  for (let i = 0; i < 4; i++) {
    const area = areas[i];
    if (photoImages[i]) {
      ctx.filter = FILTER_MAP[filterId] || 'none';
      drawImageCover(ctx, photoImages[i], area.x, area.y, area.width, area.height, LAYOUT.borderRadius);
      ctx.filter = 'none';
    } else {
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(area.x, area.y, area.width, area.height);
    }
  }

  try {
    const frameImg = await loadImage(frame.src);
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
  } catch (e) {
    console.warn('Frame image load failed:', e);
  }

  return canvas;
}

export function canvasToBase64(canvas, quality = 0.92) {
  return canvas.toDataURL('image/jpeg', quality);
}

export function generateDefaultFrame() { return null; }
export function generateFrameThumbnail(id) { 
  return FRAME_OPTIONS.find(option => option.id === id)?.preview || FRAME_OPTIONS[0].preview;
}
