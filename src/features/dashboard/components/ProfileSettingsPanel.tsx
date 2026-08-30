'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Tabs from '@radix-ui/react-tabs';
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

const tabTriggerClass =
  'inline-flex flex-1 items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20 data-[state=active]:bg-brand-muted data-[state=active]:text-brand-dark sm:px-4';

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-600">{message}</p>;
}

interface ProfileSettingsPanelProps {
  user: AuthUser;
}

export function ProfileSettingsPanel({ user }: ProfileSettingsPanelProps) {
  const { t, dir } = useLocale();
  const router = useRouter();
  const profileSchema = useMemo(() => createUpdateProfileSchema(t), [t]);
  const passwordSchema = useMemo(() => createChangePasswordSchema(t), [t]);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(user.user_photo?.url ?? null);

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

    if (!hasPartialChanges(patch) && !photoFile) {
      toast.info(t('dashboard.noChangesToSave'));
      return;
    }

    try {
      await updateProfile(patch, photoFile);
      toast.success(t('dashboard.profileUpdated'));
      setPhotoFile(null);
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const onPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
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
    <div className="mx-auto w-full max-w-2xl">
      <Tabs.Root
        defaultValue="profile"
        dir={dir}
        className="rounded-2xl border border-gray-200 bg-white shadow-[var(--shadow-soft)]"
      >
        <Tabs.List className="flex gap-1 border-b border-gray-100 p-2">
          <Tabs.Trigger value="profile" className={tabTriggerClass}>
            {t('dashboard.profileSection')}
          </Tabs.Trigger>
          <Tabs.Trigger value="password" className={tabTriggerClass}>
            {t('dashboard.changePasswordSection')}
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="profile" className="p-6 text-start">
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-primary-dark">{t('dashboard.profilePhoto')}</p>
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                  {photoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoPreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-lg font-semibold text-gray-400">
                      {user.f_name.charAt(0)}
                      {user.l_name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={onPhotoChange}
                  />
                  <Button type="button" variant="outline" onClick={() => photoInputRef.current?.click()}>
                    {t('dashboard.profilePhotoChange')}
                  </Button>
                  <p className="text-xs text-gray-500">{t('dashboard.profilePhotoHint')}</p>
                </div>
              </div>
            </div>

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
        </Tabs.Content>

        <Tabs.Content value="password" className="p-6 text-start">
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
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
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
