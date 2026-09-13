'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Send } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-provider';
interface SupportTicketComposerProps {
  disabled?: boolean;
  onSendText: (content: string) => Promise<void>;
  onSendImage: (file: File) => Promise<void>;
}

export function SupportTicketComposer({ disabled, onSendText, onSendImage }: SupportTicketComposerProps) {
  const { t } = useLocale();
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);
  const [imagePreview, setImagePreview] = useState<{ file: File; url: string } | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const clearImagePreview = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview.url);
    setImagePreview(null);
  };

  const handleSendText = async () => {
    const trimmed = value.trim();
    if (!trimmed || disabled || sending) return;
    setSending(true);
    try {
      await onSendText(trimmed);
      setValue('');
    } catch {
      // send errors surface via parent ticket panel
    } finally {
      setSending(false);
    }
  };

  const handleSendImage = async () => {
    if (!imagePreview || disabled || sending) return;
    setSending(true);
    try {
      await onSendImage(imagePreview.file);
      clearImagePreview();
    } catch {
      // send errors surface via parent ticket panel
    } finally {
      setSending(false);
    }
  };

  const handleImagePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || disabled) return;
    clearImagePreview();
    setImagePreview({ file, url: URL.createObjectURL(file) });
  };

  return (
    <div className="border-t border-gray-200 p-3">
      {imagePreview ? (
        <div className="mb-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imagePreview.url} alt="" className="mb-3 max-h-40 rounded-lg object-contain" />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={clearImagePreview}
              disabled={sending}
              className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
            >
              {t('admin.cancel')}
            </button>
            <button
              type="button"
              onClick={() => void handleSendImage()}
              disabled={sending || disabled}
              className="rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-50"
            >
              {t('dashboard.messages.confirmImage')}
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          disabled={disabled || sending}
          className="rounded-xl p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
          aria-label={t('dashboard.messages.pickImage')}
        >
          <ImagePlus className="h-5 w-5" />
        </button>
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void handleSendText();
            }
          }}
          disabled={disabled || sending}
          placeholder={t('dashboard.messages.placeholder')}
          rows={1}
          className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand disabled:bg-gray-50"
        />
        <button
          type="button"
          onClick={() => void handleSendText()}
          disabled={disabled || sending || !value.trim()}
          className="rounded-xl bg-brand p-2.5 text-white hover:bg-brand/90 disabled:opacity-50"
          aria-label={t('dashboard.messages.send')}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
