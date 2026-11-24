import { useEffect, useMemo, useState } from 'react';
import { BookMarked, BriefcaseBusiness, CalendarCheck2, Check, Clock3, GraduationCap, Mail, Phone, Plus, TriangleAlert, Users, X } from 'lucide-react';
import { Header, PageScroll, PageStack } from '../components/layout/Header';
import { Avatar, Badge, Button, Progress, SectionCard } from '../components/ui/primitives';
import { Field, Input, SearchInput, Select, Textarea } from '../components/ui/Form';
import { Modal } from '../components/ui/Modal';
import { TableShell, Td, Th, Tr } from '../components/ui/Table';
import { BarList, RadialGauge, useChartColors } from '../components/charts/Charts';
import { useApp } from '../store/AppStore';
import { DEPARTMENTS, DEPT_MAP } from '../data/departments';
import { FACULTY_STATS } from '../data/seed/faculty';
import { fmtDate } from '../lib/format';
import { cx } from '../lib/cx';
import { navigate, useDebounced, useRoute } from '../lib/hooks';
import type { AttendanceState, Faculty as FacultyType } from '../types';

export default function Faculty() {
  const { faculty, pushToast } = useApp();
  const route = useRoute();
  const [query, setQuery] = useState('');
  const [dept, setDept] = useState('all');
  const [load, setLoad] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const debounced = useDebounced(query, 120);

  useEffect(() => {
    if (route.query.get('new') === '1') {
      setAddOpen(true);
      navigate('/faculty', { replace: true });
    }
    const f = route.query.get('faculty');
    if (f) setExpanded(f);
  }, [route]);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return faculty.filter((f) => {
      if (dept !== 'all' && f.dept !== dept) return false;
      if (load === 'over' && f.weeklyLoad <= 20) return false;
      if (load === 'balanced' && f.weeklyLoad > 20) return false;
      if (!q) return true;
      return (
        f.name.toLowerCase().includes(q) ||
        f.id.toLowerCase().includes(q) ||
        f.specialization.toLowerCase().includes(q) ||
        f.subjects.join(' ').toLowerCase().includes(q)
      );
    });
  }, [faculty, debounced, dept, load]);

  const overloaded = faculty.filter((f) => f.weeklyLoad > 20);
  const colors = useChartColors();
  const deptLoad = DEPARTMENTS.map((d) => {
    const members = faculty.filter((f) => f.dept === d.code);
    const avg = members.length ? members.reduce((a, f) => a + f.weeklyLoad, 0) / members.length : 0;
    return { label: `${d.code} · ${d.short}`, value: Number(avg.toFixed(1)), color: d.tone, meta: `${members.length} staff` };
  }).filter((d) => d.value > 0);

  return (
    <>
      <Header
        title="Faculty Management"
        kicker={`${FACULTY_STATS.total} faculty · 9 departments · average load ${FACULTY_STATS.avgWeeklyLoad} h/week`}
        badge={<Badge tone="info">HR module</Badge>}
        actions={
          <>
            <Button size="sm" variant="ghost" icon={BriefcaseBusiness} onClick={() => pushToast({ title: 'Workload report generated', description: 'PDF staged for HOD circulation', tone: 'info' })}>
              Load report
            </Button>
            <Button size="sm" variant="primary" icon={Plus} onClick={() => setAddOpen(true)}>
              Add Faculty
            </Button>
          </>
        }
      />

      <PageScroll>
        <PageStack>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[
              { label: 'Total Faculty', value: '284', meta: 'Sanctioned 312 · 91% filled', icon: Users, tone: 'text-ink', chip: 'bg-primary-tint text-primary-tint-fg' },
              { label: 'Present Today', value: '261', meta: '91.9% · 23 on leave', icon: CalendarCheck2, tone: 'text-success', chip: 'bg-success-soft text-success' },
              { label: 'Avg Weekly Load', value: '17.6 h', meta: 'Guideline ≤ 20 h/week', icon: Clock3, tone: 'text-ink', chip: 'bg-info-soft text-info' },
              { label: 'Overloaded > 20 h', value: String(FACULTY_STATS.overloaded), meta: 'Needs rebalance', icon: TriangleAlert, tone: 'text-warning', chip: 'bg-warning-soft text-warning' },
            ].map((k) => (
              <div key={k.label} className="rounded-xl border border-line bg-surface p-4">
                <div className="flex items-start justify-between">
                  <p className="text-xs font-medium text-muted">{k.label}</p>
                  <span className={cx('flex h-6 w-6 items-center justify-center rounded-md', k.chip)}>
                    <k.icon size={13} strokeWidth={2.1} aria-hidden />
                  </span>
                </div>
                <p className={cx('mt-1.5 font-display text-[26px] font-bold leading-none tabular-nums', k.tone)}>{k.value}</p>
                <p className="mt-2 text-[10.5px] text-muted">{k.meta}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            <SectionCard className="xl:col-span-7" title="Workload distribution" subtitle="Average teaching hours per week by department" icon={BookMarked} actions={<Badge tone="warning" icon={TriangleAlert}>{overloaded.length} over guideline</Badge>}>
              <BarList items={deptLoad} formatValue={(v) => `${v} h`} max={24} />
              <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5 text-[10.5px] text-muted">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-warning" /> Above 20 h · policy breach</span>
                <button type="button" onClick={() => navigate('/workflow?prompt=faculty')} className="font-semibold text-primary hover:underline">
                  AI rebalance proposal →
                </button>
              </div>
            </SectionCard>
            <SectionCard className="xl:col-span-5" title="Attendance & load health" subtitle="Live from biometric + timetable" icon={CalendarCheck2}>
              <div className="flex flex-col items-center gap-3 sm:flex-row">
                <RadialGauge value={91.9} size={120} sublabel="Present" label="Today's attendance" color="rgb(var(--success))" />
                <div className="grid flex-1 grid-cols-2 gap-2">
                  {[
                    { label: 'On duty', value: '14', tone: 'text-info' },
                    { label: 'On leave', value: '9', tone: 'text-warning' },
                    { label: 'Avg load', value: '17.6 h', tone: 'text-ink' },
                    { label: 'Student ratio', value: '1:17', tone: 'text-ink' },
                  ].map((x) => (
                    <div key={x.label} className="rounded-lg bg-surface-low px-2.5 py-2">
                      <p className={cx('font-display text-[15px] font-bold tabular-nums', x.tone)}>{x.value}</p>
                      <p className="text-[9.5px] text-muted">{x.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 border-t border-line pt-2.5">
                <div className="mb-1.5 flex justify-between text-[10.5px] text-muted">
                  <span>Weekly load guideline</span>
                  <span className="font-mono text-ink">88%</span>
                </div>
                <Progress value={88} tone={colors.primary} />
              </div>
            </SectionCard>
          </div>

          <div className="rounded-xl border border-line bg-surface p-3">
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput value={query} onChange={setQuery} placeholder="Search faculty name, ID, subject or specialisation…" className="min-w-[250px] flex-1 sm:max-w-[400px]" />
              <Select value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Department" className="w-auto min-w-[150px]">
                <option value="all">All departments</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.code} · {d.short}
                  </option>
                ))}
              </Select>
              <Select value={load} onChange={(e) => setLoad(e.target.value)} aria-label="Workload" className="w-auto min-w-[140px]">
                <option value="all">Any workload</option>
                <option value="over">Overloaded &gt; 20 h</option>
                <option value="balanced">Within guideline</option>
              </Select>
              <span className="ml-auto text-[11px] text-muted">{filtered.length} of {faculty.length} shown</span>
            </div>
          </div>

          <TableShell
            footer={
              <>
                <span className="tabular-nums">Showing {filtered.length} of {faculty.length} faculty in this workspace</span>
                <span className="flex items-center gap-3 text-[10.5px]">
                  <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-success" /> Present</span>
                  <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-info" /> On duty</span>
                  <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-warning" /> Load &gt; 20 h</span>
                </span>
              </>
            }
          >
            <thead>
              <tr>
                <Th>Faculty ID</Th>
                <Th>Name &amp; Designation</Th>
                <Th>Dept &amp; Specialisation</Th>
                <Th>Assigned Subjects</Th>
                <Th align="right">Weekly Workload</Th>
                <Th>Attendance</Th>
                <Th align="right">Joined</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => {
                const over = f.weeklyLoad > 20;
                const isOpen = expanded === f.id;
                return (
                  <Tr key={f.id} interactive onClick={() => setExpanded(isOpen ? null : f.id)} className={isOpen ? 'bg-surface-low' : undefined}>
                    <Td>
                      <span className="mono text-[11.5px] font-medium text-ink">{f.id}</span>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={f.name} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-[12.5px] font-semibold leading-4 text-ink">{f.name}</p>
                          <p className="truncate text-[10.5px] text-muted">{f.designation}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <div className="min-w-0">
                        <span className="inline-flex h-4 items-center rounded bg-surface-container px-1 font-mono text-[9.5px] font-medium text-muted">{f.dept}</span>
                        <p className="mt-0.5 max-w-[190px] truncate text-[11px] text-muted" title={f.specialization}>{f.specialization}</p>
                      </div>
                    </Td>
                    <Td>
                      <div className="flex flex-col gap-0.5">
                        {f.subjects.slice(0, 2).map((s) => (
                          <span key={s} className="max-w-[200px] truncate text-[11px] text-ink">{s}</span>
                        ))}
                      </div>
                    </Td>
                    <Td align="right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="w-14">
                          <Progress value={(f.weeklyLoad / 28) * 100} height="h-1" tone={over ? 'rgb(var(--warning))' : 'rgb(var(--primary))'} />
                        </span>
                        <span className={cx('inline-flex min-w-[44px] items-center justify-end gap-1 font-mono text-[12px] font-medium tabular-nums', over ? 'text-warning' : 'text-ink')}>
                          {over && <TriangleAlert size={10} aria-label="Over guideline" />}
                          {f.weeklyLoad} h
                        </span>
                      </div>
                    </Td>
                    <Td>
                      <AttendanceBadge state={f.attendance} />
                    </Td>
                    <Td align="right">
                      <span className="font-mono text-[10.5px] tabular-nums text-muted">{fmtDate(f.joined)}</span>
                    </Td>
                  </Tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <Td colSpan={7} align="center" className="py-10 text-sm text-muted">
                    No faculty match those filters.
                  </Td>
                </tr>
              )}
            </tbody>
          </TableShell>

          {expanded && (
            <FacultyDetail
              faculty={filtered.find((f) => f.id === expanded) ?? faculty.find((f) => f.id === expanded)}
              onClose={() => setExpanded(null)}
            />
          )}
          <p className="text-[10.5px] leading-4 text-muted">
            Workload is computed from the published timetable including labs (2 h = 1 load unit for practicals). Click a row to inspect the full timetable allocation and leave history.
          </p>
        </PageStack>
      </PageScroll>

      <AddFacultyModal open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}

function AttendanceBadge({ state }: { state: AttendanceState }) {
  return (
    <Badge tone={state === 'Present' ? 'success' : 'info'} dot>
      {state}
    </Badge>
  );
}

function FacultyDetail({ faculty, onClose }: { faculty?: FacultyType; onClose: () => void }) {
  if (!faculty) return null;
  const dept = DEPT_MAP[faculty.dept];
  return (
    <SectionCard
      title={`${faculty.name} · ${faculty.id}`}
      subtitle={`${dept.name} · ${faculty.designation} · joined ${fmtDate(faculty.joined)}`}
      icon={GraduationCap}
      actions={<Button size="xs" variant="ghost" onClick={onClose}>Close</Button>}
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-3">
            <Avatar name={faculty.name} size="lg" />
            <div className="min-w-0">
              <p className="text-[12.5px] font-semibold text-ink">{faculty.designation}</p>
              <p className="flex items-center gap-1 text-[10.5px] text-muted"><Mail size={10} /> {faculty.email}</p>
              <p className="flex items-center gap-1 text-[10.5px] text-muted"><Phone size={10} /> {faculty.phone}</p>
            </div>
          </div>
          <div className="mt-3 rounded-lg border border-line bg-surface-low p-2.5">
            <p className="text-[9.5px] uppercase tracking-wide text-muted">Weekly load</p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-display text-[22px] font-bold tabular-nums text-ink">{faculty.weeklyLoad}</span>
              <span className="text-[10px] text-muted">hours / week</span>
            </div>
            <Progress value={(faculty.weeklyLoad / 28) * 100} className="mt-1.5" tone={faculty.weeklyLoad > 20 ? 'rgb(var(--warning))' : 'rgb(var(--primary))'} />
            <p className="mt-1 text-[10px] text-muted">{faculty.weeklyLoad > 20 ? 'Above the 20 h guideline — rebalance recommended' : 'Within the 20 h guideline'}</p>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">Assigned subjects</h4>
              <ul className="space-y-1.5">
                {faculty.subjects.map((s) => (
                  <li key={s} className="rounded-md border border-line px-2.5 py-1.5">
                    <p className="mono text-[10px] text-muted">{s.split(' · ')[0]}</p>
                    <p className="text-[11.5px] text-ink">{s.split(' · ')[1]}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">Teaching allocation</h4>
              <div className="space-y-1.5">
                {[
                  ['Theory lectures', `${Math.round(faculty.weeklyLoad * 0.6)} h`],
                  ['Practical / labs', `${Math.round(faculty.weeklyLoad * 0.25)} h`],
                  ['Tutorials & mentoring', `${Math.round(faculty.weeklyLoad * 0.15)} h`],
                  ['Sections taught', `${2 + (faculty.weeklyLoad % 3)} divisions`],
                  ['Research scholars', `${faculty.weeklyLoad % 4}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between border-b border-line/70 pb-1 text-[11px]">
                    <span className="text-muted">{k}</span>
                    <span className="font-mono tabular-nums text-ink">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-1.5 rounded-md bg-success-soft px-2 py-1.5 text-[10.5px] text-success">
                <Check size={11} /> Biometric attendance synced today, 08:24 AM
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function AddFacultyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addFaculty, faculty } = useApp();
  const blank = {
    name: '',
    designation: 'Assistant Professor',
    dept: 'CSE',
    specialization: '',
    weeklyLoad: '18',
    email: '',
    phone: '',
  };
  const [form, setForm] = useState(blank);
  const [subjects, setSubjects] = useState<string[]>(['']);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  const submit = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    else if (faculty.some((f) => f.name.toLowerCase() === form.name.trim().toLowerCase())) errs.name = 'Faculty already exists';
    if (!form.specialization.trim()) errs.specialization = 'Specialisation is required';
    const cleaned = subjects.map((x) => x.trim()).filter(Boolean);
    if (cleaned.length === 0) errs.subject1 = 'Add at least one subject';
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(form.email.trim())) errs.email = 'Enter a valid institute email';
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    addFaculty({
      name: form.name.trim(),
      designation: form.designation,
      dept: form.dept as FacultyType['dept'],
      specialization: form.specialization.trim(),
      subjects: cleaned,
      weeklyLoad: Number(form.weeklyLoad) || 0,
      attendance: 'Present',
      email: form.email.trim(),
      phone: form.phone ? `+91 ${form.phone.replace(/\D/g, '').slice(-10)}` : '+91 98220 00000',
      joined: new Date().toISOString().slice(0, 10),
    });
    setForm(blank);
    setSubjects(['']);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add faculty member"
      subtitle="HR module · new appointment requires HoD counter-approval"
      icon={<GraduationCap size={16} className="text-primary-tint-fg" />}
      size="lg"
      footer={
        <>
          <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button size="sm" variant="primary" icon={Check} onClick={submit}>Create faculty</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <Field label="Full name" required error={errors.name} className="sm:col-span-2">
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Dr. Ananya Khare" autoFocus />
        </Field>
        <Field label="Designation" required>
          <Select value={form.designation} onChange={(e) => set('designation', e.target.value)}>
            {['Professor & HOD', 'Professor', 'Associate Professor', 'Assistant Professor', 'Visiting Faculty', 'Lab Instructor'].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </Select>
        </Field>
        <Field label="Department" required>
          <Select value={form.dept} onChange={(e) => set('dept', e.target.value)}>
            {DEPARTMENTS.map((d) => (
              <option key={d.code} value={d.code}>{d.code} — {d.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Specialisation" required error={errors.specialization} className="sm:col-span-2">
          <Input value={form.specialization} onChange={(e) => set('specialization', e.target.value)} placeholder="e.g. Natural Language Processing, Applied ML" />
        </Field>
        <Field label="Subjects assigned" required error={errors.subject1} className="sm:col-span-2" hint="Add one subject per field · course code · title">
          <div className="flex flex-col gap-1.5">
            {subjects.map((subject, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <Input
                  value={subject}
                  onChange={(e) => setSubjects((prev) => prev.map((v, i) => (i === idx ? e.target.value : v)))}
                  placeholder={idx === 0 ? 'CS305 · DBMS' : 'CS801 · Deep Learning'}
                />
                <button
                  type="button"
                  onClick={() => setSubjects((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)))}
                  aria-label="Remove subject"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted transition-colors duration-120 hover:bg-danger-soft hover:text-danger"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setSubjects((prev) => [...prev, ''])}
              className="inline-flex h-7 w-fit items-center gap-1 rounded-md px-1.5 text-[11px] font-semibold text-primary transition-colors duration-120 hover:bg-primary-tint"
            >
              <Plus size={11} /> Add another subject
            </button>
          </div>
        </Field>
        <Field label="Weekly load (hours)" hint="Guideline maximum is 20 h/week">
          <Input type="number" min={4} max={30} value={form.weeklyLoad} onChange={(e) => set('weeklyLoad', e.target.value)} />
        </Field>
        <Field label="Institute email" required error={errors.email}>
          <Input value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="ananya.khare@vitp.ac.in" />
        </Field>
        <Field label="Mobile">
          <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="98220 41199" inputMode="tel" />
        </Field>
        <Field label="Remarks" className="sm:col-span-2">
          <Textarea placeholder="Appointment order reference, prior institution, research areas…" className="min-h-[56px]" />
        </Field>
      </div>
    </Modal>
  );
}
