'use client';

import { useEffect, useMemo, useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-provider';

interface ImageGalleryInputProps {
  images: File[];
  onChange: (files: File[]) => void;
}

export function ImageGalleryInput({ images, onChange }: ImageGalleryInputProps) {
  const { t } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const previews = useMemo(() => images.map((file) => URL.createObjectURL(file)), [images]);

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleAdd = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    onChange([...images, ...Array.from(files)]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-wrap gap-3">
      {images.map((file, index) => (
        <div key={`${file.name}-${index}`} className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview, not an optimizable remote image */}
          <img src={previews[index]} alt={file.name} className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => handleRemove(index)}
            className="absolute end-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-opacity hover:bg-black/80"
            aria-label={t('admin.remove')}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-brand/40 hover:text-brand"
      >
        <ImagePlus className="h-5 w-5" />
        <span className="text-xs font-medium">{t('dashboard.listings.addImages')}</span>
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => handleAdd(e.target.files)}
        className="hidden"
      />
    </div>
  );
}
