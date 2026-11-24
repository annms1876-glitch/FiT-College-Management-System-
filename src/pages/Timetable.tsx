import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CalendarDays, CheckCircle2, Clock, DoorOpen, Layers, MapPin, Printer, Radio, RefreshCw, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { Header, PageScroll, PageStack } from '../components/layout/Header';
import { Badge, Button, SectionCard } from '../components/ui/primitives';
import { Field, Select } from '../components/ui/Form';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../store/AppStore';
import { DEPARTMENTS } from '../data/departments';
import { BASE_TIMETABLE, CONFLICT_NOTES, DAYS, SLOTS, toCell } from '../data/seed/timetable';
import { fmtDateTime } from '../lib/format';
import { cx } from '../lib/cx';
import { navigate, useRoute } from '../lib/hooks';
import type { TimetableCell } from '../types';

export default function Timetable() {
  const { pushToast, publishedAt, publishTimetable } = useApp();
  const route = useRoute();
  const [dept, setDept] = useState('CSE');
  const [semester, setSemester] = useState('5');
  const [division, setDivision] = useState('all');
  const [conflictBanner, setConflictBanner] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [highlight, setHighlight] = useState<string | null>(null);

  // merge available keys for dropdowns
  const key = `${dept}-${semester}`;
  const cells = useMemo(() => {
    const raw = BASE_TIMETABLE[key] ?? BASE_TIMETABLE[`CSE-5`];
    return raw.map((seed, index) => toCell(seed, key, index));
  }, [key]);

  const divisions = useMemo(() => Array.from(new Set(cells.map((c) => c.division))), [cells]);
  const visible = useMemo(() => {
    if (division === 'all') return cells;
    return cells.filter((c) => c.division === division);
  }, [cells, division]);

  useEffect(() => {
    if (route.query.get('publish') === '1') {
      setPublishOpen(true);
      navigate('/timetable', { replace: true });
    }
  }, [route]);

  const stats = useMemo(() => {
    const rooms = new Set(visible.map((c) => c.room)).size;
    const facultyCount = new Set(visible.map((c) => c.faculty)).size;
    const slotCount = new Set(visible.map((c) => `${c.day}-${c.slot}`)).size;
    return { sessions: visible.length, rooms, faculty: facultyCount, slots: slotCount };
  }, [visible]);

  const detect = () => {
    setDetecting(true);
    setConflictBanner(false);
    window.setTimeout(() => {
      setDetecting(false);
      setConflictBanner(true);
      pushToast({
        title: 'Conflict scan complete',
        description: '2 conflicts detected across CSE · Sem 5 and ECE · Sem 5',
        tone: 'warning',
      });
    }, 900);
  };

  const doPublish = (note: string) => {
    publishTimetable();
    setPublishOpen(false);
    pushToast({ title: 'Publish broadcast sent', description: `${visible.length} sessions · ${note || 'no change note'}`, tone: 'success' });
  };

  const totalConflicts = CONFLICT_NOTES.length;

  return (
    <>
      <Header
        title="Timetable Management"
        kicker={`Odd semester · ${publishedAt ? `last published ${fmtDateTime(publishedAt)}` : 'not published yet'}`}
        badge={<Badge tone="primary" icon={Radio}>Draft v2</Badge>}
        actions={
          <>
            <Button size="sm" variant="secondary" icon={detecting ? RefreshCw : AlertTriangle} onClick={detect} loading={detecting}>
              {detecting ? 'Scanning…' : 'Detect Conflicts'}
            </Button>
            <Button size="sm" variant="secondary" icon={Printer} onClick={() => window.print()}>Print</Button>
            <Button size="sm" variant="primary" icon={CalendarDays} onClick={() => setPublishOpen(true)}>Publish Updates</Button>
          </>
        }
      />

      <PageScroll>
        <PageStack>
          {conflictBanner && totalConflicts > 0 && (
            <div className="rounded-xl border border-danger/25 bg-danger-soft/70 p-3 animate-pop-in">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-danger/15 text-danger">
                  <AlertTriangle size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-danger">{totalConflicts} scheduling conflicts detected</p>
                  <p className="text-[11px] text-danger/90">Room double-bookings and faculty overlaps must be resolved before publishing.</p>
                </div>
                <Button size="xs" variant="danger" onClick={() => setHighlight('conflict-1')}>Review</Button>
                <Button size="xs" variant="ghost" onClick={() => setConflictBanner(false)} className="text-danger">Dismiss</Button>
              </div>
              <ul className="mt-2.5 grid gap-1.5 md:grid-cols-2">
                {CONFLICT_NOTES.map((c, i) => (
                  <li key={c.id} className="rounded-lg border border-danger/25 bg-surface px-2.5 py-2">
                    <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ink">
                      <span className="flex h-4 w-4 items-center justify-center rounded bg-danger-soft font-mono text-[9px] text-danger">{i + 1}</span>
                      {c.title}
                    </p>
                    <p className="mt-0.5 pl-5 text-[10.5px] leading-4 text-muted">{c.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Filters */}
          <div className="rounded-xl border border-line bg-surface p-3">
            <div className="flex flex-wrap items-end gap-2.5">
              <Field label="Department" className="w-[190px]">
                <Select value={dept} onChange={(e) => { setDept(e.target.value); setDivision('all'); }}>
                  {DEPARTMENTS.filter((d) => d.code !== 'AS').map((d) => (
                    <option key={d.code} value={d.code}>{d.code} — {d.name}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Semester" className="w-[150px]">
                <Select value={semester} onChange={(e) => { setSemester(e.target.value); setDivision('all'); }}>
                  {[1, 3, 5, 7].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Division" className="w-[140px]">
                <Select value={division} onChange={(e) => setDivision(e.target.value)}>
                  <option value="all">All divisions</option>
                  {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
                </Select>
              </Field>
              <div className="flex items-center gap-1.5">
                <Badge tone="success" icon={ShieldCheck}>Saved 2 min ago</Badge>
                <Badge tone="outline" icon={Layers}>{BASE_TIMETABLE[key] ? 'Published set' : 'Template fallback'}</Badge>
              </div>
              <span className="ml-auto text-[10.5px] text-muted">
                {stats.sessions} sessions · {stats.rooms} rooms · {stats.faculty} faculty
              </span>
            </div>
          </div>

          <SectionCard
            title={`Weekly grid — ${dept} Semester ${semester}`}
            subtitle="Monday to Friday · 7 periods · 08:30–16:25 IST"
            icon={CalendarDays}
            actions={
              <>
                <Badge tone="warning" icon={Clock}>2 conflicts</Badge>
                <Button size="xs" variant="ghost" icon={Sparkles} onClick={() => navigate('/workflow?prompt=timetable')}>
                  AI resolve
                </Button>
              </>
            }
            flush
          >
            <div className="overflow-x-auto border-t border-line scroll-thin">
              <table className="w-full min-w-[1080px] border-collapse">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 w-[100px] border-b border-r border-line bg-surface-low px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-muted">Day</th>
                    {SLOTS.map((slot) => (
                      <th key={slot.id} className="border-b border-line bg-surface-low px-2 py-2 text-center">
                        <span className="mono block text-[10.5px] font-medium text-ink">{slot.label}</span>
                        <span className="block text-[9px] text-muted">{slot.end}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day, di) => {
                    const dayCells = visible.filter((c) => c.day === di);
                    return (
                      <tr key={day}>
                        <th scope="row" className="sticky left-0 z-10 border-b border-r border-line bg-surface px-3 py-2 text-left text-[11.5px] font-semibold text-ink">
                          {day}
                          <span className="mt-0.5 block font-mono text-[9px] font-normal text-muted">{dayCells.length} sessions</span>
                        </th>
                        {SLOTS.map((slot) => {
                          const cell = dayCells.find((c) => c.slot === slot.id);
                          const isClash =
                            (dept === 'CSE' && di === 1 && slot.id === 3) ||
                            (dept === 'CSE' && di === 0 && slot.id === 0) ||
                            (dept === 'CSE' && di === 3 && slot.id === 1);
                          const broken = cell && (cell.kind === 'Lab');
                          return (
                            <td key={slot.id} className="border-b border-line p-1 align-top" style={{ width: `${100 / 7}%` }}>
                              {cell ? (
                                <button
                                  type="button"
                                  onClick={() => pushToast({
                                    title: `${cell.subject} · ${cell.code}`,
                                    description: `${cell.faculty} · Room ${cell.room} · ${day} ${slot.label}–${slot.end} · ${cell.division}`,
                                    tone: isClash ? 'warning' : 'info',
                                  })}
                                  className={cx(
                                    'group flex h-[58px] w-full flex-col justify-between rounded-md border p-1.5 text-left transition-all duration-120 hover:-translate-y-px hover:shadow-sm',
                                    isClash
                                      ? 'border-danger/40 bg-danger-soft ring-1 ring-danger/15'
                                      : cell.kind === 'Lab'
                                        ? 'border-primary/20 bg-primary-tint/70'
                                        : cell.kind === 'Tutorial'
                                          ? 'border-warning/25 bg-warning-soft/60'
                                          : 'border-line bg-surface-low',
                                  )}
                                  title={`${cell.code} · ${cell.faculty} · ${cell.room}`}
                                >
                                  <span className={cx('truncate text-[10.5px] font-semibold leading-3.5', isClash ? 'text-danger' : 'text-ink')}>
                                    {cell.code}
                                  </span>
                                  <span className="line-clamp-2 text-[9px] leading-[11px] text-muted">{cell.subject}</span>
                                  <span className="flex items-center justify-between gap-1">
                                    <span className={cx('flex items-center gap-0.5 font-mono text-[8.5px] font-medium', isClash ? 'text-danger' : 'text-muted')}>
                                      <MapPin size={8} /> {cell.room}
                                    </span>
                                    <span className={cx(
                                      'rounded px-1 font-display text-[8px] font-semibold uppercase tracking-wide',
                                      broken ? 'bg-info-soft text-info' : cell.kind === 'Tutorial' ? 'bg-warning-soft text-warning' : 'bg-surface-container text-muted',
                                    )}>
                                      {cell.kind === 'Lecture' ? 'Lec' : cell.kind}
                                    </span>
                                  </span>
                                </button>
                              ) : (
                                <div className="flex h-[58px] items-center justify-center rounded-md border border-dashed border-line/60 text-[9px] text-muted/40">
                                  —
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line px-4 py-2.5 text-[10px] text-muted">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded border border-line bg-surface-low" /> Lecture</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded border border-primary/20 bg-primary-tint" /> Lab (2 h block)</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded border border-warning/25 bg-warning-soft" /> Tutorial</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded border border-danger/40 bg-danger-soft" /> Conflict</span>
              <span className="ml-auto flex items-center gap-1"><Users size={10} /> Click any slot for session details</span>
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
            <SectionCard title="Room utilisation" subtitle="Of 6 instructional rooms in this block" icon={DoorOpen}>
              {[
                { room: 'A-204', load: 92, clash: true },
                { room: 'A-305', load: 68, clash: false },
                { room: 'B-102', load: 54, clash: false },
                { room: 'Lab-CV', load: 74, clash: false },
                { room: 'B-205', load: 46, clash: false },
              ].map((r) => (
                <div key={r.room} className="mb-2 flex items-center gap-2">
                  <span className="mono w-14 shrink-0 text-[10.5px] text-ink">{r.room}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-high">
                    <div className={cx('h-full rounded-full', r.clash ? 'bg-danger' : 'bg-primary')} style={{ width: `${r.load}%` }} />
                  </div>
                  <span className={cx('w-8 shrink-0 text-right font-mono text-[10px] tabular-nums', r.clash ? 'text-danger' : 'text-muted')}>{r.load}%</span>
                  {r.clash && <AlertTriangle size={10} className="text-danger" aria-label="Over capacity" />}
                </div>
              ))}
            </SectionCard>
            <SectionCard title="Faculty allocation" subtitle="Unique teachers & conflicts" icon={Users}>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Faculty assigned', value: stats.faculty },
                  { label: 'Load warnings', value: 3 },
                  { label: 'Substitutes needed', value: 0 },
                  { label: 'Unassigned slots', value: 0 },
                ].map((x) => (
                  <div key={x.label} className="rounded-lg bg-surface-low px-2.5 py-2">
                    <p className="font-display text-[16px] font-bold tabular-nums text-ink">{x.value}</p>
                    <p className="text-[9.5px] text-muted">{x.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-2.5 rounded-md border border-warning/25 bg-warning-soft/60 px-2.5 py-2 text-[10.5px] leading-4 text-warning">
                Prof. Tejas Bhide (CSE) is double-assigned on Monday 08:30 across Div A & Div B. Suggest moving Web Tech Lab to 13:30.
              </div>
            </SectionCard>
            <SectionCard title="Publish readiness" subtitle="Validation checklist" icon={ShieldCheck}>
              <ul className="space-y-1.5">
                {[
                  { label: 'Room conflicts resolved', ok: false },
                  { label: 'Faculty double-booking cleared', ok: false },
                  { label: 'Lab durations ≥ 2 periods', ok: true },
                  { label: 'HOD approvals (8 divisions)', ok: true },
                  { label: 'Student portal broadcast ready', ok: true },
                ].map((c) => (
                  <li key={c.label} className="flex items-center justify-between rounded-md border border-line px-2.5 py-1.5 text-[11px]">
                    <span className="text-ink">{c.label}</span>
                    {c.ok ? (
                      <span className="flex items-center gap-1 text-success"><CheckCircle2 size={11} /> Ready</span>
                    ) : (
                      <span className="flex items-center gap-1 text-danger"><AlertTriangle size={11} /> Blocked</span>
                    )}
                  </li>
                ))}
              </ul>
              <Button
                size="sm"
                variant="primary"
                full
                className="mt-2.5"
                icon={CalendarDays}
                disabled={false}
                onClick={() => setPublishOpen(true)}
              >
                Review & publish updates
              </Button>
            </SectionCard>
          </div>
          <p className="text-[10.5px] leading-4 text-muted">
            Timetable changes are versioned; publishing notifies {dept === 'CSE' ? 'all 3 divisions' : 'selected divisions'} and is recorded in the audit trail. Conflicts are detected across room, faculty and division dimensions.
          </p>
        </PageStack>
      </PageScroll>

      <Modal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        title="Publish timetable updates"
        subtitle="Broadcasts to students, faculty and the mobile app · 8 divisions"
        icon={<CalendarDays size={16} className="text-primary-tint-fg" />}
        footer={
          <>
            <Button size="sm" variant="ghost" onClick={() => setPublishOpen(false)}>Cancel</Button>
            <Button size="sm" variant="primary" icon={CheckCircle2} onClick={() => doPublish('')}>Publish now</Button>
          </>
        }
      >
        <div className="rounded-lg border border-danger/25 bg-danger-soft/60 px-3 py-2.5">
          <p className="text-[11.5px] font-semibold text-danger">2 unresolved conflicts</p>
          <p className="mt-0.5 text-[10.5px] leading-4 text-danger/90">
            If you publish anyway, Room A-204 will be double-booked Tuesday 11:30 and Prof. Bhide will be double-assigned Monday 08:30. The system will note this as an exception.
          </p>
        </div>
        <div className="mt-3 rounded-lg border border-warning/25 bg-warning-soft/50 px-3 py-2.5">
          <p className="text-[11.5px] font-semibold text-warning">Semester 5 students are in examination prep</p>
          <p className="mt-0.5 text-[10.5px] leading-4 text-warning/90">
            A publish event notifies all affected students. Schedule changes during exam week require Examination Admin acknowledgement.
          </p>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Effective from">
            <Select defaultValue="2026-11-30">
              <option value="2026-11-25">25 Nov 2026</option>
              <option value="2026-11-30">30 Nov 2026 (after exam prep)</option>
              <option value="2026-12-14">14 Dec 2026 (post exams)</option>
            </Select>
          </Field>
          <Field label="Notify">
            <Select defaultValue="students-faculty">
              <option value="students-faculty">Students & faculty</option>
              <option value="faculty">Faculty only</option>
              <option value="students">Students only</option>
            </Select>
          </Field>
          <div className="sm:col-span-2 rounded-md border border-line bg-surface-low px-2.5 py-2 text-[10.5px] leading-4 text-muted">
            Publishing records your user, timestamp and the exact diff in the audit log. Reverting requires Examination Admin sign-off.
          </div>
        </div>
      </Modal>
    </>
  );
}
