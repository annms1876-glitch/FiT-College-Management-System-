import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react';
import { useApp } from '../../store/AppStore';
import { cx } from '../../lib/cx';

const icons = {
  success: CircleCheck,
  error: CircleAlert,
  warning: TriangleAlert,
  info: Info,
};

const tones = {
  success: 'text-success',
  error: 'text-danger',
  warning: 'text-warning',
  info: 'text-info',
};

export function Toaster() {
  const { toasts, dismissToast } = useApp();

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(92vw,364px)] flex-col-reverse gap-2"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const Icon = icons[toast.tone];
        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto flex items-start gap-2.5 rounded-lg border border-line bg-surface px-3.5 py-3 shadow-toast animate-toast-in"
          >
            <Icon size={16} className={cx('mt-px shrink-0', tones[toast.tone])} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold leading-5 text-ink">{toast.title}</p>
              {toast.description && <p className="mt-0.5 break-words text-[11.5px] leading-4 text-muted">{toast.description}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="-mr-1 -mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted transition-colors duration-120 hover:bg-surface-container hover:text-ink"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
