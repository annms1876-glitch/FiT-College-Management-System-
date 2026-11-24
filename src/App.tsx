import { Suspense, lazy, useEffect, type ComponentType } from 'react';
import { Loader2 } from 'lucide-react';
import { Sidebar } from './components/layout/Sidebar';
import { CommandPalette } from './components/layout/CommandPalette';
import { Toaster } from './components/layout/Toaster';
import { useApp } from './store/AppStore';
import { navigate, useRoute } from './lib/hooks';
import { findLink } from './components/layout/nav';
import { uiBus } from './lib/events';
import type { NavKey } from './types';
import { Button } from './components/ui/primitives';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Students = lazy(() => import('./pages/Students'));
const Faculty = lazy(() => import('./pages/Faculty'));
const Timetable = lazy(() => import('./pages/Timetable'));
const Assignments = lazy(() => import('./pages/Assignments'));
const Scholarships = lazy(() => import('./pages/Scholarships'));
const Fees = lazy(() => import('./pages/Fees'));
const Grievances = lazy(() => import('./pages/Grievances'));
const Support = lazy(() => import('./pages/Support'));
const Library = lazy(() => import('./pages/Library'));
const Examinations = lazy(() => import('./pages/Examinations'));
const Notices = lazy(() => import('./pages/Notices'));
const Courses = lazy(() => import('./pages/Courses'));
const Workflow = lazy(() => import('./pages/Workflow'));
const Settings = lazy(() => import('./pages/Settings'));

const ROUTES: Record<string, ComponentType> = {
  '/dashboard': Dashboard,
  '/students': Students,
  '/faculty': Faculty,
  '/timetable': Timetable,
  '/assignments': Assignments,
  '/scholarships': Scholarships,
  '/fees': Fees,
  '/grievances': Grievances,
  '/support': Support,
  '/library': Library,
  '/examinations': Examinations,
  '/notices': Notices,
  '/courses': Courses,
  '/workflow': Workflow,
  '/settings': Settings,
};

const KEY_BY_PATH: Record<string, NavKey> = {
  '/dashboard': 'dashboard',
  '/students': 'students',
  '/faculty': 'faculty',
  '/timetable': 'timetable',
  '/assignments': 'assignments',
  '/scholarships': 'scholarships',
  '/fees': 'fees',
  '/grievances': 'grievances',
  '/support': 'support',
  '/library': 'library',
  '/examinations': 'examinations',
  '/notices': 'notices',
  '/courses': 'courses',
  '/workflow': 'workflow',
  '/settings': 'settings',
};

function ScreenLoader() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2">
      <Loader2 size={22} className="animate-spin text-primary" />
      <p className="text-xs text-muted">Loading workspace…</p>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 px-6 text-center">
      <p className="font-display text-[40px] font-bold text-ink">404</p>
      <p className="text-sm text-muted">That view doesn’t exist in the admin portal.</p>
      <Button size="sm" variant="primary" className="mt-2" onClick={() => navigate('/dashboard')}>
        Back to dashboard
      </Button>
    </div>
  );
}

export default function App() {
  const { sidebarCollapsed, setCommandOpen, setSidebarCollapsed, toggleTheme } = useApp();
  const route = useRoute();
  const key = (KEY_BY_PATH[route.path] ?? 'dashboard') as NavKey;
  const Page = ROUTES[route.path];

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      const target = event.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (mod && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen(true);
      } else if (mod && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        setSidebarCollapsed(!sidebarCollapsed);
      } else if (mod && event.key.toLowerCase() === 'j') {
        event.preventDefault();
        toggleTheme();
      } else if (mod && event.key.toLowerCase() === 'n' && !typing) {
        event.preventDefault();
        navigate('/students?new=1');
      } else if (event.key === '/' && !typing) {
        event.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setCommandOpen, setSidebarCollapsed, toggleTheme, sidebarCollapsed]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    uiBus.emit('mobile-nav:close');
  }, [route.path]);

  return (
    <div className="min-h-screen bg-surface-low">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-fg"
      >
        Skip to main content
      </a>

      <Sidebar
        active={key}
        onNavigate={(nav) => navigate(findLink(nav)?.path ?? '/dashboard')}
        onNewAction={() => navigate('/students?new=1')}
      />

      <div
        className="flex min-h-screen min-w-0 flex-col transition-[padding] duration-200 ease-out max-lg:!pl-0"
        style={{ paddingLeft: sidebarCollapsed ? 72 : 256 }}
      >
        <main id="main" className="min-w-0 flex-1 pb-6">
          <Suspense fallback={<ScreenLoader />}>
            {Page ? <Page /> : <NotFound />}
          </Suspense>
        </main>

        <footer className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-2 px-6 pb-5 text-[10px] text-muted">
          <span>© 2026 Vanguard Institute of Technology, Pune · AISHE C-41812 · AICTE 1-1023941</span>
          <span className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> All systems operational
            </span>
            <span className="text-line">|</span>
            <span>Data residency: Mumbai (ap-south-1)</span>
            <span className="text-line">|</span>
            <span className="mono">v2.6.0</span>
          </span>
        </footer>
      </div>

      <CommandPalette />
      <Toaster />
    </div>
  );
}
