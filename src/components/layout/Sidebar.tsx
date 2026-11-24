import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  ChevronsLeft,
  ChevronsRight,
  History,
  KeyRound,
  LifeBuoy,
  LogOut,
  Plus,
  Search,
  Settings,
  User,
  X,
} from 'lucide-react';
import { AI_NAV, PRIMARY_NAV } from './nav';
import { cx } from '../../lib/cx';
import { useApp } from '../../store/AppStore';
import { useClickOutside } from '../../lib/hooks';
import { uiBus } from '../../lib/events';
import { Kbd } from '../ui/primitives';
import { ConfirmDialog } from '../ui/Modal';
import type { NavKey } from '../../types';

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-primary text-primary-fg shadow-sm">
        <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden>
          <path d="M6.5 6h3.6L12 13.6 13.9 6h3.6l-4 12h-3L6.5 6Z" fill="currentColor" />
        </svg>
      </span>
      {!compact && (
        <span className="sidebar-label min-w-0 leading-tight">
          <span className="block truncate font-display text-[14.5px] font-bold tracking-[-0.01em] text-ink">Vanguard</span>
          <span className="block truncate text-[10.5px] font-medium tracking-[0.02em] text-muted">Admin Portal</span>
        </span>
      )}
    </div>
  );
}

export function Sidebar({
  active,
  onNavigate,
  onNewAction,
}: {
  active: NavKey;
  onNavigate: (key: NavKey) => void;
  onNewAction: () => void;
}) {
  const { sidebarCollapsed, setSidebarCollapsed, setCommandOpen, pushToast } = useApp();
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const popoverRef = useClickOutside<HTMLDivElement>(() => setProfileOpen(false));
  const collapsed = sidebarCollapsed;

  useEffect(() => {
    const offToggle = uiBus.on('mobile-nav:toggle', () => setMobileOpen((v) => !v));
    const offClose = uiBus.on('mobile-nav:close', () => setMobileOpen(false));
    // Never start with the drawer covering content on a phone.
    if (window.matchMedia('(max-width: 1023px)').matches) setSidebarCollapsed(true);
    return () => {
      offToggle();
      offClose();
    };
  }, [setSidebarCollapsed]);

  const go = (key: NavKey) => {
    onNavigate(key);
    setProfileOpen(false);
    setMobileOpen(false);
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 cursor-default bg-overlay animate-fade-in lg:hidden"
        />
      )}
      <aside
      className={cx(
        'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-line bg-surface transition-transform duration-200 ease-out lg:transition-[width]',
        collapsed ? 'w-[72px] sidebar-collapsed' : 'w-[256px]',
        mobileOpen ? 'translate-x-0 shadow-modal' : '-translate-x-full lg:translate-x-0 lg:shadow-none',
        'lg:!translate-x-0',
      )}
      aria-label="Primary"
    >
      {/* Brand + collapse */}
      <div className={cx('flex h-14 shrink-0 items-center border-b border-line', collapsed ? 'justify-center px-3' : 'justify-between px-4')}>
        <button
          type="button"
          onClick={() => go('dashboard')}
          className="flex min-w-0 items-center rounded-md focus-visible:outline-none"
          aria-label="Vanguard dashboard"
        >
          <Logo compact={collapsed} />
        </button>
        {!collapsed && (
          <button
            type="button"
            onClick={() => setSidebarCollapsed(true)}
            aria-label="Collapse sidebar"
            title="Collapse sidebar (Ctrl B)"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors duration-120 hover:bg-surface-container hover:text-ink"
          >
            <ChevronsLeft size={15} />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          type="button"
          onClick={() => setSidebarCollapsed(false)}
          aria-label="Expand sidebar"
          title="Expand sidebar (Ctrl B)"
          className="mx-auto mt-2 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors duration-120 hover:bg-surface-container hover:text-ink"
        >
          <ChevronsRight size={15} />
        </button>
      )}

      {/* Utilities */}
      <div className={cx('shrink-0 pt-3', collapsed ? 'px-3' : 'px-3')}>
        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          title="Global search (Ctrl K)"
          className={cx(
            'flex h-9 w-full items-center gap-2.5 rounded-lg border border-line bg-surface-low text-sm text-muted transition-colors duration-120 hover:border-ink/15 hover:bg-surface-container hover:text-ink',
            collapsed ? 'justify-center px-0' : 'px-2.5',
          )}
        >
          <Search size={15} className="shrink-0" />
          {!collapsed && (
            <>
              <span className="sidebar-label flex-1 text-left text-[13px] font-medium">Global Search</span>
              <span className="sidebar-label flex items-center gap-0.5">
                <Kbd>Ctrl</Kbd>
                <Kbd>K</Kbd>
              </span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onNewAction}
          title="New action (Ctrl N)"
          className={cx(
            'mt-2 flex h-9 w-full items-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-fg shadow-sm transition-all duration-120 hover:brightness-[0.94] active:brightness-[0.88] dark:hover:brightness-110',
            collapsed ? 'justify-center px-0' : 'px-2.5',
          )}
        >
          <Plus size={15} strokeWidth={2.4} className="shrink-0" />
          {!collapsed && <span className="sidebar-label">New Action</span>}
          {!collapsed && <Kbd className="sidebar-label ml-auto !border-primary-fg/25 !bg-primary-fg/10 !text-primary-fg/80">N</Kbd>}
        </button>
      </div>

      {/* Navigation */}
      <nav className={cx('mt-4 min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-2 scroll-thin', collapsed ? 'px-3' : 'px-3')}>
        {!collapsed && (
          <p className="sidebar-label mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.09em] text-muted/70">Workspace</p>
        )}
        <ul className="flex flex-col gap-0.5">
          {PRIMARY_NAV.map((link) => {
            const Icon = link.icon;
            const isActive = active === link.key;
            return (
              <li key={link.key}>
                <button
                  type="button"
                  onClick={() => go(link.key)}
                  aria-current={isActive ? 'page' : undefined}
                  title={collapsed ? link.label : undefined}
                  className={cx('nav-item', isActive && 'nav-item-active', collapsed && 'justify-center px-0')}
                >
                  <Icon size={16} strokeWidth={isActive ? 2.2 : 1.9} className="shrink-0" aria-hidden />
                  {!collapsed && <span className="sidebar-label truncate">{link.label}</span>}
                  {isActive && !collapsed && (
                    <span className="sidebar-label ml-auto h-1.5 w-1.5 rounded-full bg-primary-tint-fg/70" aria-hidden />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* AI section */}
        <div className="mt-3 border-t border-line pt-3">
          {!collapsed && (
            <p className="sidebar-label mb-1.5 flex items-center gap-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.09em] text-muted/70">
              Automation
            </p>
          )}
          <button
            type="button"
            onClick={() => go(AI_NAV.key)}
            aria-current={active === AI_NAV.key ? 'page' : undefined}
            title={collapsed ? AI_NAV.label : undefined}
            className={cx(
              'group flex h-9 w-full items-center gap-2.5 rounded-lg border border-primary/15 bg-primary-tint px-2.5 text-sm font-semibold text-primary-tint-fg transition-all duration-120 hover:border-primary/30 hover:brightness-[0.985] dark:hover:brightness-110',
              active === AI_NAV.key && 'border-primary/40 ring-1 ring-primary/20',
              collapsed && 'justify-center px-0',
            )}
          >
            <AI_NAV.icon size={16} strokeWidth={2.1} className="shrink-0" aria-hidden />
            {!collapsed && (
              <>
                <span className="sidebar-label flex-1 truncate text-left">{AI_NAV.label}</span>
                <span className="sidebar-label rounded-full bg-primary px-1.5 py-[1px] font-display text-[9px] font-bold tracking-[0.08em] text-primary-fg">
                  AI
                </span>
              </>
            )}
          </button>
        </div>
      </nav>

      {/* Admin profile */}
      <div className="relative shrink-0 border-t border-line p-2.5" ref={popoverRef}>
        {profileOpen && (
          <div
            role="menu"
            aria-label="Admin menu"
            className="absolute bottom-[calc(100%-2px)] left-2 right-2 z-50 overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-pop animate-pop-in"
          >
            <div className="flex items-center gap-2.5 px-2.5 py-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-display text-[11px] font-bold text-primary-fg">RR</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">Dr. Rajeshwar Rao</p>
                <p className="truncate text-[11px] text-muted">Super Administrator</p>
              </div>
            </div>
            <div className="my-1 h-px bg-line" />
            <MenuItem icon={User} label="Profile" onClick={() => go('settings')} />
            <MenuItem icon={Settings} label="Account Settings" onClick={() => go('settings')} />
            <MenuItem icon={KeyRound} label="Permissions" hint="RBAC" onClick={() => go('settings')} />
            <MenuItem icon={History} label="Activity History" hint="Audit" onClick={() => go('workflow')} />
            <MenuItem icon={LifeBuoy} label="Support" onClick={() => pushToast({ title: 'Support centre', description: 'Helpdesk ticket raised · SLA 4 h', tone: 'info' })} />
            <div className="my-1 h-px bg-line" />
            <MenuItem icon={LogOut} label="Logout" danger onClick={() => setLogoutOpen(true)} />
            <div className="flex items-center justify-between px-2.5 pb-1.5 pt-1">
              <span className="text-[10px] text-muted">Session expires in 42 min</span>
              <button type="button" onClick={() => setProfileOpen(false)} aria-label="Close admin menu" className="text-muted hover:text-ink">
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setProfileOpen((v) => !v)}
          aria-expanded={profileOpen}
          aria-haspopup="menu"
          className={cx(
            'flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left transition-colors duration-120 hover:bg-surface-container',
            collapsed && 'justify-center',
          )}
        >
          <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-high font-display text-[10.5px] font-bold text-ink ring-1 ring-inset ring-line">
            RR
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-success" aria-label="Online" />
          </span>
          {!collapsed && (
            <span className="sidebar-label min-w-0 flex-1 leading-tight">
              <span className="block truncate text-[12.5px] font-semibold text-ink">Dr. Rajeshwar Rao</span>
              <span className="block truncate text-[10.5px] text-muted">Super Administrator</span>
            </span>
          )}
          {!collapsed && <ChevronsRight size={13} className="sidebar-label shrink-0 -rotate-90 text-muted" />}
        </button>
      </div>

      <ConfirmDialog
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={() => {
          setProfileOpen(false);
          pushToast({ title: 'Signed out of this demo session', description: 'Reconnect GitHub is not required — refresh to continue.', tone: 'info' });
        }}
        title="Sign out of Vanguard Admin?"
        description="Unsaved drafts in the AI orchestrator will remain in your audit history."
        confirmLabel="Sign out"
        tone="primary"
      />
    </aside>
    </>
  );
}

function MenuItem({
  icon: Icon,
  label,
  hint,
  onClick,
  danger,
}: {
  icon: typeof User;
  label: string;
  hint?: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cx(
        'flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-[13px] font-medium transition-colors duration-120',
        danger ? 'text-danger hover:bg-danger-soft' : 'text-ink hover:bg-surface-container',
      )}
    >
      <Icon size={14} className={danger ? 'text-danger' : 'text-muted'} aria-hidden />
      <span className="flex-1">{label}</span>
      {hint && <span className="font-mono text-[9px] uppercase tracking-wide text-muted">{hint}</span>}
      {!danger && !hint && <ArrowUpRight size={11} className="text-muted/50" />}
    </button>
  );
}
