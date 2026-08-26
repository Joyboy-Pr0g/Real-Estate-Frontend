'use client';

import { useEffect, useId, useState } from 'react';
import { FileText } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

interface FileUploadFieldProps {
  label: string;
  accept: string;
  required?: boolean;
  value: File | null;
  onChange: (file: File | null) => void;
  className?: string;
}

export function FileUploadField({ label, accept, required, value, onChange, className }: FileUploadFieldProps) {
  const { t } = useLocale();
  const inputId = useId();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileViewUrl, setFileViewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      setFileViewUrl(null);
      return;
    }

    if (isImageFile(value)) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      setFileViewUrl(null);
      return () => URL.revokeObjectURL(url);
    }

    setPreviewUrl(null);
    const url = URL.createObjectURL(value);
    setFileViewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={inputId} className="text-sm font-medium text-primary-dark">
        {label}
      </label>

      <input
        id={inputId}
        type="file"
        accept={accept}
        required={required && !value}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="block w-full text-sm text-gray-600 file:me-3 file:rounded-lg file:border-0 file:bg-brand-muted file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-dark"
      />

      {value && previewUrl ? (
        <div className="mt-2 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="" className="mx-auto max-h-40 w-full object-contain p-2" />
        </div>
      ) : null}

      {value && !isImageFile(value) && fileViewUrl ? (
        <div className="mt-2 flex flex-col gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
          <div className="flex min-w-0 items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 text-brand" />
            <p className="truncate text-sm font-medium text-primary-dark">{value.name}</p>
          </div>
          <a
            href={fileViewUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 w-fit items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-primary transition-colors hover:bg-gray-50"
          >
            {t('dashboard.viewFile')}
          </a>
        </div>
      ) : null}
    </div>
  );
}
