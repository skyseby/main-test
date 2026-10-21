export interface ImageResult {
  blob: Blob;
  width: number;
  height: number;
}

export async function compressImage(source: Blob, maxWidth = 1440, quality = 0.84): Promise<ImageResult> {
  if (!source.type.startsWith('image/')) {
    throw new Error('The selected file is not an image.');
  }

  const bitmap = await createImageBitmap(source);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  if (!context) {
    bitmap.close();
    throw new Error('Image processing is unavailable on this device.');
  }

  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      result => result ? resolve(result) : reject(new Error('The photo could not be processed.')),
      'image/jpeg',
      quality,
    );
  });

  return { blob, width, height };
}

export function fileSizeLabel(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}