import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  CornerDownLeft,
  FileText,
  GraduationCap,
  Megaphone,
  Search,
  Sparkles,
  UserPlus,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { useApp } from '../../store/AppStore';
import { NAV_LINKS } from './nav';
import { navigate } from '../../lib/hooks';
import { cx } from '../../lib/cx';
import { Kbd } from '../ui/primitives';
import type { NavKey } from '../../types';

interface Item {
  id: string;
  label: string;
  hint?: string;
  group: string;
  icon: LucideIcon;
  to: string;
  keywords?: string;
  meta?: string;
}

export function CommandPalette() {
  const { commandOpen, setCommandOpen, students, faculty, courses, notices } = useApp();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!commandOpen) return;
    const handler = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) setCommandOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [commandOpen, setCommandOpen]);

  useEffect(() => {
    if (commandOpen) {
      setQuery('');
      setActive(0);
      const t = window.setTimeout(() => inputRef.current?.focus(), 40);
      return () => window.clearTimeout(t);
    }
  }, [commandOpen]);

  const navItems: Item[] = NAV_LINKS.map((l) => ({
    id: `nav-${l.key}`,
    label: l.label,
    hint: l.title,
    group: 'Navigate',
    icon: l.icon,
    to: l.path,
    keywords: `${l.label} ${l.key} ${l.kicker}`,
  }));

  const actions: Item[] = [
    { id: 'act-student', label: 'Add new student', hint: 'Student Records', group: 'Quick actions', icon: UserPlus, to: '/students?new=1', keywords: 'create enrol admission' },
    { id: 'act-faculty', label: 'Add faculty member', hint: 'Faculty Management', group: 'Quick actions', icon: GraduationCap, to: '/faculty?new=1', keywords: 'create hire professor' },
    { id: 'act-notice', label: 'Create notice', hint: 'Notices & Announcements', group: 'Quick actions', icon: Megaphone, to: '/notices?new=1', keywords: 'announce publish circular' },
    { id: 'act-assignment', label: 'Create assignment', hint: 'Assignment Management', group: 'Quick actions', icon: ClipboardList, to: '/assignments?new=1', keywords: 'homework submission due' },
    { id: 'act-course', label: 'Add course', hint: 'Course Information', group: 'Quick actions', icon: BookOpen, to: '/courses?new=1', keywords: 'curriculum nep credits' },
    { id: 'act-payment', label: 'Record fee payment', hint: 'Fees & Submissions', group: 'Quick actions', icon: Wallet, to: '/fees?tab=submissions&new=1', keywords: 'upi neft receipt utr' },
    { id: 'act-workflow', label: 'Ask the AI orchestrator', hint: 'Agentic Workflow', group: 'Quick actions', icon: Sparkles, to: '/workflow', keywords: 'agent ai prompt automation' },
  ];

  const records: Item[] = useMemo(() => {
    const list: Item[] = [];
    students.slice(0, 60).forEach((s) =>
      list.push({
        id: `stu-${s.id}`,
        label: s.name,
        hint: `${s.roll} · ${s.dept} · Sem ${s.semester}`,
        group: 'Student records',
        icon: Users,
        to: `/students?student=${s.roll}`,
        keywords: `${s.name} ${s.roll} ${s.email} ${s.dept}`,
        meta: s.roll,
      }),
    );
    faculty.slice(0, 30).forEach((f) =>
      list.push({
        id: `fac-${f.id}`,
        label: f.name,
        hint: `${f.id} · ${f.dept} · ${f.designation}`,
        group: 'Faculty',
        icon: GraduationCap,
        to: `/faculty?faculty=${f.id}`,
        keywords: `${f.name} ${f.id} ${f.dept} ${f.specialization}`,
        meta: f.id,
      }),
    );
    courses.slice(0, 20).forEach((c) =>
      list.push({
        id: `crs-${c.id}`,
        label: `${c.code} · ${c.title}`,
        hint: `${c.dept} · Sem ${c.semester} · ${c.credits} credits`,
        group: 'Courses',
        icon: BookOpen,
        to: `/courses?course=${c.code}`,
        keywords: `${c.code} ${c.title} ${c.dept}`,
        meta: c.code,
      }),
    );
    notices.slice(0, 10).forEach((n) =>
      list.push({
        id: `nt-${n.id}`,
        label: n.title,
        hint: `${n.category} · ${n.audience}`,
        group: 'Notices',
        icon: FileText,
        to: '/notices',
        keywords: `${n.title} ${n.category}`,
      }),
    );
    return list;
  }, [students, faculty, courses, notices]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = [...actions, ...navItems, ...records];
    if (!q) return { pool: [...actions.slice(0, 5), ...navItems.slice(0, 8)], total: actions.length + navItems.length };
    const scored = pool
      .map((item) => {
        const hay = `${item.label} ${item.hint ?? ''} ${item.keywords ?? ''}`.toLowerCase();
        if (!hay.includes(q)) return null;
        let score = 0;
        if (item.label.toLowerCase().startsWith(q)) score += 100;
        if (item.label.toLowerCase().includes(q)) score += 40;
        if ((item.meta ?? '').toLowerCase().startsWith(q)) score += 60;
        score -= item.label.length * 0.05;
        return { item, score };
      })
      .filter(Boolean) as { item: Item; score: number }[];
    scored.sort((a, b) => b.score - a.score);
    const picked = scored.slice(0, 24).map((s) => s.item);
    return { pool: picked, total: scored.length };
  }, [query, actions, navItems, records]);

  const grouped = useMemo(() => {
    const map = new Map<string, Item[]>();
    results.pool.forEach((item) => {
      const list = map.get(item.group) ?? [];
      list.push(item);
      map.set(item.group, list);
    });
    return [...map.entries()];
  }, [results]);

  const flat = useMemo(() => grouped.flatMap(([, items]) => items), [grouped]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (!commandOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setCommandOpen(false);
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActive((a) => Math.min(flat.length - 1, a + 1));
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActive((a) => Math.max(0, a - 1));
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        const item = flat[active];
        if (item) {
          setCommandOpen(false);
          navigate(item.to);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [commandOpen, flat, active, setCommandOpen]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!commandOpen) return null;

  let runningIdx = -1;

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[12vh]">
      <button
        type="button"
        aria-label="Close search"
        tabIndex={-1}
        onClick={() => setCommandOpen(false)}
        className="fixed inset-0 cursor-default bg-overlay animate-fade-in"
      />
      <div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
        className="relative flex w-full max-w-[620px] flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-modal animate-scale-in"
      >
        <div className="flex items-center gap-2.5 border-b border-line px-4 py-3">
          <Search size={17} className="shrink-0 text-muted" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students, faculty, courses, modules or actions…"
            aria-label="Search"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-results"
            aria-activedescendant={flat[active] ? `cmd-${flat[active].id}` : undefined}
            className="h-6 w-full bg-transparent text-md text-ink placeholder:text-muted/70 focus:outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          <Kbd>Esc</Kbd>
        </div>

        <div id="command-results" ref={listRef} role="listbox" aria-label="Search results" className="max-h-[min(58vh,420px)] overflow-y-auto p-1.5 scroll-thin">
          {flat.length === 0 && (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-semibold text-ink">No matches for “{query}”</p>
              <p className="mt-1 text-xs text-muted">Try a roll number like 2023CSEB104, a module name, or “scholarship”.</p>
            </div>
          )}
          {grouped.map(([group, items]) => (
            <div key={group} className="mb-1">
              <p className="px-2.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted/80">{group}</p>
              {items.map((item) => {
                runningIdx += 1;
                const idx = runningIdx;
                const Icon = item.icon;
                const isActive = idx === active;
                return (
                  <button
                    key={item.id}
                    id={`cmd-${item.id}`}
                    data-idx={idx}
                    role="option"
                    aria-selected={isActive}
                    type="button"
                    onMouseMove={() => setActive(idx)}
                    onClick={() => {
                      setCommandOpen(false);
                      navigate(item.to);
                    }}
                    className={cx(
                      'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors duration-120',
                      isActive ? 'bg-primary-tint' : 'hover:bg-surface-low',
                    )}
                  >
                    <Icon size={14} className={cx('shrink-0', isActive ? 'text-primary-tint-fg' : 'text-muted')} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className={cx('block truncate text-[13px]', isActive ? 'font-semibold text-primary-tint-fg' : 'font-medium text-ink')}>
                        {item.label}
                      </span>
                      {item.hint && (
                        <span className={cx('block truncate text-[11px]', isActive ? 'text-primary-tint-fg/75' : 'text-muted')}>{item.hint}</span>
                      )}
                    </span>
                    {item.meta && <span className="shrink-0 font-mono text-[10px] text-muted">{item.meta}</span>}
                    {isActive && <CornerDownLeft size={12} className="shrink-0 text-primary-tint-fg/70" aria-hidden />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line bg-surface-low/70 px-3.5 py-2 text-[10.5px] text-muted">
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <Kbd>↵</Kbd> open
            </span>
            <span className="hidden items-center gap-1 sm:flex">
              <Kbd>Esc</Kbd> close
            </span>
          </span>
          <span className="hidden items-center gap-1.5 sm:flex">
            {results.total} result{results.total === 1 ? '' : 's'}
            <ArrowRight size={11} />
          </span>
        </div>
      </div>
    </div>
  );
}

export const QUICK_ACTIONS: { id: string; label: string; to: string; icon: LucideIcon; nav: NavKey }[] = [
  { id: 'qa-student', label: 'Add Student', to: '/students?new=1', icon: UserPlus, nav: 'students' },
  { id: 'qa-faculty', label: 'Add Faculty', to: '/faculty?new=1', icon: GraduationCap, nav: 'faculty' },
  { id: 'qa-notice', label: 'Create Notice', to: '/notices?new=1', icon: Megaphone, nav: 'notices' },
  { id: 'qa-assignment', label: 'Create Assignment', to: '/assignments?new=1', icon: ClipboardList, nav: 'assignments' },
  { id: 'qa-timetable', label: 'Create Timetable', to: '/timetable?publish=1', icon: Sparkles, nav: 'timetable' },
  { id: 'qa-course', label: 'Add Course', to: '/courses?new=1', icon: BookOpen, nav: 'courses' },
];
