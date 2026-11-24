import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { cx } from '../../lib/cx';

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: {
  label?: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('min-w-0', className)}>
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted">
          {label}
          {required && <span className="text-danger">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1 text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs leading-4 text-muted/90">{hint}</p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...rest },
  ref,
) {
  return <input ref={ref} className={cx('field-input', className)} {...rest} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        className={cx(
          'min-h-[84px] w-full resize-y rounded-md border border-line bg-surface px-3 py-2 text-sm leading-5 text-ink placeholder:text-muted/60 transition-colors duration-150 hover:border-ink/20 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/15',
          className,
        )}
        {...rest}
      />
    );
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...rest },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cx(
          'field-input appearance-none pr-8 font-medium',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted" />
    </div>
  );
});

export function SearchInput({
  value,
  onChange,
  placeholder,
  className,
  onClear,
  shortcut,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  onClear?: () => void;
  shortcut?: ReactNode;
}) {
  return (
    <div className={cx('relative', className)}>
      <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="field-input pl-8 pr-8"
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            onChange('');
            onClear?.();
          }}
          aria-label="Clear search"
          className="absolute right-1.5 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-muted transition-colors duration-120 hover:bg-surface-container hover:text-ink"
        >
          <X size={13} />
        </button>
      ) : (
        shortcut && <div className="absolute right-2 top-1/2 -translate-y-1/2">{shortcut}</div>
      )}
    </div>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  description,
  disabled,
  className,
  id,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  className?: string;
  id?: string;
}) {
  return (
    <label
      htmlFor={id}
      className={cx(
        'flex cursor-pointer select-none items-start gap-2.5 rounded-md p-2 transition-colors duration-120 hover:bg-surface-low',
        disabled && 'cursor-not-allowed opacity-60 hover:bg-transparent',
        className,
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-pointer rounded-[4px] border-line accent-primary"
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium leading-5 text-ink">{label}</span>
        {description && <span className="block text-xs leading-4 text-muted">{description}</span>}
      </span>
    </label>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-150',
        checked ? 'bg-primary' : 'bg-surface-high border border-line',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <span
        className={cx(
          'inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-150',
          checked ? 'translate-x-[19px]' : 'translate-x-[3px]',
        )}
      />
    </button>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'sm',
  className,
}: {
  options: { value: T; label: ReactNode; icon?: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  size?: 'xs' | 'sm';
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cx('inline-flex items-center gap-0.5 rounded-md border border-line bg-surface-low p-0.5', className)}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          role="tab"
          aria-selected={value === opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cx(
            'inline-flex items-center gap-1.5 rounded-[5px] font-semibold transition-all duration-120',
            size === 'xs' ? 'h-6 px-2 text-xs' : 'h-7 px-2.5 text-sm',
            value === opt.value
              ? 'bg-surface text-ink shadow-sm ring-1 ring-line'
              : 'text-muted hover:text-ink',
          )}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
