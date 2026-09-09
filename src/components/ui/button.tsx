import Link from 'next/link';
import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils/cn';

const variants = {
  primary: 'bg-brand text-white hover:bg-brand-dark shadow-sm',
  primaryOutline: 'border border-brand bg-white text-brand hover:bg-brand-muted',
  outline: 'border border-gray-200 bg-white text-primary hover:bg-gray-50',
  ghost: 'text-primary hover:bg-gray-100',
  danger: 'bg-rose-500 text-white hover:bg-rose-600',
  dangerOutline: 'border border-rose-500 bg-white text-rose-500 hover:bg-rose-50',
} as const;

const sizes = {
  icon: 'p-2',
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
} as const;

type ButtonVariant = keyof typeof variants;
type ButtonSize = keyof typeof sizes;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', asChild = false, ...props },
  ref,
) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 cursor-pointer',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
});

interface ButtonLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function ButtonLink({
  href,
  children,
  className,
  variant = 'primary',
  size = 'md',
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors cursor-pointer',
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {children}
    </Link>
  );
}
