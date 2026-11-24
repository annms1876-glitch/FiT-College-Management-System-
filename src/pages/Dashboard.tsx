import { useMemo, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, BarChart3, BellRing, BookOpen, CalendarDays, ClipboardList, GraduationCap, Landmark, LayoutGrid, Lock, Megaphone, Pin, Plus, RotateCcw, ShieldAlert, SlidersHorizontal, Sparkles, TriangleAlert, UserPlus, Users, Wallet, type LucideIcon } from 'lucide-react';
import { Header, PageScroll, PageStack } from '../components/layout/Header';
import { BarList, Histogram, LineAreaChart, RadialGauge, Sparkline, useChartColors } from '../components/charts/Charts';
import { Badge, Button, SectionCard } from '../components/ui/primitives';
import { Checkbox, Switch } from '../components/ui/Form';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../store/AppStore';
import { DEPARTMENTS } from '../data/departments';
import { CGPA_BANDS, ENROLLMENT_HISTORY, STUDENT_STATS } from '../data/seed/students';
import { FACULTY_STATS } from '../data/seed/faculty';
import { ASSIGNMENT_STATS } from '../data/seed/academics';
import { FEE_TOTALS, GRIEVANCE_STATS, SCHOLARSHIP_STATS } from '../data/seed/finance';
import { compactInr, fmtDate, inr, num, pct } from '../lib/format';
import { navigate } from '../lib/hooks';
import { cx } from '../lib/cx';
import type { NavKey } from '../types';

const KPI_DEFS = [
  { id: 'students', label: 'Total Students', value: '4,820', sub: '+184 this year', trend: [3980, 4235, 4482, 4660, 4820], tone: 'primary' as const, icon: Users, to: '/students', delta: '+3.4%' },
  { id: 'faculty', label: 'Total Faculty', value: '284', sub: '9 departments', trend: [236, 248, 262, 271, 284], tone: 'info' as const, icon: GraduationCap, to: '/faculty', delta: '+12' },
  { id: 'departments', label: 'Departments', value: '9', sub: '3 autonomous programs', trend: [7, 8, 8, 9, 9], tone: 'neutral' as const, icon: Landmark, to: '/courses', delta: 'Stable' },
  { id: 'courses', label: 'Active Courses', value: '142', sub: 'NEP-2020 aligned', trend: [118, 126, 133, 139, 142], tone: 'primary' as const, icon: BookOpen, to: '/courses', delta: '+7' },
  { id: 'assignments', label: 'Pending Assignments', value: '318', sub: '46 overdue · 12 due today', trend: [286, 301, 322, 340, 318], tone: 'warning' as const, icon: ClipboardList, to: '/assignments', delta: '-6.5%' },
  { id: 'scholarships', label: 'Active Scholarships', value: '612', sub: '₹2.48 Cr disbursed', trend: [388, 442, 498, 566, 612], tone: 'success' as const, icon: Wallet, to: '/scholarships', delta: '+46' },
  { id: 'grievances', label: 'Unresolved Grievances', value: '19', sub: '4 escalated > 7 days', trend: [31, 28, 24, 22, 19], tone: 'danger' as const, icon: ShieldAlert, to: '/grievances', delta: '-3' },
  { id: 'exams', label: 'Upcoming Examinations', value: '28', sub: 'Starts 02 Dec 2026', trend: [18, 22, 24, 26, 28], tone: 'info' as const, icon: CalendarDays, to: '/examinations', delta: '+2' },
];

const TONE_CLASS: Record<string, { bg: string; text: string; hex: string }> = {
  primary: { bg: 'bg-primary-tint', text: 'text-primary-tint-fg', hex: '#4F46E5' },
  info: { bg: 'bg-info-soft', text: 'text-info', hex: '#1D4ED8' },
  success: { bg: 'bg-success-soft', text: 'text-success', hex: '#15803D' },
  warning: { bg: 'bg-warning-soft', text: 'text-warning', hex: '#B45309' },
  danger: { bg: 'bg-danger-soft', text: 'text-danger', hex: '#BA1A1A' },
  neutral: { bg: 'bg-surface-container', text: 'text-muted', hex: '#64748B' },
};

