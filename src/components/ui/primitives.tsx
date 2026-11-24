import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';
import { cx } from '../../lib/cx';
import { initials } from '../../lib/format';

/* -------------------------------------------------------------------------- */
/*  Button                                                                    */
/* -------------------------------------------------------------------------- */
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle' | 'link';
type Size = 'xs' | 'sm' | 'md';

const variants: Record<Variant, string> = {
  primary:
    'bg-primary text-primary-fg hover:brightness-[0.94] active:brightness-[0.88] dark:hover:brightness-110 shadow-sm',
  secondary:
    'border border-line bg-surface text-ink hover:bg-surface-container hover:border-ink/15 active:bg-surface-high',
  ghost: 'text-muted hover:bg-surface-container hover:text-ink active:bg-surface-high',
  danger:
    'border border-danger/25 bg-danger-soft text-danger hover:border-danger/40 hover:brightness-[0.985] active:brightness-95',
  subtle: 'bg-primary-tint text-primary-tint-fg hover:brightness-[0.97] dark:hover:brightness-125',
  link: 'text-primary hover:underline underline-offset-2 px-0',
};

const sizes: Record<Size, string> = {
  xs: 'h-7 px-2 text-xs gap-1 rounded-sm',
  sm: 'h-8 px-2.5 text-sm gap-1.5',
  md: 'h-9 px-3.5 text-base gap-2',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  loading?: boolean;
  full?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'sm', icon: Icon, iconRight: IconRight, loading, full, className, children, disabled, ...rest },
  ref,
) {
  const iconSize = size === 'xs' ? 13 : size === 'sm' ? 14 : 15;
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || loading}
      className={cx(
        'inline-flex select-none items-center justify-center whitespace-nowrap rounded-md font-semibold transition-all duration-120 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        variants[variant] !== variants.link && sizes[size],
        full && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 size={iconSize} className="animate-spin" />
      ) : (
        Icon && <Icon size={iconSize} strokeWidth={2.1} aria-hidden />
      )}
      {children}
      {IconRight && <IconRight size={iconSize} strokeWidth={2.1} className="opacity-80" aria-hidden />}
    </button>
  );
});

/* -------------------------------------------------------------------------- */
/*  IconButton                                                                */
/* -------------------------------------------------------------------------- */
export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string;
  size?: 'sm' | 'md';
  variant?: 'ghost' | 'secondary' | 'danger';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon: Icon, label, size = 'sm', variant = 'ghost', className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-md transition-colors duration-120 focus-visible:outline-none',
        size === 'sm' ? 'h-8 w-8' : 'h-9 w-9',
        variant === 'ghost' && 'text-muted hover:bg-surface-container hover:text-ink',
        variant === 'secondary' && 'border border-line bg-surface text-muted hover:bg-surface-container hover:text-ink',
        variant === 'danger' && 'text-muted hover:bg-danger-soft hover:text-danger',
        className,
      )}
      {...rest}
    >
      <Icon size={size === 'sm' ? 15 : 17} strokeWidth={2} aria-hidden />
    </button>
  );
});

/* -------------------------------------------------------------------------- */
/*  Badge                                                                     */
/* -------------------------------------------------------------------------- */
export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'info' | 'danger' | 'outline';

const badgeTones: Record<BadgeTone, string> = {
  neutral: 'bg-surface-container text-muted',
  primary: 'bg-primary-tint text-primary-tint-fg',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  info: 'bg-info-soft text-info',
  danger: 'bg-danger-soft text-danger',
  outline: 'border border-line bg-surface text-muted',
};

export function Badge({
  children,
  tone = 'neutral',
  dot,
  icon: Icon,
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  dot?: boolean;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <span
      className={cx(
        'inline-flex h-[22px] items-center gap-1 whitespace-nowrap rounded-full px-2 text-xs font-semibold leading-none tracking-[-0.005em]',
        badgeTones[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />}
      {Icon && <Icon size={11} strokeWidth={2.4} aria-hidden />}
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Kbd                                                                       */
/* -------------------------------------------------------------------------- */
export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cx(
        'inline-flex h-[18px] min-w-[18px] items-center justify-center rounded border border-line bg-surface-low px-1 font-mono text-[10px] font-medium text-muted',
        className,
      )}
    >
      {children}
    </kbd>
  );
}

/* -------------------------------------------------------------------------- */
/*  Avatar                                                                    */
/* -------------------------------------------------------------------------- */
export function Avatar({
  name,
  size = 'md',
  tone,
  className,
}: {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  tone?: string;
  className?: string;
}) {
  const dims = {
    xs: 'h-6 w-6 text-[9px]',
    sm: 'h-7 w-7 text-[10px]',
    md: 'h-9 w-9 text-[11px]',
    lg: 'h-11 w-11 text-[13px]',
    xl: 'h-16 w-16 text-lg',
  }[size];
  // Deterministic tint from the name for visual variety.
  const hash = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const tints = ['#4F46E5', '#0D9488', '#B45309', '#BE185D', '#1D4ED8', '#7C3AED', '#15803D'];
  const bg = tone ?? tints[hash % tints.length];
  return (
    <span
      className={cx(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-display font-bold uppercase leading-none text-white',
        dims,
        className,
      )}
      style={{ backgroundColor: bg }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Progress                                                                  */
/* -------------------------------------------------------------------------- */
export function Progress({
  value,
  tone = 'rgb(var(--primary))',
  height = 'h-1.5',
  label,
  className,
}: {
  value: number;
  tone?: string;
  height?: string;
  label?: string;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cx('w-full overflow-hidden rounded-full bg-surface-high', height, className)}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${clamped}%`, backgroundColor: tone }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Empty state                                                               */
/* -------------------------------------------------------------------------- */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={cx('flex flex-col items-center justify-center text-center', compact ? 'px-6 py-10' : 'px-6 py-16')}>
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface-low text-muted">
        <Icon size={19} strokeWidth={1.7} aria-hidden />
      </div>
      <p className="text-md font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Section card                                                              */
/* -------------------------------------------------------------------------- */
export function SectionCard({
  title,
  subtitle,
  icon: Icon,
  actions,
  children,
  className,
  bodyClassName,
  flush,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  icon?: LucideIcon;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  flush?: boolean;
}) {
  return (
    <section className={cx('card flex min-w-0 flex-col', className)}>
      {(title || actions) && (
        <header className="flex min-h-[52px] items-start justify-between gap-4 px-5 pb-3 pt-4">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 font-display text-[15px] font-bold leading-5 text-ink">
              {Icon && <Icon size={15} strokeWidth={2.1} className="text-muted" aria-hidden />}
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
        </header>
      )}
      <div className={cx(flush ? '' : 'px-5 pb-5', bodyClassName, 'min-w-0 flex-1')}>{children}</div>
    </section>
  );
}
