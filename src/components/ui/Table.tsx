import type { ReactNode } from 'react';
import { cx } from '../../lib/cx';

export function TableShell({
  children,
  footer,
  className,
  dense,
}: {
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  dense?: boolean;
}) {
  return (
    <div className={cx('card overflow-hidden', className)}>
      <div className="overflow-x-auto scroll-thin">
        <table className={cx('w-full border-collapse text-left', dense ? 'text-sm' : '')}>{children}</table>
      </div>
      {footer && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface-low/60 px-4 py-2.5 text-xs text-muted">
          {footer}
        </div>
      )}
    </div>
  );
}

export function Th({
  children,
  className,
  align = 'left',
}: {
  children?: ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
}) {
  return (
    <th
      scope="col"
      className={cx(
        'whitespace-nowrap border-b border-line bg-surface-low/70 px-4 py-2.5 text-2xs font-semibold uppercase tracking-[0.07em] text-muted',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
  align = 'left',
  colSpan,
}: {
  children?: ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={cx(
        'border-b border-line/70 px-4 py-2.5 text-sm text-ink last:border-b-0',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className,
      )}
    >
      {children}
    </td>
  );
}

export function Tr({
  children,
  onClick,
  className,
  interactive,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <tr
      onClick={onClick}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={cx(
        'transition-colors duration-120',
        interactive && 'cursor-pointer hover:bg-surface-low focus:bg-surface-low focus:outline-none',
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function TableFooterMeta({ shown, total, unit = 'records' }: { shown: number; total: number; unit?: string }) {
  return (
    <span className="tabular-nums">
      Showing <span className="font-semibold text-ink">{shown}</span> of {new Intl.NumberFormat('en-IN').format(total)} {unit}
    </span>
  );
}
