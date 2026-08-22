'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { createVerifyEmailSchema, VerifyEmailInput } from '@/features/auth/schemas/auth-schemas';
import { sendVerificationCode, verifyEmail } from '@/features/auth/services/auth-service';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

const fieldClassName =
  'h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition-colors focus:border-brand/40 focus:bg-white focus:ring-2 focus:ring-brand/15';

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const [error, setError] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [resending, setResending] = useState(false);
  const verifySchema = useMemo(() => createVerifyEmailSchema(t), [t]);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<VerifyEmailInput>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      email: searchParams.get('email') ?? '',
      code: '',
    },
  });

  const onSubmit = async (values: VerifyEmailInput) => {
    setError('');
    setResendMessage('');

    try {
      await verifyEmail(values);
      router.push('/');
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleResend = async () => {
    setError('');
    setResendMessage('');
    setResending(true);

    try {
      await sendVerificationCode({ email: getValues('email').trim() });
      setResendMessage(t('auth.verificationCodeSent'));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}
      {resendMessage ? (
        <p className="rounded-xl border border-brand/20 bg-brand-muted px-4 py-3 text-sm text-brand-dark">
          {resendMessage}
        </p>
      ) : null}

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-primary-dark">
          {t('auth.email')}
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className={cn(fieldClassName, errors.email && 'border-red-300')}
          {...register('email')}
        />
        {errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="code" className="text-sm font-medium text-primary-dark">
          {t('auth.verificationCode')}
        </label>
        <input
          id="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          maxLength={6}
          className={cn(fieldClassName, 'tracking-[0.3em]', errors.code && 'border-red-300')}
          {...register('code')}
        />
        {errors.code ? <p className="text-xs text-red-600">{errors.code.message}</p> : null}
      </div>

      <Button type="submit" size="lg" className="w-full rounded-xl" disabled={isSubmitting}>
        {isSubmitting ? t('auth.verifying') : t('auth.verifyEmail')}
      </Button>

      <div className="flex flex-col gap-2 text-center text-sm">
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="font-medium text-brand hover:text-brand-dark disabled:opacity-50"
        >
          {resending ? t('auth.sending') : t('auth.resendCode')}
        </button>
        <Link href="/login" className="text-gray-500 hover:text-primary-dark">
          {t('auth.backToLogin')}
        </Link>
      </div>
    </form>
  );
}
