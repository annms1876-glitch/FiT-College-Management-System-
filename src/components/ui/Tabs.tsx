import { useRef, type ReactNode } from 'react';
import { cx } from '../../lib/cx';

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  count?: number;
}

export function Tabs({
  tabs,
  value,
  onChange,
  className,
  size = 'md',
}: {
  tabs: TabItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
  size?: 'md' | 'lg';
}) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const onKeyDown = (event: React.KeyboardEvent) => {
    const ids = tabs.map((t) => t.id);
    const idx = ids.indexOf(value);
    let next: string | undefined;
    if (event.key === 'ArrowRight') next = ids[(idx + 1) % ids.length];
    if (event.key === 'ArrowLeft') next = ids[(idx - 1 + ids.length) % ids.length];
    if (event.key === 'Home') next = ids[0];
    if (event.key === 'End') next = ids[ids.length - 1];
    if (next) {
      event.preventDefault();
      onChange(next);
      refs.current[next]?.focus();
    }
  };

  return (
    <div role="tablist" aria-orientation="horizontal" onKeyDown={onKeyDown} className={cx('flex items-center gap-0.5 border-b border-line', className)}>
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[tab.id] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={active}
            aria-controls={`panel-${tab.id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={cx(
              'relative -mb-px inline-flex items-center gap-2 border-b-2 font-semibold transition-colors duration-120',
              size === 'md' ? 'h-10 px-3 text-sm' : 'h-11 px-3.5 text-base',
              active
                ? 'border-primary text-ink'
                : 'border-transparent text-muted hover:border-line hover:text-ink',
            )}
          >
            {tab.icon}
            {tab.label}
            {typeof tab.count === 'number' && (
              <span
                className={cx(
                  'inline-flex min-w-[20px] justify-center rounded-full px-1.5 py-px font-mono text-[10px] font-medium tabular-nums',
                  active ? 'bg-primary-tint text-primary-tint-fg' : 'bg-surface-container text-muted',
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
