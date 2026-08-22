'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { createRegisterSchema, RegisterInput } from '@/features/auth/schemas/auth-schemas';
import { register as registerUser } from '@/features/auth/services/auth-service';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

const fieldClassName =
  'h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition-colors focus:border-brand/40 focus:bg-white focus:ring-2 focus:ring-brand/15';

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-600">{message}</p>;
}

export function RegisterForm() {
  const router = useRouter();
  const { t } = useLocale();
  const [error, setError] = useState('');
  const registerSchema = useMemo(() => createRegisterSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterInput) => {
    setError('');

    try {
      const user = await registerUser(values);
      router.push(`/verify-email?email=${encodeURIComponent(user.email)}`);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="f_name" className="text-sm font-medium text-primary-dark">
            {t('auth.firstName')}
          </label>
          <input
            id="f_name"
            autoComplete="given-name"
            className={cn(fieldClassName, errors.f_name && 'border-red-300')}
            {...register('f_name')}
          />
          <FieldError message={errors.f_name?.message} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="l_name" className="text-sm font-medium text-primary-dark">
            {t('auth.lastName')}
          </label>
          <input
            id="l_name"
            autoComplete="family-name"
            className={cn(fieldClassName, errors.l_name && 'border-red-300')}
            {...register('l_name')}
          />
          <FieldError message={errors.l_name?.message} />
        </div>
      </div>

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
        <FieldError message={errors.email?.message} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="phone_number" className="text-sm font-medium text-primary-dark">
          {t('auth.phone')}
        </label>
        <input
          id="phone_number"
          type="tel"
          autoComplete="tel"
          placeholder={t('auth.phonePlaceholder')}
          className={cn(fieldClassName, errors.phone_number && 'border-red-300')}
          {...register('phone_number')}
        />
        <FieldError message={errors.phone_number?.message} />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-primary-dark">
          {t('auth.password')}
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          className={cn(fieldClassName, errors.password && 'border-red-300')}
          {...register('password')}
        />
        <FieldError message={errors.password?.message} />
        <p className="text-xs text-gray-400">{t('auth.passwordHint')}</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password_confirmation" className="text-sm font-medium text-primary-dark">
          {t('auth.confirmPassword')}
        </label>
        <input
          id="password_confirmation"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          className={cn(fieldClassName, errors.password_confirmation && 'border-red-300')}
          {...register('password_confirmation')}
        />
        <FieldError message={errors.password_confirmation?.message} />
      </div>

      <Button type="submit" size="lg" className="mt-2 w-full rounded-xl" disabled={isSubmitting}>
        {isSubmitting ? t('auth.creating') : t('auth.createAccount')}
      </Button>

      <p className="text-center text-sm text-gray-500">
        {t('auth.hasAccount')}{' '}
        <Link href="/login" className="font-medium text-brand hover:text-brand-dark">
          {t('auth.signIn')}
        </Link>
      </p>
    </form>
  );
}
