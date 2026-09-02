import Link from 'next/link';

import { cn } from '@/lib/utils';

type BrandProps = {
  compact?: boolean;
  dark?: boolean;
  href?: string;
  className?: string;
};

export function Brand({
  compact = false,
  dark = false,
  href = '/',
  className,
}: BrandProps) {
  return (
    <Link
      href={href}
      aria-label="Gante Barbearia — início"
      className={cn('group inline-flex items-center gap-3', className)}
    >
      <span
        className={cn(
          'grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl border transition-all group-hover:scale-[1.03]',
          dark ? 'border-[#c7a35b]/45 shadow-[0_8px_24px_rgba(0,0,0,.18)]' : 'border-[#b6944e]/30 shadow-[0_8px_24px_rgba(23,59,43,.12)]',
        )}
      >
        <img src="/gante-symbol.png" alt="" className="size-full object-cover" />
      </span>
      {!compact && (
        <span className="leading-none">
          <span
            className={cn(
              'block font-serif text-xl tracking-[0.16em]',
              dark ? 'text-[#fbf7ef]' : 'text-[#173b2b]',
            )}
          >
            GANTE
          </span>
          <span
            className={cn(
              'mt-1 block text-[9px] font-semibold tracking-[0.34em]',
              dark ? 'text-[#d4cbb9]' : 'text-[#7b7162]',
            )}
          >
            BARBEARIA
          </span>
        </span>
      )}
    </Link>
  );
}
