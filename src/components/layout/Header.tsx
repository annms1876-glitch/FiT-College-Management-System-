import type { ReactNode } from 'react';
import { CalendarRange, CloudCheck, Menu, Moon, Search as SearchIcon, Sun } from 'lucide-react';
import { useApp } from '../../store/AppStore';
import { AY } from '../../data/departments';
import { uiBus } from '../../lib/events';
import { cx } from '../../lib/cx';

export function Header({
  title,
  kicker,
  actions,
  badge,
}: {
  title: string;
  kicker?: string;
  actions?: ReactNode;
  badge?: ReactNode;
}) {
  const { theme, toggleTheme, setCommandOpen } = useApp();

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b border-line bg-surface/90 px-6 backdrop-blur-md">
      <button
        type="button"
        onClick={() => uiBus.emit('mobile-nav:toggle')}
        aria-label="Open navigation"
        className="-ml-2 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors duration-120 hover:bg-surface-container hover:text-ink lg:hidden"
      >
        <Menu size={17} />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h1 className="truncate font-display text-[17px] font-bold leading-6 tracking-[-0.015em] text-ink">{title}</h1>
          {badge}
        </div>
        {kicker && <p className="truncate text-[11.5px] leading-4 text-muted">{kicker}</p>}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span
          className="hidden h-7 items-center gap-1.5 rounded-full border border-line bg-surface-low px-2.5 text-[11px] font-semibold text-muted xl:inline-flex"
          title="Academic year and semester"
        >
          <CalendarRange size={12} className="text-muted" aria-hidden />
          {AY} <span className="text-line">·</span> Odd Sem
        </span>
        <span className="hidden h-7 items-center gap-1.5 rounded-full border border-success/20 bg-success-soft px-2.5 text-[11px] font-semibold text-success lg:inline-flex">
          <CloudCheck size={12} aria-hidden />
          ERP synced
        </span>

        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          aria-label="Global search"
          title="Global search (Ctrl K)"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-line bg-surface text-muted transition-colors duration-120 hover:border-ink/15 hover:bg-surface-container hover:text-ink md:hidden"
        >
          <SearchIcon size={13} />
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`${theme === 'dark' ? 'Light' : 'Dark'} mode (Ctrl J)`}
          className="inline-flex h-7 items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 text-[11px] font-semibold text-muted transition-colors duration-120 hover:border-ink/15 hover:bg-surface-container hover:text-ink"
        >
          {theme === 'dark' ? <Sun size={13} aria-hidden /> : <Moon size={13} aria-hidden />}
          <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        {actions && (
          <div className={cx('ml-1 flex items-center gap-1.5 border-l border-line pl-2.5')}>{actions}</div>
        )}
      </div>
    </header>
  );
}

export function PageScroll({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx('mx-auto w-full max-w-[1440px] px-6 py-5', className)}>{children}</div>
  );
}

export function PageStack({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4">{children}</div>;
}
