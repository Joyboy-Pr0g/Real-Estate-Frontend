'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { createLoginSchema, LoginInput } from '@/features/auth/schemas/auth-schemas';
import { login } from '@/features/auth/services/auth-service';
import { getErrorMessage, isEmailNotVerifiedError } from '@/lib/errors/api-error';
import { isAdminPanelRole, isSubAdminRole } from '@/lib/auth/constants';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import { PasswordInput } from '@/features/auth/components/PasswordInput';

const fieldClassName =
  'h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition-colors focus:border-brand/40 focus:bg-white focus:ring-2 focus:ring-brand/15';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const [error, setError] = useState('');
  const loginSchema = useMemo(() => createLoginSchema(t), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginInput) => {
    setError('');

    try {
      const user = await login(values);
      const redirect = searchParams.get('redirect');

      if (redirect) {
        if (isSubAdminRole(user.role) && redirect.startsWith('/admin')) {
          window.location.assign(redirect);
          return;
        }
        router.push(redirect);
      } else if (isSubAdminRole(user.role)) {
        window.location.assign('/admin');
        return;
      } else if (isAdminPanelRole(user.role)) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }

      router.refresh();
    } catch (err) {
      if (isEmailNotVerifiedError(err)) {
        const params = new URLSearchParams({
          email: values.email.trim(),
          sent: '1',
        });
        const redirect = searchParams.get('redirect');
        if (redirect) {
          params.set('redirect', redirect);
        }
        router.push(`/verify-email?${params.toString()}`);
        return;
      }

      setError(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
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
          className={cn(fieldClassName, errors.email && 'border-red-300 focus:border-red-400 focus:ring-red-100')}
          {...register('email')}
        />
        {errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="password" className="text-sm font-medium text-primary-dark">
            {t('auth.password')}
          </label>
          <Link href="/forgot-password" className="text-xs font-medium text-brand hover:text-brand-dark">
            {t('auth.forgotPassword')}
          </Link>
        </div>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          placeholder="••••••••"
          hasError={Boolean(errors.password)}
          {...register('password')}
        />
        {errors.password ? <p className="text-xs text-red-600">{errors.password.message}</p> : null}
      </div>

      <Button type="submit" size="lg" className="mt-2 w-full rounded-xl" disabled={isSubmitting}>
        {isSubmitting ? t('auth.signingIn') : t('auth.signIn')}
      </Button>
    </form>
  );
}
