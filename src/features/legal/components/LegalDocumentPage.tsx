'use client';

import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { useLocale } from '@/lib/i18n/locale-provider';
import { getLegalDocument, type LegalDocumentId } from '@/features/legal/documents';

interface LegalDocumentPageProps {
  documentId: LegalDocumentId;
}

export function LegalDocumentPage({ documentId }: LegalDocumentPageProps) {
  const { locale, t } = useLocale();
  const doc = getLegalDocument(documentId, locale);

  return (
    <div className="py-10 lg:py-14">
      <Container>
        <div className="mx-auto max-w-3xl">
          <span className="mb-3 inline-flex rounded-full bg-brand-muted px-3 py-1 text-xs font-medium text-brand-dark">
            {t('legal.badge')}
          </span>
          <h1 className="text-3xl font-bold text-primary-dark lg:text-4xl">{doc.title}</h1>
          <p className="mt-2 text-sm text-gray-500">
            {t('legal.lastUpdated')}: {doc.lastUpdated}
          </p>
          <p className="mt-4 text-base leading-relaxed text-gray-600">{doc.subtitle}</p>

          <div className="mt-8 space-y-4 text-sm leading-relaxed text-gray-600">
            {doc.intro.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </div>

          <article className="mt-10 space-y-10">
            {doc.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-xl font-semibold text-primary-dark lg:text-2xl">{section.title}</h2>

                {section.callout ? (
                  <div className="mt-4 rounded-2xl border border-brand/20 bg-brand-muted/40 p-5">
                    <p className="font-semibold text-brand-dark">{section.callout.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-gray-600">{section.callout.body}</p>
                  </div>
                ) : null}

                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)} className="mt-4 text-sm leading-relaxed text-gray-600">
                    {paragraph}
                  </p>
                ))}

                {section.bullets?.length ? (
                  <ul className="mt-4 list-disc space-y-2 ps-5 text-sm leading-relaxed text-gray-600">
                    {section.bullets.map((item) => (
                      <li key={item.slice(0, 48)}>{item}</li>
                    ))}
                  </ul>
                ) : null}

                {section.ordered?.length ? (
                  <ol className="mt-4 list-decimal space-y-2 ps-5 text-sm leading-relaxed text-gray-600">
                    {section.ordered.map((item) => (
                      <li key={item.slice(0, 48)}>{item}</li>
                    ))}
                  </ol>
                ) : null}
              </section>
            ))}
          </article>

          <div className="mt-12 flex flex-wrap gap-4 text-sm">
            <Link href="/contact" className="text-brand hover:underline">
              {t('footer.contact')}
            </Link>
            <Link href="/privacy" className="text-brand hover:underline">
              {t('footer.privacy')}
            </Link>
            <Link href="/terms" className="text-brand hover:underline">
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
