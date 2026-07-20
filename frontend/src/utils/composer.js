// src/utils/composer.js

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

export async function compose(canvas, photos) {
  const ctx = canvas.getContext('2d');
  canvas.width = LAYOUT.canvasWidth;
  canvas.height = LAYOUT.canvasHeight;

  ctx.fillStyle = LAYOUT.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const areas = LAYOUT.areas;
  const photoImages = await Promise.all(
    photos.slice(0, 4).map(src => src ? loadImage(src) : null)
  );

  for (let i = 0; i < 4; i++) {
    const area = areas[i];
    if (photoImages[i]) {
      drawImageCover(ctx, photoImages[i], area.x, area.y, area.width, area.height, LAYOUT.borderRadius);
    } else {
      ctx.fillStyle = '#e0e0e0';
      ctx.fillRect(area.x, area.y, area.width, area.height);
    }
  }

  try {
    const frameImg = await loadImage('/frames/custom_frame.png');
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
  if (id === 'no-frame') return '/frames/custom_frame.png';
  // Use custom_frame.png for all as fallback to prevent broken images
  return '/frames/custom_frame.png';
}
