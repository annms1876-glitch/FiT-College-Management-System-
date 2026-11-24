import { useEffect, useMemo, useState } from 'react';
import { Check, ClipboardList, Clock3, FileText, Percent, Plus, Sparkles, TriangleAlert } from 'lucide-react';
import { Header, PageScroll, PageStack } from '../components/layout/Header';
import { Badge, Button, Progress, SectionCard } from '../components/ui/primitives';
import { Field, Input, SearchInput, Select, Textarea } from '../components/ui/Form';
import { Modal } from '../components/ui/Modal';
import { TableFooterMeta, TableShell, Td, Th, Tr } from '../components/ui/Table';
import { useApp } from '../store/AppStore';
import { DEPARTMENTS } from '../data/departments';
import { ASSIGNMENT_STATS } from '../data/seed/academics';
import { daysBetween, fmtDate } from '../lib/format';
import { cx } from '../lib/cx';
import { navigate, useDebounced, useRoute } from '../lib/hooks';
import type { AssignmentStatus } from '../types';

const TONE: Record<AssignmentStatus, 'warning' | 'danger' | 'success'> = {
  'Due Soon': 'warning',
  Overdue: 'danger',
  Graded: 'success',
};

export default function Assignments() {
  const { assignments, pushToast } = useApp();
  const route = useRoute();
  const [query, setQuery] = useState('');
  const [dept, setDept] = useState('all');
  const [status, setStatus] = useState<'all' | AssignmentStatus>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const debounced = useDebounced(query, 120);

  useEffect(() => {
    if (route.query.get('new') === '1') {
      setCreateOpen(true);
      navigate('/assignments', { replace: true });
    }
  }, [route]);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return assignments.filter((a) => {
      if (dept !== 'all' && a.dept !== dept) return false;
      if (status !== 'all' && a.status !== status) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        a.courseCode.toLowerCase().includes(q) ||
        a.faculty.toLowerCase().includes(q)
      );
    });
  }, [assignments, debounced, dept, status]);

  const dueSoon = assignments.filter((a) => a.status === 'Due Soon').length;
  const overdue = assignments.filter((a) => a.status === 'Overdue').length;
  const submitted = assignments.reduce((a, b) => a + b.submitted, 0);
  const total = assignments.reduce((a, b) => a + b.total, 0);
  const rate = ((submitted / total) * 100).toFixed(1);

  return (
    <>
      <Header
        title="Assignment Management"
        kicker={`${assignments.length} tracked in workspace · ${ASSIGNMENT_STATS.active} active institute-wide`}
        actions={
          <>
            <Button size="sm" variant="ghost" icon={Sparkles} onClick={() => navigate('/workflow')}>AI grading check</Button>
            <Button size="sm" variant="primary" icon={Plus} onClick={() => setCreateOpen(true)}>Create Assignment</Button>
          </>
        }
      />

      <PageScroll>
        <PageStack>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: 'Active Assignments', value: String(ASSIGNMENT_STATS.active), meta: `${dueSoon} due within 7 days`, icon: ClipboardList, chip: 'bg-primary-tint text-primary-tint-fg', tone: 'text-ink' },
              { label: 'Submission Rate', value: `${rate}%`, meta: `${submitted} of ${total} in sample · target 90%`, icon: Percent, chip: 'bg-success-soft text-success', tone: 'text-success' },
              { label: 'Overdue Submissions', value: String(ASSIGNMENT_STATS.overdue), meta: `${overdue} assignments past due`, icon: TriangleAlert, chip: 'bg-danger-soft text-danger', tone: 'text-danger' },
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
                {k.label === 'Submission Rate' && <Progress value={Number(rate)} className="mt-2" height="h-1.5" />}
              </div>
            ))}
          </div>

          <SectionCard
            title="Submission velocity"
            subtitle="Weekly submissions vs due load across departments"
            icon={Clock3}
            actions={<Badge tone="outline">Live</Badge>}
          >
            <div className="flex items-end gap-1.5" style={{ height: 96 }}>
              {[42, 58, 51, 66, 74, 63, 81, 70, 88, 76, 92].map((v, i) => (
                <div key={i} className="group relative flex h-full flex-1 flex-col justify-end">
                  <div className="mb-0.5 text-center font-mono text-[8px] tabular-nums text-muted opacity-0 group-hover:opacity-100">{v}</div>
                  <div
                    className="w-full rounded-t-[3px] bg-primary/70 transition-all duration-120 group-hover:bg-primary"
                    style={{ height: `${v}%` }}
                    title={`Week ${i + 1}: ${v} submissions`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-1.5 flex justify-between font-mono text-[9px] text-muted">
              <span>Wk 1</span><span>Wk 4</span><span>Wk 8</span><span>Wk 11</span>
            </div>
          </SectionCard>

          <div className="rounded-xl border border-line bg-surface p-3">
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput value={query} onChange={setQuery} placeholder="Search assignment, course code or faculty…" className="min-w-[250px] flex-1 sm:max-w-[380px]" />
              <Select value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Department" className="w-auto min-w-[150px]">
                <option value="all">All departments</option>
                {DEPARTMENTS.map((d) => <option key={d.code} value={d.code}>{d.code} · {d.short}</option>)}
              </Select>
              <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Status" className="w-auto min-w-[130px]">
                <option value="all">Any status</option>
                <option value="Due Soon">Due Soon</option>
                <option value="Overdue">Overdue</option>
                <option value="Graded">Graded</option>
              </Select>
              <span className="ml-auto text-[11px] text-muted">{filtered.length} shown</span>
            </div>
          </div>

          <TableShell footer={<TableFooterMeta shown={filtered.length} total={assignments.length} unit="assignments" />}>
            <thead>
              <tr>
                <Th>Assignment ID</Th>
                <Th>Title &amp; Course</Th>
                <Th>Dept · Sem</Th>
                <Th>Faculty</Th>
                <Th align="right">Submitted</Th>
                <Th>Due date</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const submissionPct = Math.round((a.submitted / a.total) * 100);
                const late = a.status === 'Overdue';
                return (
                  <Tr key={a.id} interactive onClick={() => pushToast({ title: a.title, description: `${a.courseCode} · ${a.faculty} · ${a.submitted}/${a.total} submissions`, tone: 'info' })}>
                    <Td><span className="mono text-[11px] text-ink">{a.code}</span></Td>
                    <Td>
                      <p className="max-w-[260px] truncate text-[12.5px] font-semibold text-ink">{a.title}</p>
                      <p className="text-[10.5px] text-muted"><span className="mono">{a.courseCode}</span> · {a.course}</p>
                    </Td>
                    <Td>
                      <span className="inline-flex h-4 items-center rounded bg-surface-container px-1 font-mono text-[9.5px] text-muted">{a.dept}</span>
                      <span className="ml-1 text-[10.5px] text-muted">Sem {a.semester}</span>
                    </Td>
                    <Td><span className="max-w-[150px] truncate text-[11.5px] text-ink">{a.faculty}</span></Td>
                    <Td align="right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="w-12"><Progress value={submissionPct} height="h-1" tone={late ? 'rgb(var(--danger))' : submissionPct >= 80 ? 'rgb(var(--success))' : 'rgb(var(--primary))'} /></span>
                        <span className="font-mono text-[11px] tabular-nums text-ink">{a.submitted}/{a.total}</span>
                      </div>
                    </Td>
                    <Td>
                      <span className="flex flex-col">
                        <span className="font-mono text-[10.5px] tabular-nums text-ink">{fmtDate(a.due)}</span>
                        <span className={cx('text-[9px]', late ? 'text-danger' : 'text-muted')}>
                          {late ? `${daysBetween(a.due)} d past due` : a.status === 'Graded' ? 'closed' : `in ${Math.max(0, -daysBetween(a.due, a.due) + 6)} d`}
                        </span>
                      </span>
                    </Td>
                    <Td><Badge tone={TONE[a.status]} dot>{a.status}</Badge></Td>
                  </Tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><Td colSpan={7} align="center" className="py-10 text-sm text-muted">No assignments match those filters.</Td></tr>
              )}
            </tbody>
          </TableShell>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <SectionCard title="Grading readiness" subtitle="Marks verified vs pending" icon={FileText}>
              <div className="flex h-2 overflow-hidden rounded-full bg-surface-high">
                <div className="h-full bg-success" style={{ width: '72%' }} />
                <div className="h-full bg-warning" style={{ width: '18%' }} />
                <div className="h-full bg-danger" style={{ width: '10%' }} />
              </div>
              <div className="mt-2 space-y-1.5 text-[11px]">
                {[['Verified', '72%', 'text-success'], ['Awaiting marks', '18%', 'text-warning'], ['Re-evaluation', '10%', 'text-danger']].map(([l, v, t]) => (
                  <div key={l} className="flex justify-between"><span className="text-muted">{l}</span><span className={cx('font-mono tabular-nums', t)}>{v}</span></div>
                ))}
              </div>
            </SectionCard>
            <SectionCard title="Busiest faculty" subtitle="By live assignments" icon={ClipboardList} className="lg:col-span-2">
              <ul className="space-y-1.5">
                {Object.entries(assignments.reduce<Record<string, number>>((acc, a) => { acc[a.faculty] = (acc[a.faculty] ?? 0) + 1; return acc; }, {}))
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 4)
                  .map(([name, count], i) => (
                    <li key={name} className="flex items-center gap-2.5">
                      <span className="mono w-4 text-[10px] text-muted">{i + 1}</span>
                      <span className="flex-1 truncate text-[11.5px] text-ink">{name}</span>
                      <div className="w-28"><Progress value={(count / 4) * 100} height="h-1" /></div>
                      <span className="w-14 text-right font-mono text-[10.5px] text-muted">{count} active</span>
                    </li>
                  ))}
              </ul>
            </SectionCard>
          </div>
          <p className="text-[10.5px] leading-4 text-muted">
            Due-date reminders are sent at T-48 h and T-6 h. Late submissions are auto-flagged for faculty review; AI never grades without faculty sign-off.
          </p>
        </PageStack>
      </PageScroll>

      <CreateAssignmentModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}

function CreateAssignmentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addAssignment, faculty } = useApp();
  const blank = {
    title: '',
    course: 'Operating Systems',
    courseCode: 'CS401',
    dept: 'CSE',
    semester: '5',
    facultyName: faculty[0]?.name ?? '',
    due: '2026-12-01',
    total: '60',
    instructions: '',
  };
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  const submit = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.due) errs.due = 'Due date is required';
    if (Object.keys(errs).length) return setErrors(errs);
    const deptFaculty = faculty.filter((f) => f.dept === form.dept);
    addAssignment({
      code: `A-2026-${320 + Math.floor(Math.random() * 60)}`,
      title: form.title.trim(),
      course: form.course,
      courseCode: form.courseCode,
      dept: form.dept as typeof form.dept extends string ? never : any,
      semester: Number(form.semester),
      faculty: deptFaculty.find((f) => f.name === form.facultyName)?.name ?? deptFaculty[0]?.name ?? form.facultyName,
      assigned: new Date().toISOString().slice(0, 10),
      due: form.due,
      submitted: 0,
      total: Number(form.total) || 60,
      status: 'Due Soon',
    } as never);
    setForm(blank);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create assignment"
      subtitle="Published to the course roster · students notified via portal + email"
      icon={<ClipboardList size={16} className="text-primary-tint-fg" />}
      size="lg"
      footer={
        <>
          <span className="mr-auto hidden text-[10.5px] text-muted sm:block">Draft is saved automatically until published.</span>
          <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button size="sm" variant="primary" icon={Check} onClick={submit}>Publish assignment</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <Field label="Assignment title" required error={errors.title} className="sm:col-span-2">
          <Input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Process Synchronisation Case Study" autoFocus />
        </Field>
        <Field label="Department">
          <Select value={form.dept} onChange={(e) => set('dept', e.target.value)}>
            {DEPARTMENTS.map((d) => <option key={d.code} value={d.code}>{d.code} — {d.name}</option>)}
          </Select>
        </Field>
        <Field label="Semester">
          <Select value={form.semester} onChange={(e) => set('semester', e.target.value)}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <option key={s} value={s}>Semester {s}</option>)}
          </Select>
        </Field>
        <Field label="Course">
          <Input value={form.course} onChange={(e) => set('course', e.target.value)} />
        </Field>
        <Field label="Course code">
          <Input value={form.courseCode} onChange={(e) => set('courseCode', e.target.value)} className="mono" />
        </Field>
        <Field label="Faculty">
          <Select value={form.facultyName} onChange={(e) => set('facultyName', e.target.value)}>
            {faculty.filter((f) => f.dept === form.dept).map((f) => <option key={f.id} value={f.name}>{f.name}</option>)}
          </Select>
        </Field>
        <Field label="Due date" required error={errors.due}>
          <Input type="date" value={form.due} onChange={(e) => set('due', e.target.value)} />
        </Field>
        <Field label="Roster size">
          <Input type="number" min={1} value={form.total} onChange={(e) => set('total', e.target.value)} />
        </Field>
        <Field label="Faculty instructions" className="sm:col-span-2">
          <Textarea value={form.instructions} onChange={(e) => set('instructions', e.target.value)} placeholder="Submission format, evaluation rubric, plagiarism policy…" />
        </Field>
      </div>
    </Modal>
  );
}