export default function Dashboard() {
  const { widgets, setWidgets, pushToast, students, assignments, grievances, notices, workflows, setCommandOpen } = useApp();
  const colors = useChartColors();
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [range, setRange] = useState<'YTD' | 'Term' | 'All'>('YTD');

  const below75 = useMemo(() => students.filter((s) => s.attendance < 75).length, [students]);
  const approvalQueue = useMemo(
    () => [
      ...workflows.filter((w) => w.status === 'Awaiting Approval').map((w) => ({
        id: w.id,
        title: w.title,
        meta: `AI draft · ${w.agents.length} agents · ${w.records} records`,
        tone: 'primary' as const,
        icon: Sparkles,
        action: 'Review',
        to: '/workflow',
      })),
      { id: 'ap-1', title: 'MahaDBT EBC 50% waiver — 52 applications', meta: 'Scholarship Cell · nodal verification', tone: 'info' as const, icon: Wallet, action: 'Review', to: '/scholarships' },
      { id: 'ap-2', title: 'Semester 5 B.Tech fee revision', meta: 'Accounts · requires Registrar sign-off', tone: 'warning' as const, icon: Landmark, action: 'Review', to: '/fees?tab=structure' },
      { id: 'ap-3', title: 'Winter 2026 exam timetable publish', meta: 'Examination Admin · audit protected', tone: 'danger' as const, icon: Lock, action: 'Review', to: '/examinations' },
    ],
    [workflows],
  );

  const urgent = grievances
    .filter((g) => g.slaBreached && g.status !== 'Closed' && g.status !== 'Resolved')
    .slice(0, 4);

  const activity = useMemo(
    () => [
      { id: 'a1', text: 'Fee payment received — ₹1,48,500', meta: 'Aarav Deshmukh · UPI · 2 min ago', icon: Wallet, tone: 'success' as const },
      { id: 'a2', text: 'Assignment published — OS Scheduling Simulator', meta: 'Dr. Sunita Deshpande · CSE Sem 5', icon: ClipboardList, tone: 'info' as const },
      { id: 'a3', text: 'Grievance escalated to ICC — confidentiality enforced', meta: 'GRV-2026-0418 · 3 h ago', icon: ShieldAlert, tone: 'danger' as const },
      { id: 'a4', text: 'MahaDBT document verified via DigiLocker', meta: '88 applications · Scholarship Cell', icon: Lock, tone: 'primary' as const },
      { id: 'a5', text: 'Timetable published — CSE Sem 5 Div A', meta: 'Dr. Rajeshwar Rao · yesterday', icon: CalendarDays, tone: 'neutral' as const },
      { id: 'a6', text: 'Bonafide certificate issued', meta: 'TKT-9021 · Meera Verma', icon: BellRing, tone: 'success' as const },
    ],
    [],
  );

  const deptBars = DEPARTMENTS.map((d) => ({
    label: d.short,
    value: d.students,
    color: d.tone,
    meta: `${num(d.students)}`,
  }));

  const scholarshipStates = [
    { label: 'Approved', value: 268 + 211 + 133, color: colors.green },
    { label: 'Pending', value: 88, color: colors.amber },
    { label: 'Potential match', value: 96, color: colors.primary },
    { label: 'Incomplete docs', value: 29, color: colors.rose },
  ];

  return (
    <>
      <Header
        title="Administration"
        kicker="Institute command centre · 9 departments · Pune campus"
        badge={<Badge tone="primary" dot>Live</Badge>}
        actions={
          <>
            <Button size="sm" variant="ghost" icon={SlidersHorizontal} onClick={() => setCustomizeOpen(true)}>
              Customize
            </Button>
            <Button size="sm" variant="secondary" icon={Sparkles} onClick={() => navigate('/workflow')}>
              AI Orchestrator
            </Button>
            <Button size="sm" variant="primary" icon={Megaphone} onClick={() => navigate('/notices?new=1')}>
              New Notice
            </Button>
          </>
        }
      />

      <PageScroll>
        <PageStack>
          {/* Greeting strip */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-muted">Monday, 24 November 2026 · Odd Semester week 12</p>
              <h2 className="mt-1 font-display text-[22px] font-bold leading-7 tracking-[-0.02em] text-ink">
                Good morning, Dr. Rao.
              </h2>
              <p className="mt-0.5 text-sm text-muted">
                19 grievances open, 4 SLA breaches need escalation, and 3 approvals are waiting on you.
              </p>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-line bg-surface p-0.5">
              {(['YTD', 'Term', 'All'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={cx(
                    'h-7 rounded-[6px] px-2.5 text-xs font-semibold transition-all duration-120',
                    range === r ? 'bg-surface-container text-ink shadow-sm' : 'text-muted hover:text-ink',
                  )}
                >
                  {r === 'YTD' ? 'Year to date' : r === 'Term' ? 'This term' : 'All time'}
                </button>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          {widgets.quickActions && (
            <section aria-label="Quick actions" className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
              {[
                { label: 'Add Student', icon: UserPlus, to: '/students?new=1' },
                { label: 'Add Faculty', icon: GraduationCap, to: '/faculty?new=1' },
                { label: 'Create Notice', icon: Megaphone, to: '/notices?new=1' },
                { label: 'Create Assignment', icon: ClipboardList, to: '/assignments?new=1' },
                { label: 'Create Timetable', icon: CalendarDays, to: '/timetable' },
                { label: 'Add Course', icon: BookOpen, to: '/courses?new=1' },
              ].map((qa) => (
                <button
                  key={qa.label}
                  type="button"
                  onClick={() => navigate(qa.to)}
                  className="group flex h-[52px] items-center gap-2.5 rounded-lg border border-line bg-surface px-3 text-left transition-all duration-120 hover:-translate-y-px hover:border-primary/25 hover:bg-primary-tint/40"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-line bg-surface-low text-muted transition-colors duration-120 group-hover:border-primary/20 group-hover:bg-surface group-hover:text-primary">
                    <qa.icon size={14} strokeWidth={2.1} aria-hidden />
                  </span>
                  <span className="flex-1 text-[12.5px] font-semibold leading-4 text-ink">{qa.label}</span>
                  <Plus size={12} className="text-muted opacity-0 transition-opacity duration-120 group-hover:opacity-100" aria-hidden />
                </button>
              ))}
            </section>
          )}

          {/* KPIs */}
          {widgets.kpis && (
            <section aria-label="Key metrics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {KPI_DEFS.map((kpi) => {
                const tone = TONE_CLASS[kpi.tone];
                return (
                  <button
                    key={kpi.id}
                    type="button"
                    onClick={() => navigate(kpi.to)}
                    className="group flex flex-col rounded-xl border border-line bg-surface p-4 text-left transition-all duration-120 hover:border-primary/25 hover:shadow-[0_1px_0_0_rgb(var(--line))]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium text-muted">{kpi.label}</p>
                      <span className={cx('flex h-6 w-6 items-center justify-center rounded-md', tone.bg, tone.text)}>
                        <kpi.icon size={13} strokeWidth={2.1} aria-hidden />
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-end justify-between gap-2">
                      <p className="font-display text-[28px] font-bold leading-none tracking-[-0.02em] tabular-nums text-ink">
                        {kpi.value}
                      </p>
                      <Sparkline values={kpi.trend} color={tone.hex} width={64} height={24} />
                    </div>
                    <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-line pt-2">
                      <p className="truncate text-[11px] text-muted">{kpi.sub}</p>
                      <span className="flex shrink-0 items-center gap-0.5 font-mono text-[10px] font-medium tabular-nums text-muted">
                        {kpi.delta}
                        <ArrowUpRight size={10} className="opacity-60" aria-hidden />
                      </span>
                    </div>
                  </button>
                );
              })}
            </section>
          )}

          {/* Charts row 1 */}
          {widgets.charts && (
            <>
              <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
                <SectionCard
                  className="xl:col-span-7"
                  title="Enrollment growth"
                  subtitle="Students on rolls vs sanctioned intake · 2022–2026"
                  icon={BarChart3}
                  actions={
                    <Badge tone="success" icon={ArrowUpRight}>
                      +9.4% CAGR
                    </Badge>
                  }
                >
                  <div className="mb-1 flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-[11px] text-muted">
                      <span className="h-2 w-2 rounded-full" style={{ background: colors.primary }} /> Students on rolls
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] text-muted">
                      <span className="h-2 w-2 rounded-full" style={{ background: colors.teal }} /> Sanctioned intake
                    </span>
                  </div>
                  <LineAreaChart
                    ariaLabel="Enrollment multi-year line chart 2022 to 2026"
                    labels={ENROLLMENT_HISTORY.map((e) => e.year)}
                    yFormat={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))}
                    series={[
                      { name: 'On rolls', color: colors.primary, values: ENROLLMENT_HISTORY.map((e) => e.students) },
                      { name: 'Intake', color: colors.teal, values: ENROLLMENT_HISTORY.map((e) => e.intake), dashed: true },
                    ]}
                  />
                  <div className="mt-2 grid grid-cols-3 gap-2 border-t border-line pt-3">
                    {[
                      { label: 'Current strength', value: '4,820' },
                      { label: 'New admissions', value: '1,184' },
                      { label: 'Retention', value: '96.2%' },
                    ].map((s) => (
                      <div key={s.label}>
                        <p className="text-[10px] uppercase tracking-wide text-muted">{s.label}</p>
                        <p className="font-display text-[15px] font-bold tabular-nums text-ink">{s.value}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard
                  className="xl:col-span-5"
                  title="Department distribution"
                  subtitle={`${num(STUDENT_STATS.total)} students across 9 departments`}
                  icon={Landmark}
                  actions={<Badge tone="outline">2026-27</Badge>}
                >
                  <BarList items={deptBars} formatValue={num} />
                </SectionCard>
              </div>

              <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
                {/* Attendance */}
                <SectionCard className="xl:col-span-4" title="Attendance health" subtitle="Average across all active semesters" icon={Users}>
                  <div className="flex items-center gap-5">
                    <RadialGauge value={STUDENT_STATS.avgAttendance} label="Average attendance" sublabel="Avg" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge tone="danger" dot>
                          186 below 75%
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-muted">
                        {below75} of {students.length} sampled records in this workspace are below the 75% threshold.
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate('/workflow?prompt=attendance')}
                        className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline underline-offset-2"
                      >
                        <Sparkles size={12} aria-hidden />
                        Run AI attendance audit
                        <ArrowRight size={11} aria-hidden />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3 text-center">
                    {[
                      { label: '≥90%', value: '2,104', tone: 'text-success' },
                      { label: '75–89%', value: '2,530', tone: 'text-ink' },
                      { label: '<75%', value: '186', tone: 'text-danger' },
                    ].map((s) => (
                      <div key={s.label}>
                        <p className={cx('font-display text-[15px] font-bold tabular-nums', s.tone)}>{s.value}</p>
                        <p className="text-[10px] text-muted">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                {/* CGPA */}
                <SectionCard className="xl:col-span-4" title="CGPA distribution" subtitle="Semester 3–7 aggregate bands" icon={BarChart3} actions={<Badge tone="primary">Avg 7.92</Badge>}>
                  <Histogram bands={CGPA_BANDS} color={colors.primary} highlight="7.0–7.9" />
                  <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-[11px] text-muted">
                    <span>Top decile ≥ 9.0</span>
                    <span className="font-mono tabular-nums text-ink">268 students</span>
                  </div>
                </SectionCard>

                {/* Scholarship */}
                <SectionCard className="xl:col-span-4" title="Scholarship pipeline" subtitle="AY 2026-27 · 4-state tracker" icon={Wallet}>
                  <div className="mb-3 flex items-baseline justify-between">
                    <div>
                      <p className="font-display text-[24px] font-bold leading-none tabular-nums text-ink">612</p>
                      <p className="mt-1 text-[11px] text-muted">active scholarship holders</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-[16px] font-bold leading-none tabular-nums text-success">₹2.48 Cr</p>
                      <p className="mt-1 text-[11px] text-muted">disbursed YTD</p>
                    </div>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-line">
                    <div className="grid grid-cols-[1.4fr_repeat(4,1fr)] border-b border-line bg-surface-low px-2 py-1">
                      {['', 'Appr.', 'Pend.', 'Match', 'Docs'].map((h) => (
                        <span key={h} className="text-[8.5px] font-semibold uppercase tracking-wide text-muted">{h}</span>
                      ))}
                    </div>
                    {[
                      { scheme: 'NSP Central', approved: 96, pending: 28, match: 34, docs: 12 },
                      { scheme: 'MahaDBT', approved: 88, pending: 36, match: 41, docs: 9 },
                      { scheme: 'Institutional', approved: 84, pending: 24, match: 21, docs: 8 },
                    ].map((row) => (
                      <div key={row.scheme} className="grid grid-cols-[1.4fr_repeat(4,1fr)] border-b border-line/60 px-2 py-1.5 text-center last:border-0">
                        <span className="text-left text-[10px] font-medium text-ink">{row.scheme}</span>
                        <span className="font-mono text-[10px] tabular-nums text-success">{row.approved}</span>
                        <span className="font-mono text-[10px] tabular-nums text-warning">{row.pending}</span>
                        <span className="font-mono text-[10px] tabular-nums text-primary-tint-fg">{row.match}</span>
                        <span className="font-mono text-[10px] tabular-nums text-danger">{row.docs}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-muted">
                    {scholarshipStates.map((s) => (
                      <span key={s.label} className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
                        {s.label} · <span className="font-mono tabular-nums text-ink">{num(s.value)}</span>
                      </span>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/scholarships')}
                    className="mt-3 flex w-full items-center justify-between rounded-md border border-line px-2.5 py-1.5 text-[11px] font-semibold text-muted transition-colors duration-120 hover:bg-surface-low hover:text-ink"
                  >
                    Open scholarship tracker
                    <ArrowRight size={11} />
                  </button>
                </SectionCard>
              </div>

              {/* Grievance SLA banner */}
              <SectionCard
                title="Grievance SLA summary"
                subtitle="Service level — 7 day resolution window"
                icon={ShieldAlert}
                actions={
                  <Button size="xs" variant="ghost" icon={ArrowRight} onClick={() => navigate('/grievances')}>
                    Manage
                  </Button>
                }
              >
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-center">
                  <div className="lg:col-span-3">
                    <div className="flex items-baseline gap-2">
                      <p className="font-display text-[30px] font-bold leading-none tabular-nums text-success">91%</p>
                      <Badge tone="success">SLA met</Badge>
                    </div>
                    <p className="mt-1.5 text-xs text-muted">Across 214 closed grievances this year</p>
                  </div>
                  <div className="lg:col-span-5">
                    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-surface-high">
                      <div className="h-full bg-success" style={{ width: '91%' }} />
                      <div className="h-full bg-warning" style={{ width: '5%' }} />
                      <div className="h-full bg-danger" style={{ width: '4%' }} />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted">
                      <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-success" /> Met in time · 195</span>
                      <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-warning" /> At risk · 11</span>
                      <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-danger" /> Breached · 8</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 lg:col-span-4">
                    {[
                      { label: 'Open', value: '19', tone: 'text-warning' },
                      { label: 'Escalated', value: String(GRIEVANCE_STATS.escalated), tone: 'text-danger' },
                      { label: 'Avg resolve', value: `${GRIEVANCE_STATS.avgResolution} d`, tone: 'text-ink' },
                    ].map((s) => (
                      <div key={s.label} className="rounded-lg bg-surface-low px-2.5 py-2 text-center">
                        <p className={cx('font-display text-[15px] font-bold tabular-nums', s.tone)}>{s.value}</p>
                        <p className="text-[10px] text-muted">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionCard>
            </>
          )}

          {/* Feeds */}
          {widgets.feeds && (
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
              <SectionCard
                className="xl:col-span-7"
                title="Pending approvals"
                subtitle="Actions blocked on your decision"
                icon={ClipboardList}
                actions={<Badge tone="warning">{approvalQueue.length} pending</Badge>}
                flush
              >
                <ul className="divide-y divide-line border-t border-line">
                  {approvalQueue.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => navigate(item.to)}
                        className="group flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors duration-120 hover:bg-surface-low"
                      >
                        <span
                          className={cx(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                            item.tone === 'primary' && 'bg-primary-tint text-primary-tint-fg',
                            item.tone === 'info' && 'bg-info-soft text-info',
                            item.tone === 'warning' && 'bg-warning-soft text-warning',
                            item.tone === 'danger' && 'bg-danger-soft text-danger',
                          )}
                        >
                          <item.icon size={14} strokeWidth={2.1} aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium text-ink">{item.title}</span>
                          <span className="block truncate text-[11px] text-muted">{item.meta}</span>
                        </span>
                        <span className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-primary opacity-0 transition-opacity duration-120 group-hover:opacity-100">
                          {item.action}
                          <ArrowRight size={11} />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-line px-5 py-3">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink">
                      <TriangleAlert size={13} className="text-danger" aria-hidden />
                      Urgent grievances
                    </h3>
                    <span className="text-[10px] text-muted">SLA breached · &gt;7 days</span>
                  </div>
                  <ul className="flex flex-col gap-1">
                    {urgent.map((g) => (
                      <li key={g.id}>
                        <button
                          type="button"
                          onClick={() => navigate('/grievances')}
                          className="flex w-full items-center gap-2 rounded-md px-1.5 py-1.5 text-left transition-colors duration-120 hover:bg-danger-soft/50"
                        >
                          <span className="mono shrink-0 text-[10px] text-muted">{g.id.replace('GRV-2026-', '#')}</span>
                          <span className="min-w-0 flex-1 truncate text-[12px] text-ink">
                            {g.confidential ? 'Confidential ICC case — access restricted' : g.subject}
                          </span>
                          <Badge tone="danger" icon={g.confidential ? Lock : undefined}>
                            {g.daysOpen}d
                          </Badge>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </SectionCard>

              <SectionCard
                className="xl:col-span-5"
                title="Recent activity"
                subtitle="Last 24 hours across modules"
                icon={BellRing}
                flush
                actions={
                  <Button size="xs" variant="ghost" icon={ArrowRight} onClick={() => navigate('/workflow')}>
                    Audit log
                  </Button>
                }
              >
                <ol className="max-h-[248px] overflow-y-auto border-t border-line px-5 py-3 scroll-thin">
                  {activity.map((a, i) => (
                    <li key={a.id} className="relative flex gap-3 pb-3 last:pb-0">
                      {i !== activity.length - 1 && (
                        <span className="absolute left-[11px] top-6 h-full w-px bg-line" aria-hidden />
                      )}
                      <span
                        className={cx(
                          'relative z-10 mt-0.5 flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-full border',
                          a.tone === 'success' && 'border-success/25 bg-success-soft text-success',
                          a.tone === 'info' && 'border-info/25 bg-info-soft text-info',
                          a.tone === 'danger' && 'border-danger/25 bg-danger-soft text-danger',
                          a.tone === 'primary' && 'border-primary/25 bg-primary-tint text-primary-tint-fg',
                          a.tone === 'neutral' && 'border-line bg-surface-low text-muted',
                        )}
                      >
                        <a.icon size={11} strokeWidth={2.2} aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[12px] leading-4 text-ink">{a.text}</p>
                        <p className="text-[10.5px] text-muted">{a.meta}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="border-t border-line px-5 py-3">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink">
                      <Pin size={12} className="text-primary" aria-hidden />
                      Pinned notices
                    </h3>
                    <span className="text-[10px] text-muted">{notices.filter((n) => n.pinned).length} pinned</span>
                  </div>
                  <ul className="flex flex-col gap-1.5">
                    {notices
                      .filter((n) => n.pinned)
                      .slice(0, 3)
                      .map((n) => (
                        <li key={n.id}>
                          <button
                            type="button"
                            onClick={() => navigate('/notices')}
                            className="w-full rounded-md border border-line bg-surface-low/60 px-2.5 py-2 text-left transition-colors duration-120 hover:border-primary/25 hover:bg-primary-tint/50"
                          >
                            <span className="flex items-center justify-between gap-2">
                              <span className="truncate text-[11.5px] font-semibold text-ink">{n.title}</span>
                              <span className="shrink-0 font-mono text-[9.5px] text-muted">{fmtDate(n.date)}</span>
                            </span>
                            <span className="mt-0.5 block truncate text-[10.5px] text-muted">
                              {n.category} · {n.audience}
                            </span>
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
              </SectionCard>
            </div>
          )}

          {/* Footer meta */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-[10.5px] text-muted">
            <span>
              Showing {range === 'YTD' ? 'year-to-date' : range === 'Term' ? 'this term' : 'all-time'} figures · last ERP sync 24 Nov 2026, 08:12 AM IST
            </span>
            <span className="flex items-center gap-3">
              <span>Fee demand {compactInr(FEE_TOTALS.demand)}</span>
              <span className="text-line">|</span>
              <span>Faculty load {pct(FACULTY_STATS.avgWeeklyLoad / 20 * 100, 0)} of guideline</span>
              <span className="text-line">|</span>
              <span>Assignments {ASSIGNMENT_STATS.active}</span>
              <span className="text-line">|</span>
              <span>Scholarships {SCHOLARSHIP_STATS.active}</span>
              <span className="text-line">|</span>
              <span>{inr(FEE_TOTALS.collected)} collected</span>
            </span>
          </div>
        </PageStack>
      </PageScroll>

      <CustomizeModal open={customizeOpen} onClose={() => setCustomizeOpen(false)} />
    </>
  );
}

function CustomizeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { widgets, setWidgets, pushToast } = useApp();
  const [draft, setDraft] = useState(widgets);

  // Re-sync the draft each time the modal opens.
  const openRef = useRef(open);
  if (openRef.current !== open) {
    openRef.current = open;
    if (open) setDraft(widgets);
  }

  const set = (key: keyof typeof draft) => (v: boolean) => setDraft((d) => ({ ...d, [key]: v }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Customize dashboard"
      subtitle="Toggle widget groups — changes apply live to this workspace."
      icon={<LayoutGrid size={16} className="text-primary-tint-fg" />}
      footer={
        <>
          <button
            type="button"
            onClick={() => setDraft({ kpis: true, charts: true, feeds: true, quickActions: true })}
            className="mr-auto inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-muted transition-colors duration-120 hover:bg-surface-container hover:text-ink"
          >
            <RotateCcw size={13} /> Reset all
          </button>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setWidgets(draft);
              onClose();
              pushToast({ title: 'Dashboard updated', description: 'Widget preferences saved to this browser.', tone: 'success' });
            }}
          >
            Apply changes
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-1">
        <Checkbox id="w-kpis" checked={draft.kpis} onChange={set('kpis')} label="KPI cards" description="8 headline metrics · students, faculty, fees, scholarships, grievances" />
        <Checkbox id="w-charts" checked={draft.charts} onChange={set('charts')} label="Analytics charts" description="Enrollment, departments, attendance, CGPA, scholarships, SLA" />
        <Checkbox id="w-feeds" checked={draft.feeds} onChange={set('feeds')} label="Operational feeds" description="Pending approvals, urgent grievances, activity and pinned notices" />
        <Checkbox id="w-quick" checked={draft.quickActions} onChange={set('quickActions')} label="Quick actions row" description="Six creation shortcuts for frequent admin tasks" />
      </div>
      <div className="mt-4 flex items-center justify-between rounded-lg border border-line bg-surface-low px-3 py-2.5">
        <div>
          <p className="text-[12.5px] font-semibold text-ink">Compact KPI figures</p>
          <p className="text-[11px] text-muted">Preference is saved per browser profile.</p>
        </div>
        <Switch checked={draft.kpis} onChange={set('kpis')} label="Toggle KPI compact mode" />
      </div>
    </Modal>
  );
}
