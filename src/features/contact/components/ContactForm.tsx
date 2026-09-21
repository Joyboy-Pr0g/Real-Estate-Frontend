'use client';

import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { submitContact } from '@/features/contact/services/contact-client';
import { useLocale } from '@/lib/i18n/locale-provider';
import { getErrorMessage } from '@/lib/errors/api-error';
import { toast } from '@/components/ui/toaster';
import type { AuthUser } from '@/features/auth/types/user';

export function ContactForm({ user }: { user: AuthUser | null }) {
  const { t } = useLocale();
  const full_name = (user?.f_name && user?.l_name) ? user.f_name + ' ' + user.l_name : '';
  const [fullName, setFullName] = useState(full_name);
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await submitContact({
        full_name: fullName.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });
      toast.success(t('contact.form.success'));
      setFullName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)] lg:p-8"
    >
      <h2 className="text-xl font-bold text-primary-dark">{t('contact.form.title')}</h2>
      <p className="mt-1 text-sm text-gray-500">{t('contact.form.hint')}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-gray-700">
          {t('contact.form.fullName')}
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            maxLength={200}
            className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-2.5 text-sm outline-none transition focus:border-brand/40 focus:bg-white"
          />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          {t('contact.form.email')}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={255}
            className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-2.5 text-sm outline-none transition focus:border-brand/40 focus:bg-white"
          />
        </label>
      </div>

      <label className="mt-4 block text-sm font-medium text-gray-700">
        {t('contact.form.subject')}
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          maxLength={200}
          className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-2.5 text-sm outline-none transition focus:border-brand/40 focus:bg-white"
        />
      </label>

      <label className="mt-4 block text-sm font-medium text-gray-700">
        {t('contact.form.message')}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          maxLength={4000}
          className="mt-1.5 w-full resize-none rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-2.5 text-sm outline-none transition focus:border-brand/40 focus:bg-white"
        />
      </label>

      <div className="mt-6">
        <Button type="submit" disabled={submitting} className="min-w-[140px]">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {t('contact.form.submit')}
        </Button>
      </div>
    </form>
  );
}
