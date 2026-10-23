/**
 * Reads an image file chosen by the user, center-crops it to a square and
 * scales it down so it can be stored safely (small data URL).
 */
export function resizeImageToDataUrl(file, size = 256, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        const side = Math.min(width, height);
        if (!side) {
          reject(new Error('Invalid image'));
          return;
        }
        const sx = (width - side) / 2;
        const sy = (height - side) / 2;

        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas not supported'));
          return;
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (err) {
        reject(err);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Invalid image'));
    };

    img.src = objectUrl;
  });
}
