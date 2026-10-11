'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Tabs from '@radix-ui/react-tabs';
import { CheckCircle2, CircleAlert } from 'lucide-react';
import { isAdminPanelRole } from '@/lib/auth/constants';
import { toast } from '@/components/ui/toaster';
import {
  createUpdateProfileSchema,
  UpdateProfileInput,
  createChangePasswordSchema,
  ChangePasswordInput,
} from '@/features/auth/schemas/auth-schemas';
import {
  updateProfile,
  changePassword,
  deleteProfileImage,
  sendVerificationCode,
  startPhoneVerification,
} from '@/features/auth/services/auth-service';
import { AuthUser } from '@/features/auth/types/user';
import { buildPartialUpdate, hasPartialChanges } from '@/features/admin/lib/partial-update';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';
import { cn } from '@/lib/utils/cn';
import Image from 'next/image';
import { Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { markEmailCodeSent } from '@/lib/auth/email-send-cooldown';
import { ProfileEmailVerificationModal } from '@/features/dashboard/components/ProfileEmailVerificationModal';
import { formatPhoneFromDigitKey, formatPhoneNumber, phonesMatch } from '@/lib/utils/format';
import { markPendingPhoneVerification, phoneDigitsKey } from '@/lib/auth/pending-phone-verification';
import { VerifyPhoneModal } from '@/features/auth/components/VerifyPhoneModal';
import { logout } from '@/features/auth/services/auth-service';

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
  const [isUpdating, setIsUpdating] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(user.user_photo?.url ?? null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailModalMode, setEmailModalMode] = useState<'account' | 'change'>('account');
  const [emailModalTarget, setEmailModalTarget] = useState(user.email);
  const [verifiedNewEmail, setVerifiedNewEmail] = useState<string | null>(null);
  const [verifiedNewPhone, setVerifiedNewPhone] = useState<string | null>(null);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [phoneVerifySession, setPhoneVerifySession] = useState<{ sessionId: string; link: string } | null>(
    null,
  );

  const original = useMemo(
    () => ({
      f_name: user.f_name,
      l_name: user.l_name,
      email: user.email,
      phone_number: formatPhoneNumber(user.phone_number),
    }),
    [user],
  );

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    watch: watchProfile,
    setValue: setProfileValue,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm<Pick<UpdateProfileInput, 'f_name' | 'l_name' | 'email' | 'phone_number'>>({
    resolver: zodResolver(
      profileSchema.pick({ f_name: true, l_name: true, email: true, phone_number: true }),
    ),
    defaultValues: original,
  });

  const watchedEmail = watchProfile('email') ?? user.email;
  const watchedPhone = watchProfile('phone_number') ?? original.phone_number;
  const normalizedFormEmail = watchedEmail.trim().toLowerCase();
  const originalEmailNormalized = original.email.trim().toLowerCase();
  const emailChanged = normalizedFormEmail !== originalEmailNormalized;
  const phoneChanged = !phonesMatch(watchedPhone, original.phone_number);
  const emailChangeVerified = !emailChanged || verifiedNewEmail === normalizedFormEmail;
  const phoneChangeVerified =
    !phoneChanged || (verifiedNewPhone !== null && phoneDigitsKey(verifiedNewPhone) === phoneDigitsKey(watchedPhone));

  const showEmailUnverifiedHint =
    !user.email_verified_at && !isAdminPanelRole(user.role);

  const onProfileSubmit = async (
    values: Pick<UpdateProfileInput, 'f_name' | 'l_name' | 'email' | 'phone_number'>,
  ) => {
    if (!emailChangeVerified) {
      toast.error(t('dashboard.emailChangeNotVerified'));
      return;
    }
    if (!phoneChangeVerified) {
      toast.error(t('dashboard.phoneChangeNotVerified'));
      return;
    }

    const patch = buildPartialUpdate(values, original);

    if (!hasPartialChanges(patch) && !photoFile) {
      toast.info(t('dashboard.noChangesToSave'));
      return;
    }
    setIsUpdating(true);

    try {
      await updateProfile(patch, photoFile);
      toast.success(t('dashboard.profileUpdated'));
      setPhotoFile(null);
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsUpdating(false);
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
      await logout();
      router.push('/login');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const onDeleteProfileImage = async () => {
    setIsUpdating(true);
    try {
      await deleteProfileImage();
      toast.success(t('dashboard.profileImageDeleted'));
      setPhotoPreview(null);
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsUpdating(false);
    }
  };

  const openEmailModal = (mode: 'account' | 'change', targetEmail: string) => {
    setEmailModalMode(mode);
    setEmailModalTarget(targetEmail);
    setEmailModalOpen(true);
  };

  const handleStartEmailVerification = async () => {
    setIsVerifyingEmail(true);
    try {
      const target = emailChanged ? normalizedFormEmail : user.email;
      await sendVerificationCode({ email: target });
      markEmailCodeSent(target);
      openEmailModal(emailChanged ? 'change' : 'account', target);
      toast.success(t('auth.verificationCodeSent'));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleStartPhoneVerification = async () => {
    setIsVerifyingPhone(true);
    try {
      const targetPhone = phoneChanged ? watchedPhone.trim() : undefined;
      if (phoneChanged) {
        markPendingPhoneVerification(watchedPhone);
      }
      const result = await startPhoneVerification(targetPhone);
      setPhoneVerifySession({ sessionId: result.sessionId, link: result.link });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  return (
    <div className={`mx-auto w-full max-w-2xl space-y-4 ${isUpdating ? 'opacity-50' : ''}`}>
      {showEmailUnverifiedHint ? (
        <div
          role="status"
          className="rounded-2xl border border-amber-200/90 bg-amber-50/80 p-4 shadow-[var(--shadow-soft)]"
        >
          <div className="flex gap-3">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-sm font-semibold text-amber-950">{t('dashboard.profileEmailUnverifiedTitle')}</p>
              <p className="text-sm leading-relaxed text-amber-900/90">{t('dashboard.profileEmailUnverifiedBody')}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-amber-300 bg-white text-amber-950 hover:bg-amber-100/80"
                disabled={isVerifyingEmail || emailChanged}
                onClick={() => void handleStartEmailVerification()}
              >
                {isVerifyingEmail ? t('auth.sending') : t('dashboard.profileEmailUnverifiedAction')}
              </Button>
              {emailChanged ? (
                <p className="text-xs text-amber-800/80">{t('dashboard.verifyEmailChangeHint')}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <Tabs.Root
        defaultValue="profile"
        dir={dir}
        className="rounded-2xl border border-gray-200 bg-white shadow-var(--shadow-soft)"
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
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-100">
                  {photoPreview ? (
                    <div className="relative size-20 rounded-full ring-2 ring-gray-400">
                      <Image src={photoPreview} alt="" fill className="rounded-full object-cover" />
                      <Button
                        type="button"
                        variant="danger"
                        size="icon"
                        onClick={() => void onDeleteProfileImage()}
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
                      >
                        <Trash className="size-4 text-white" />
                      </Button>
                    </div>
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
              <div className="flex flex-wrap items-center gap-2">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={cn(fieldClassName, 'min-w-0 flex-1', profileErrors.email && 'border-red-300')}
                  {...registerProfile('email', {
                    onChange: () => {
                      if (verifiedNewEmail) setVerifiedNewEmail(null);
                    },
                  })}
                />
                {!emailChanged && user.email_verified_at ? (
                  <div className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs font-medium">{t('dashboard.emailVerifiedBadge')}</span>
                  </div>
                ) : !emailChanged && !user.email_verified_at ? (
                  <div className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 text-amber-900">
                    <CircleAlert className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-medium">{t('dashboard.emailNotVerifiedBadge')}</span>
                  </div>
                ) : emailChanged && emailChangeVerified ? (
                  <div className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs font-medium">{t('dashboard.emailVerifiedBadge')}</span>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 shrink-0"
                    disabled={isVerifyingEmail || Boolean(profileErrors.email)}
                    onClick={() => void handleStartEmailVerification()}
                  >
                    {isVerifyingEmail ? t('auth.sending') : t('dashboard.verifyEmail')}
                  </Button>
                )}
              </div>
              <FieldError message={profileErrors.email?.message} />
              {emailChanged && !emailChangeVerified ? (
                <p className="text-xs text-gray-500">{t('dashboard.verifyEmailChangeHint')}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phone_number" className="text-sm font-medium text-primary-dark">
                {t('auth.phone')}
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  id="phone_number"
                  type="tel"
                  dir="ltr"
                  autoComplete="tel"
                  className={cn(fieldClassName, 'min-w-0 flex-1', profileErrors.phone_number && 'border-red-300')}
                  {...registerProfile('phone_number', {
                    onChange: () => {
                      if (verifiedNewPhone) setVerifiedNewPhone(null);
                    },
                  })}
                />
                {!phoneChanged && user.phone_verified_at ? (
                  <div className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs font-medium">{t('dashboard.phoneVerifiedBadge')}</span>
                  </div>
                ) : phoneChanged && phoneChangeVerified ? (
                  <div className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs font-medium">{t('dashboard.phoneVerifiedBadge')}</span>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 shrink-0"
                    disabled={isVerifyingPhone || Boolean(profileErrors.phone_number)}
                    onClick={() => void handleStartPhoneVerification()}
                  >
                    {isVerifyingPhone ? t('auth.sending') : t('auth.verifyByPhone')}
                  </Button>
                )}
              </div>
              <FieldError message={profileErrors.phone_number?.message} />
              {phoneChanged && !phoneChangeVerified ? (
                <p className="text-xs text-gray-500">{t('dashboard.verifyPhoneChangeHint')}</p>
              ) : !phoneChanged && !user.phone_verified_at ? (
                <p className="text-xs text-gray-500">{t('dashboard.verifyPhoneHint')}</p>
              ) : null}
            </div>

            <Button
              type="submit"
              disabled={isProfileSubmitting || !emailChangeVerified || !phoneChangeVerified}
            >
              {isProfileSubmitting ? t('dashboard.saving') : t('dashboard.save')}
            </Button>
          </form>
        </Tabs.Content>

        <Tabs.Content value="password" className="p-6 text-start">
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
            <div
              role="note"
              className="flex gap-2.5 rounded-xl border border-amber-200/90 bg-amber-50/80 px-4 py-3 text-sm leading-relaxed text-amber-900/90"
            >
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden />
              <p>{t('dashboard.passwordChangeLogoutNotice')}</p>
            </div>

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

      <ProfileEmailVerificationModal
        open={emailModalOpen}
        onOpenChange={setEmailModalOpen}
        email={emailModalTarget}
        mode={emailModalMode}
        onEmailChangeVerified={(verified) => {
          const normalized = verified.trim().toLowerCase();
          setVerifiedNewEmail(normalized);
          setProfileValue('email', normalized, { shouldValidate: true, shouldDirty: true });
        }}
      />

      {phoneVerifySession ? (
        <VerifyPhoneModal
          open={Boolean(phoneVerifySession)}
          onOpenChange={(open) => {
            if (!open) setPhoneVerifySession(null);
          }}
          sessionId={phoneVerifySession.sessionId}
          whatsAppLink={phoneVerifySession.link}
          onVerified={(digitKey) => {
            if (digitKey) {
              const formatted = formatPhoneFromDigitKey(digitKey);
              setVerifiedNewPhone(phoneDigitsKey(formatted));
              setProfileValue('phone_number', formatted, { shouldValidate: true, shouldDirty: true });
            }
            if (!phoneChanged) {
              router.refresh();
            }
            toast.success(t('auth.verifyPhoneSuccess'));
          }}
        />
      ) : null}
    </div>
  );
}
