'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  createForgotPasswordSchema,
  ForgotPasswordInput,
} from '@/features/auth/schemas/auth-schemas';
import { forgotPassword } from '@/features/auth/services/auth-service';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

const fieldClassName =
  'h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition-colors focus:border-brand/40 focus:bg-white focus:ring-2 focus:ring-brand/15';

export function ForgotPasswordForm() {
  const { t } = useLocale();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const schema = useMemo(() => createForgotPasswordSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: ForgotPasswordInput) => {
    setError('');
    setSuccess('');

    try {
      await forgotPassword(values);
      setSuccess(t('auth.forgotPasswordSuccess'));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}
      {success ? (
        <p className="rounded-xl border border-brand/20 bg-brand-muted px-4 py-3 text-sm text-brand-dark">{success}</p>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-primary-dark">
          {t('auth.email')}
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={t('auth.emailPlaceholder')}
          className={cn(fieldClassName, errors.email && 'border-red-300')}
          {...register('email')}
        />
        {errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
      </div>

      <Button type="submit" size="lg" className="w-full rounded-xl" disabled={isSubmitting}>
        {isSubmitting ? t('auth.sending') : t('auth.sendResetLink')}
      </Button>

      <p className="text-center text-sm text-gray-500">
        <Link href="/login" className="font-medium text-brand hover:text-brand-dark">
          {t('auth.backToLogin')}
        </Link>
      </p>
    </form>
  );
}
