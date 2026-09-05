'use client';

import { useState } from 'react';
import { ImagePlus, Send } from 'lucide-react';
import { useLocale } from '@/lib/i18n/locale-provider';
import { getErrorMessage } from '@/lib/api/client';
import { ListingImagePickerModal } from '@/features/messaging/components/ListingImagePickerModal';

interface ChatComposerProps {
  disabled?: boolean;
  listingId: string;
  onSendText: (content: string) => Promise<void>;
  onSendImage?: (photo: { url: string; public_id: string }) => Promise<void>;
}

export function ChatComposer({ disabled, listingId, onSendText, onSendImage }: ChatComposerProps) {
  const { t } = useLocale();
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<{ url: string; public_id: string } | null>(null);

  const handleSend = async () => {
    const trimmed = value.trim();
    if (!trimmed || disabled || sending) return;
    setSending(true);
    try {
      await onSendText(trimmed);
      setValue('');
    } catch (err) {
      console.error(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const openImagePicker = () => {
    if (!onSendImage || disabled || sending) return;
    setImagePickerOpen(true);
  };

  const handleListingPhotoSelect = (photo: { url: string; public_id: string }) => {
    setImagePreview(photo);
  };

  const confirmImage = async () => {
    if (!imagePreview || !onSendImage || disabled || sending) return;
    setSending(true);
    try {
      await onSendImage({
        url: imagePreview.url,
        public_id: imagePreview.public_id,
      });
      setImagePreview(null);
    } catch (err) {
      console.error(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  if (imagePreview) {
    return (
      <div className="border-t border-gray-200 bg-white p-3">
        <p className="mb-2 text-sm font-medium text-primary-dark">{t('dashboard.messages.confirmImage')}</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imagePreview.url} alt="" className="mb-3 max-h-48 w-full rounded-xl object-contain" />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={sending}
            onClick={() => setImagePreview(null)}
            className="rounded-xl px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            {t('dashboard.messages.remove')}
          </button>
          <button
            type="button"
            disabled={sending}
            onClick={() => void confirmImage()}
            className="rounded-xl bg-brand px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {t('dashboard.messages.send')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ListingImagePickerModal
        open={imagePickerOpen}
        listingId={listingId}
        onClose={() => setImagePickerOpen(false)}
        onSelectPhoto={handleListingPhotoSelect}
      />
      <div className="border-t border-gray-200 bg-white p-3">
        <div className="flex items-end gap-2">
          {onSendImage ? (
            <button
              type="button"
              disabled={disabled || sending}
              onClick={openImagePicker}
              className="rounded-xl p-2 text-gray-500 hover:bg-gray-100"
            >
              <ImagePlus className="h-5 w-5" />
            </button>
          ) : null}
          <textarea
            value={value}
            disabled={disabled || sending}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
            rows={1}
            placeholder={t('dashboard.messages.placeholder')}
            className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
          />
          <button
            type="button"
            disabled={disabled || sending || !value.trim()}
            onClick={() => void handleSend()}
            className="rounded-xl bg-brand p-2.5 text-white disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </>
  );
}
