import Link from 'next/link';
import { Building2, Home, RotateCcw, Search } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { cn } from '@/lib/utils/cn';

interface StatusPageAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface StatusPageProps {
  code: '404' | '500';
  title: string;
  description: string;
  primaryAction: StatusPageAction;
  secondaryAction?: StatusPageAction;
  showChrome?: boolean;
  className?: string;
}

export function StatusPage({
  code,
  title,
  description,
  primaryAction,
  secondaryAction,
  showChrome = false,
  className,
}: StatusPageProps) {
  return (
    <div className={cn('flex min-h-[70vh] flex-col', className)}>
      {showChrome ? (
        <header className="border-b border-gray-200/80 bg-white/90 backdrop-blur-sm">
          <Container>
            <div className="flex h-16 items-center">
              <Link href="/" className="flex items-center gap-2.5 group">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-md shadow-brand/20">
                  <Building2 className="h-4 w-4" />
                </span>
                <span className="text-base font-bold tracking-tight text-primary-dark">
                  <span className="text-brand">عقارات</span> اليمن
                </span>
              </Link>
            </div>
          </Container>
        </header>
      ) : null}

      <div className="relative flex flex-1 items-center justify-center overflow-hidden py-16 md:py-24">
        <div className="pointer-events-none absolute inset-0 mesh-hero" />
        <div className="pointer-events-none absolute -top-24 start-1/4 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 end-1/4 h-48 w-48 rounded-full bg-brand/5 blur-3xl" />

        <Container className="relative">
          <div className="mx-auto max-w-lg text-center">
            <div className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-brand-muted/80" />
              <span className="absolute inset-2 rounded-full bg-white shadow-[var(--shadow-soft)]" />
              <span className="relative text-4xl font-extrabold tracking-tight text-brand">{code}</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-primary-dark sm:text-3xl">{title}</h1>
            <p className="mt-3 text-base leading-relaxed text-gray-500">{description}</p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {primaryAction.href ? (
                <ButtonLink href={primaryAction.href} size="lg" className="min-w-[11rem] rounded-xl">
                  {code === '404' ? (
                    <Home className="h-4 w-4" aria-hidden />
                  ) : (
                    <RotateCcw className="h-4 w-4" aria-hidden />
                  )}
                  {primaryAction.label}
                </ButtonLink>
              ) : (
                <Button
                  type="button"
                  size="lg"
                  className="min-w-[11rem] rounded-xl"
                  onClick={primaryAction.onClick}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden />
                  {primaryAction.label}
                </Button>
              )}

              {secondaryAction ? (
                secondaryAction.href ? (
                  <ButtonLink
                    href={secondaryAction.href}
                    variant="outline"
                    size="lg"
                    className="min-w-[11rem] rounded-xl"
                  >
                    <Search className="h-4 w-4" aria-hidden />
                    {secondaryAction.label}
                  </ButtonLink>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="min-w-[11rem] rounded-xl"
                    onClick={secondaryAction.onClick}
                  >
                    <Home className="h-4 w-4" aria-hidden />
                    {secondaryAction.label}
                  </Button>
                )
              ) : null}
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
