'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toaster';
import {
  createUpdateProfileSchema,
  UpdateProfileInput,
  createChangePasswordSchema,
  ChangePasswordInput,
} from '@/features/auth/schemas/auth-schemas';
import { updateProfile, changePassword } from '@/features/auth/services/auth-service';
import { AuthUser } from '@/features/auth/types/user';
import { buildPartialUpdate, hasPartialChanges } from '@/features/admin/lib/partial-update';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';

const fieldClassName =
  'h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none transition-colors focus:border-brand/40 focus:bg-white focus:ring-2 focus:ring-brand/15';

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-600">{message}</p>;
}

interface ProfileSettingsPanelProps {
  user: AuthUser;
}

export function ProfileSettingsPanel({ user }: ProfileSettingsPanelProps) {
  const { t } = useLocale();
  const router = useRouter();
  const profileSchema = useMemo(() => createUpdateProfileSchema(t), [t]);
  const passwordSchema = useMemo(() => createChangePasswordSchema(t), [t]);

  const original = useMemo(
    () => ({
      f_name: user.f_name,
      l_name: user.l_name,
      phone_number: user.phone_number,
    }),
    [user],
  );

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm<Pick<UpdateProfileInput, 'f_name' | 'l_name' | 'phone_number'>>({
    resolver: zodResolver(profileSchema.pick({ f_name: true, l_name: true, phone_number: true })),
    defaultValues: original,
  });

  const onProfileSubmit = async (values: Pick<UpdateProfileInput, 'f_name' | 'l_name' | 'phone_number'>) => {
    const patch = buildPartialUpdate(values, original);

    if (!hasPartialChanges(patch)) {
      toast.info(t('dashboard.noChangesToSave'));
      return;
    }

    try {
      await updateProfile(patch);
      toast.success(t('dashboard.profileUpdated'));
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(passwordSchema),
  });

  const onPasswordSubmit = async (values: ChangePasswordInput) => {
    try {
      await changePassword(values);
      toast.success(t('dashboard.passwordUpdated'));
      resetPasswordForm();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
        <h2 className="text-lg font-bold text-primary-dark">{t('dashboard.profileSection')}</h2>
        <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="f_name" className="text-sm font-medium text-primary-dark">
                {t('auth.firstName')}
              </label>
              <input
                id="f_name"
                autoComplete="given-name"
                className={cn(fieldClassName, profileErrors.f_name && 'border-red-300')}
                {...registerProfile('f_name')}
              />
              <FieldError message={profileErrors.f_name?.message} />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="l_name" className="text-sm font-medium text-primary-dark">
                {t('auth.lastName')}
              </label>
              <input
                id="l_name"
                autoComplete="family-name"
                className={cn(fieldClassName, profileErrors.l_name && 'border-red-300')}
                {...registerProfile('l_name')}
              />
              <FieldError message={profileErrors.l_name?.message} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-primary-dark">
              {t('dashboard.emailLabel')}
            </label>
            <input
              id="email"
              type="email"
              value={user.email}
              readOnly
              disabled
              tabIndex={-1}
              className={cn(fieldClassName, 'cursor-not-allowed bg-gray-100 text-gray-500')}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="phone_number" className="text-sm font-medium text-primary-dark">
              {t('auth.phone')}
            </label>
            <input
              id="phone_number"
              type="tel"
              autoComplete="tel"
              className={cn(fieldClassName, profileErrors.phone_number && 'border-red-300')}
              {...registerProfile('phone_number')}
            />
            <FieldError message={profileErrors.phone_number?.message} />
          </div>

          <Button type="submit" disabled={isProfileSubmitting}>
            {isProfileSubmitting ? t('dashboard.saving') : t('dashboard.save')}
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-[var(--shadow-soft)]">
        <h2 className="text-lg font-bold text-primary-dark">{t('dashboard.changePasswordSection')}</h2>
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="current_password" className="text-sm font-medium text-primary-dark">
              {t('dashboard.currentPassword')}
            </label>
            <input
              id="current_password"
              type="password"
              autoComplete="current-password"
              className={cn(fieldClassName, passwordErrors.current_password && 'border-red-300')}
              {...registerPassword('current_password')}
            />
            <FieldError message={passwordErrors.current_password?.message} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="new_password" className="text-sm font-medium text-primary-dark">
              {t('dashboard.newPassword')}
            </label>
            <input
              id="new_password"
              type="password"
              autoComplete="new-password"
              className={cn(fieldClassName, passwordErrors.new_password && 'border-red-300')}
              {...registerPassword('new_password')}
            />
            <FieldError message={passwordErrors.new_password?.message} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="new_password_confirmation" className="text-sm font-medium text-primary-dark">
              {t('dashboard.newPasswordConfirm')}
            </label>
            <input
              id="new_password_confirmation"
              type="password"
              autoComplete="new-password"
              className={cn(fieldClassName, passwordErrors.new_password_confirmation && 'border-red-300')}
              {...registerPassword('new_password_confirmation')}
            />
            <FieldError message={passwordErrors.new_password_confirmation?.message} />
          </div>

          <Button type="submit" variant="outline" disabled={isPasswordSubmitting}>
            {isPasswordSubmitting ? t('dashboard.saving') : t('dashboard.save')}
          </Button>
        </form>
      </section>
    </div>
  );
}
