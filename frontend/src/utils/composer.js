// src/utils/composer.js

export const FRAME_OPTIONS = [
  { id: 'clean', name: '클린 화이트', color: '#ffffff' },
  { id: 'mono', name: '모노 블랙', color: '#14171a' },
  { id: 'winning', name: 'WINNING ALL', color: '#f4d56b', preview: '/frames/custom_frame.png' },
  { id: 'sky', name: '스카이 블루', color: '#a9c9ff' },
  { id: 'sage', name: '세이지 그린', color: '#c7d5b5' },
  { id: 'peach', name: '피치 코랄', color: '#ffc7ae' },
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

function drawSimpleFrame(ctx, frameId, width, height) {
  const isMono = frameId === 'mono';
  ctx.fillStyle = isMono ? '#ffffff' : '#191f28';
  ctx.textAlign = 'center';
  ctx.font = '800 62px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText('JR SELF STUDIO', width / 2, 1770);
  ctx.font = '500 26px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.letterSpacing = '5px';
  ctx.fillText('FOUR MOMENTS, ONE FRAME', width / 2, 1832);
  ctx.fillStyle = isMono ? '#9aa2aa' : '#8b95a1';
  ctx.font = '500 22px -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(new Date().toLocaleDateString('ko-KR'), width / 2, 1912);
}

export async function compose(canvas, photos, frameId = 'clean', filterId = 'original') {
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

  if (frameId === 'winning') {
    try {
      const frameImg = await loadImage('/frames/custom_frame.png');
      ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
    } catch (e) {
      console.warn('Frame image load failed:', e);
    }
  } else {
    drawSimpleFrame(ctx, frameId, canvas.width, canvas.height);
  }

  return canvas;
}

export function canvasToBase64(canvas, quality = 0.92) {
  return canvas.toDataURL('image/jpeg', quality);
}

export function generateDefaultFrame() { return null; }
export function generateFrameThumbnail(id) { 
  if (id === 'no-frame') return '/frames/custom_frame.png';
  // Use custom_frame.png for all as fallback to prevent broken images
  return '/frames/custom_frame.png';
}
