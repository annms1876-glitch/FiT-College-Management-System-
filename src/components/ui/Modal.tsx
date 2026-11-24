import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cx } from '../../lib/cx';

/* -------------------------------------------------------------------------- */
/*  Modal stack — ensures Escape closes only the top-most dialog and that     */
/*  nested dialogs (e.g. Add student inside Student records) behave.          */
/* -------------------------------------------------------------------------- */
type Entry = { id: number; close: () => void };
const stack: Entry[] = [];
let modalCounter = 0;
let listening = false;

function syncScrollLock() {
  document.body.style.overflow = stack.length > 0 ? 'hidden' : '';
}

function ensureListener() {
  if (listening) return;
  listening = true;
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && stack.length > 0) {
      event.preventDefault();
      event.stopPropagation();
      stack[stack.length - 1].close();
    }
  });
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  icon,
  headerExtra,
  bodyClassName,
  hideClose,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  icon?: ReactNode;
  headerExtra?: ReactNode;
  bodyClassName?: string;
  hideClose?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const labelId = useId();
  const entryId = useRef(0);
  const restoreFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    ensureListener();
    restoreFocus.current = document.activeElement as HTMLElement;
    entryId.current = ++modalCounter;
    const entry: Entry = { id: entryId.current, close: () => closeRef.current() };
    stack.push(entry);
    syncScrollLock();

    const t = window.setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const first = panel.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? panel).focus({ preventScroll: true });
    }, 30);

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !panelRef.current) return;
      const nodes = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (n) => n.offsetParent !== null,
      );
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      const idx = stack.findIndex((s) => s.id === entryId.current);
      if (idx >= 0) stack.splice(idx, 1);
      syncScrollLock();
      restoreFocus.current?.focus?.({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;

  const widths = {
    sm: 'max-w-[420px]',
    md: 'max-w-[520px]',
    lg: 'max-w-[660px]',
    xl: 'max-w-[820px]',
    '2xl': 'max-w-[1040px]',
  };

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto p-4 sm:p-6 md:items-center">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="fixed inset-0 cursor-default bg-overlay animate-fade-in"
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        tabIndex={-1}
        className={cx(
          'relative my-auto flex max-h-[min(88vh,920px)] w-full flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-modal animate-scale-in focus:outline-none',
          widths[size],
        )}
      >
        <header className="flex items-start gap-3 border-b border-line px-5 py-4">
          {icon && <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-tint text-primary-tint-fg">{icon}</div>}
          <div className="min-w-0 flex-1">
            <h2 id={labelId} className="font-display text-[16px] font-bold leading-6 text-ink">
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 text-sm leading-5 text-muted">{subtitle}</p>}
          </div>
          {headerExtra}
          {!hideClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mr-1 -mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted transition-colors duration-120 hover:bg-surface-container hover:text-ink"
            >
              <X size={16} />
            </button>
          )}
        </header>
        <div className={cx('min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4', bodyClassName)}>{children}</div>
        {footer && <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-surface-low/60 px-5 py-3.5">{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}

/* -------------------------------------------------------------------------- */
/*  Confirm dialog                                                            */
/* -------------------------------------------------------------------------- */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  tone = 'danger',
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  tone?: 'danger' | 'primary';
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={description}
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 items-center rounded-md border border-line bg-surface px-3 text-sm font-semibold text-ink transition-colors duration-120 hover:bg-surface-container"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cx(
              'inline-flex h-8 items-center rounded-md px-3 text-sm font-semibold transition-all duration-120',
              tone === 'danger'
                ? 'bg-danger text-white hover:brightness-95'
                : 'bg-primary text-primary-fg hover:brightness-95',
            )}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="py-1" />
    </Modal>
  );
}
