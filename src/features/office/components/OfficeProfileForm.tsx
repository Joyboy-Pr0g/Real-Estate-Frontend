'use client';

import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toaster';
import { sendOfficeEmailVerification, updateOffice } from '@/features/office/services/office-client';
import { OfficeEmailVerificationModal } from '@/features/office/components/OfficeEmailVerificationModal';
import { OfficeDetail } from '@/features/office/types/office';
import { PublicCity } from '@/features/catalog/types/catalog';
import { PublicNeighborhood } from '@/features/catalog/types/neighborhood';
import { clientFetch } from '@/lib/api/client';
import { bffPaths } from '@/lib/api/endpoints';
import { getErrorMessage } from '@/lib/errors/api-error';
import { useLocale } from '@/lib/i18n/locale-provider';
import { formatPhoneNumber } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface OfficeProfileFormProps {
  office: OfficeDetail;
  cities: PublicCity[];
  initialNeighborhoods: PublicNeighborhood[];
  onDone: () => void;
}

const fieldClass =
  'h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm outline-none focus:border-brand/40 focus:bg-white';
const fileClass =
  'block w-full text-sm text-gray-600 file:me-3 file:rounded-lg file:border-0 file:bg-brand-muted file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-dark';

export function OfficeProfileForm({ office, cities, initialNeighborhoods, onDone }: OfficeProfileFormProps) {
  const { t } = useLocale();
  const router = useRouter();
  const originalEmail = useMemo(() => office.email.trim().toLowerCase(), [office.email]);

  const [name, setName] = useState(office.name);
  const [phoneNumber, setPhoneNumber] = useState(formatPhoneNumber(office.phone_number));
  const [email, setEmail] = useState(office.email);
  const [address, setAddress] = useState(office.address);
  const [cityId, setCityId] = useState(office.city.id);
  const [neighborhoodId, setNeighborhoodId] = useState(office.neighborhood.id);
  const [neighborhoods, setNeighborhoods] = useState<PublicNeighborhood[]>(initialNeighborhoods);
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(false);
  const [officePhoto, setOfficePhoto] = useState<File | null>(null);
  const [idImage, setIdImage] = useState<File | null>(null);
  const [commercialLicense, setCommercialLicense] = useState<File | null>(null);
  const [officeLicense, setOfficeLicense] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [verifiedNewEmail, setVerifiedNewEmail] = useState<string | null>(null);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);

  const normalizedEmail = email.trim().toLowerCase();
  const emailChanged = normalizedEmail !== originalEmail;
  const emailIsValid = useMemo(
    () => z.string().trim().email().safeParse(email).success,
    [email],
  );
  const emailIsVerified = !emailChanged || (emailIsValid && verifiedNewEmail === normalizedEmail);

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
    setPhoneNumber(formatPhoneNumber(e.target.value));
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    const nextNormalized = value.trim().toLowerCase();
    if (verifiedNewEmail && nextNormalized !== verifiedNewEmail) {
      setVerifiedNewEmail(null);
    }
  };

  const handleSendVerification = async () => {
    if (!emailIsValid || !emailChanged) return;

    setSendingVerification(true);
    try {
      await sendOfficeEmailVerification(normalizedEmail, office.id);
      setVerifiedNewEmail(null);
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

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('phone_number', phoneNumber.trim());
      formData.append('email', email.trim());
      formData.append('address', address.trim());
      formData.append('city_id', cityId);
      formData.append('neighborhood_id', neighborhoodId);
      if (officePhoto) formData.append('office_photo', officePhoto);
      if (idImage) formData.append('id_image', idImage);
      if (commercialLicense) formData.append('commercial_license', commercialLicense);
      if (officeLicense) formData.append('office_license', officeLicense);

      await updateOffice(office.id, formData);
      toast.success(t('dashboard.office.updated'));
      router.refresh();
      onDone();
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
              {emailChanged && emailIsValid ? (
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
                    disabled={sendingVerification}
                    onClick={() => void handleSendVerification()}
                  >
                    {sendingVerification ? t('dashboard.office.sendingCode') : t('dashboard.office.verifyEmail')}
                  </Button>
                )
              ) : null}
            </div>
            {emailChanged && emailIsValid && !emailIsVerified ? (
              <p className="text-xs text-gray-500">{t('dashboard.office.verifyEmailHint')}</p>
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
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('dashboard.office.officePhoto')}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setOfficePhoto(e.target.files?.[0] ?? null)}
              className={fileClass}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('dashboard.office.idImage')}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => setIdImage(e.target.files?.[0] ?? null)}
              className={fileClass}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('dashboard.office.commercialLicense')}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => setCommercialLicense(e.target.files?.[0] ?? null)}
              className={fileClass}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-primary-dark">{t('dashboard.office.officeLicense')}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => setOfficeLicense(e.target.files?.[0] ?? null)}
              className={fileClass}
            />
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onDone} disabled={submitting}>
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
        excludeOfficeId={office.id}
        onVerified={(verified) => setVerifiedNewEmail(verified.toLowerCase())}
      />
    </>
  );
}
