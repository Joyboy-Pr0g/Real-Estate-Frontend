'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Film, Video, X } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-provider';

interface VideoInputProps {
  video: File | null;
  onChange: (file: File | null) => void;
}

export function VideoInput({ video, onChange }: VideoInputProps) {
  const { t } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = useMemo(() => (video ? URL.createObjectURL(video) : null), [video]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  if (video && preview) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-muted text-brand">
          <Film className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm text-gray-600">{video.name}</span>
        <button
          type="button"
          onClick={() => {
            onChange(null);
            if (inputRef.current) inputRef.current.value = '';
          }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-red-600"
          aria-label={t('admin.remove')}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="flex h-16 w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 transition-colors hover:border-brand/40 hover:text-brand"
    >
      <Video className="h-5 w-5" />
      <span className="text-xs font-medium">{t('dashboard.listings.addVideo')}</span>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="hidden"
      />
    </button>
  );
}
