'use client';

import type { ImageLoaderProps } from 'next/image';

const CLOUDINARY_HOSTNAME = 'res.cloudinary.com';
const UPLOAD_SEGMENT = '/upload/';
const PASSTHROUGH_PREFIXES = ['data:', 'blob:'];

function isCloudinaryUrl(src: string): boolean {
  try {
    return new URL(src).hostname === CLOUDINARY_HOSTNAME;
  } catch {
    return false;
  }
}

export default function cloudinaryLoader({ src, width, quality }: ImageLoaderProps): string {
  if (PASSTHROUGH_PREFIXES.some((prefix) => src.startsWith(prefix))) {
    return src;
  }

  const uploadIndex = isCloudinaryUrl(src) ? src.indexOf(UPLOAD_SEGMENT) : -1;
  if (uploadIndex !== -1) {
    const insertAt = uploadIndex + UPLOAD_SEGMENT.length;
    const transformation = `f_auto,c_limit,w_${width},q_${quality ?? 'auto'}`;
    return `${src.slice(0, insertAt)}${transformation}/${src.slice(insertAt)}`;
  }

  return `${src}${src.includes('?') ? '&' : '?'}w=${width}`;
}
