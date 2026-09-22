'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toaster';
import { applyAsOffice, resubmitOffice, sendOfficeEmailVerification } from '@/features/office/services/office-client';
import { OfficeEmailVerificationModal } from '@/features/office/components/OfficeEmailVerificationModal';
import { MyOffice } from '@/features/office/types/office';
import { PublicCity } from '@/features/catalog/types/catalog';
import { PublicNeighborhood } from '@/features/catalog/types/neighborhood';
import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';
import { FileUploadField } from '@/components/ui/file-upload-field';
import { formatPhoneNumber } from '@/lib/utils/format';
import { z } from 'zod';
import { cn } from '@/lib/utils/cn';
import { EmailSendCooldownBar } from '@/components/auth/EmailSendCooldownBar';
import { useEmailSendCooldown } from '@/hooks/use-email-send-cooldown';

interface OfficeApplicationFormProps {
  cities: PublicCity[];
  existingOffice?: MyOffice | null;
  onCancel: () => void;
  onSuccess?: () => void;
}

interface FileFields {
  id_image: File | null;
  office_photo: File | null;
  commercial_license: File | null;
  office_license: File | null;
}

const fieldClass =
  'h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-brand/40 focus:bg-white';

export function OfficeApplicationForm({ cities, existingOffice, onCancel, onSuccess }: OfficeApplicationFormProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [name, setName] = useState(existingOffice?.name ?? '');
  const [phoneNumber, setPhoneNumber] = useState(existingOffice?.phone_number ?? '');
  const [email, setEmail] = useState(existingOffice?.email ?? '');
  const [address, setAddress] = useState(existingOffice?.address ?? '');
  const [cityId, setCityId] = useState(existingOffice?.city.id ?? '');
  const [neighborhoodId, setNeighborhoodId] = useState(existingOffice?.neighborhood.id ?? '');
  const [neighborhoods, setNeighborhoods] = useState<PublicNeighborhood[]>([]);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);
  const [files, setFiles] = useState<FileFields>({
    id_image: null,
    office_photo: null,
    commercial_license: null,
    office_license: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(
    existingOffice?.email?.toLowerCase() ?? null,
  );
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);

  const normalizedEmail = email.trim().toLowerCase();
  const { remainingSeconds, totalSeconds, canSend, startCooldown } = useEmailSendCooldown(normalizedEmail);
  const emailIsValid = useMemo(
    () => z.string().trim().email().safeParse(email).success,
    [email],
  );
  const emailIsVerified = verifiedEmail === normalizedEmail && emailIsValid;

  useEffect(() => {
    if (!existingOffice) return;
    let cancelled = false;
    setLoadingNeighborhoods(true);
    clientFetch<PublicNeighborhood[]>(bffPaths.neighborhoods.public, { params: { city_id: existingOffice.city.id } })
      .then((res) => {
        if (!cancelled) setNeighborhoods(res.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setNeighborhoods([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingNeighborhoods(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCityChange = async (value: string) => {
    setCityId(value);
    setNeighborhoodId('');
    setNeighborhoods([]);
    if (!value) return;

    setLoadingNeighborhoods(true);
    try {
      const res = await clientFetch<PublicNeighborhood[]>(bffPaths.neighborhoods.public, {
        params: { city_id: value },
      });
      setNeighborhoods(res.data ?? []);
    } catch {
      setNeighborhoods([]);
    } finally {
      setLoadingNeighborhoods(false);
    }
  };

  const handlePhoneNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(formatPhoneNumber(value));
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value.trim().toLowerCase() !== verifiedEmail) {
      setVerifiedEmail(null);
    }
  };

  const handleSendVerification = async () => {
    if (!emailIsValid || !canSend) return;

    setSendingVerification(true);
    try {
      await sendOfficeEmailVerification(normalizedEmail, existingOffice?.id);
      startCooldown();
      setVerifiedEmail(null);
      setVerificationModalOpen(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSendingVerification(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!emailIsVerified) {
      toast.error(t('dashboard.office.emailNotVerified'));
      return;
    }

    if (!files.id_image || !files.office_photo || !files.commercial_license || !files.office_license) {
      toast.error(t('dashboard.office.filesRequired'));
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('phone_number', phoneNumber.trim());
      formData.append('email', email.trim());
      formData.append('address', address.trim());
      formData.append('city_id', cityId);
      formData.append('neighborhood_id', neighborhoodId);
      formData.append('id_image', files.id_image);
      formData.append('office_photo', files.office_photo);
      formData.append('commercial_license', files.commercial_license);
      formData.append('office_license', files.office_license);

      if (existingOffice) {
        await resubmitOffice(existingOffice.id, formData);
      } else {
        await applyAsOffice(formData);
      }
      toast.success(t('dashboard.applicationSubmitted'));
      onSuccess?.();
      router.refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-primary-dark">{t('dashboard.office.name')}</span>
        <input required value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-primary-dark">{t('auth.phone')}</span>
          <input
            required
            type="tel"
            dir="ltr"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            className={fieldClass}
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-primary-dark">{t('dashboard.emailLabel')}</span>
          <div className="flex gap-2">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className={cn(fieldClass, 'min-w-0 flex-1')}
            />
            {emailIsValid ? (
              emailIsVerified ? (
                <div className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="hidden text-xs font-medium sm:inline">{t('dashboard.office.emailVerifiedBadge')}</span>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-11 shrink-0 whitespace-nowrap"
                  disabled={sendingVerification || !canSend}
                  onClick={() => void handleSendVerification()}
                >
                  {sendingVerification ? t('dashboard.office.sendingCode') : t('dashboard.office.verifyEmail')}
                </Button>
              )
            ) : null}
          </div>
          {emailIsValid && !emailIsVerified ? (
            <>
              <p className="text-xs text-gray-500">{t('dashboard.office.verifyEmailHint')}</p>
              <EmailSendCooldownBar remainingSeconds={remainingSeconds} totalSeconds={totalSeconds} />
            </>
          ) : null}
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-primary-dark">{t('admin.city')}</span>
          <select
            required
            value={cityId}
            onChange={(e) => void handleCityChange(e.target.value)}
            className={fieldClass}
          >
            <option value="">—</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-primary-dark">{t('dashboard.neighborhood')}</span>
          <select
            required
            value={neighborhoodId}
            onChange={(e) => setNeighborhoodId(e.target.value)}
            disabled={!cityId || loadingNeighborhoods}
            className={fieldClass}
          >
            <option value="">—</option>
            {neighborhoods.map((neighborhood) => (
              <option key={neighborhood.id} value={neighborhood.id}>
                {neighborhood.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-primary-dark">{t('dashboard.address')}</span>
        <input required value={address} onChange={(e) => setAddress(e.target.value)} className={fieldClass} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <FileUploadField
          label={t('dashboard.office.idImage')}
          accept="image/jpeg,image/png,image/webp,application/pdf"
          required
          value={files.id_image}
          onChange={(file) => setFiles((f) => ({ ...f, id_image: file }))}
        />
        <FileUploadField
          label={t('dashboard.office.officePhoto')}
          accept="image/jpeg,image/png,image/webp"
          required
          value={files.office_photo}
          onChange={(file) => setFiles((f) => ({ ...f, office_photo: file }))}
        />
        <FileUploadField
          label={t('dashboard.office.commercialLicense')}
          accept="image/jpeg,image/png,image/webp,application/pdf"
          required
          value={files.commercial_license}
          onChange={(file) => setFiles((f) => ({ ...f, commercial_license: file }))}
        />
        <FileUploadField
          label={t('dashboard.office.officeLicense')}
          accept="image/jpeg,image/png,image/webp,application/pdf"
          required
          value={files.office_license}
          onChange={(file) => setFiles((f) => ({ ...f, office_license: file }))}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
          {t('admin.cancel')}
        </Button>
        <Button type="submit" disabled={submitting || !emailIsVerified}>
          {submitting ? t('dashboard.submitting') : t('dashboard.submit')}
        </Button>
      </div>
    </form>

      <OfficeEmailVerificationModal
        open={verificationModalOpen}
        onOpenChange={setVerificationModalOpen}
        email={normalizedEmail}
        excludeOfficeId={existingOffice?.id}
        onVerified={(verified) => setVerifiedEmail(verified.toLowerCase())}
      />
    </>
  );
}
