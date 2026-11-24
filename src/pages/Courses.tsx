import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Check,
  GraduationCap,
  Layers,
  Plus,
  Sparkles,
  Users,
} from 'lucide-react';
import { Header, PageScroll, PageStack } from '../components/layout/Header';
import { Badge, Button, Progress, SectionCard } from '../components/ui/primitives';
import { Field, Input, SearchInput, Select } from '../components/ui/Form';
import { Modal } from '../components/ui/Modal';
import { TableFooterMeta, TableShell, Td, Th, Tr } from '../components/ui/Table';
import { useApp } from '../store/AppStore';
import { DEPARTMENTS } from '../data/departments';
import { num } from '../lib/format';
import { cx } from '../lib/cx';
import { navigate, useDebounced, useRoute } from '../lib/hooks';
import type { Course } from '../types';

const TYPE_TONE = { Core: 'primary', Elective: 'info', Lab: 'warning', Seminar: 'neutral' } as const;
const TYPE_LABEL: Record<Course['type'], string> = { Core: 'Core', Elective: 'Elective', Lab: 'Lab / Practical', Seminar: 'Seminar' };

export default function Courses() {
  const { courses, pushToast } = useApp();
  const route = useRoute();
  const [query, setQuery] = useState('');
  const [dept, setDept] = useState('all');
  const [credits, setCredits] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const debounced = useDebounced(query, 120);

  useEffect(() => {
    if (route.query.get('new') === '1') {
      setAddOpen(true);
      navigate('/courses', { replace: true });
    }
  }, [route]);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return courses.filter((c) => {
      if (dept !== 'all' && c.dept !== dept) return false;
      if (credits === '4' && c.credits !== 4) return false;
      if (credits === '3' && c.credits !== 3) return false;
      if (!q) return true;
      return c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.dept.toLowerCase().includes(q);
    });
  }, [courses, debounced, dept, credits]);

  const totalEnrolled = courses.reduce((a, c) => a + c.enrolled, 0);

  return (
    <>
      <Header
        title="Course Information"
        kicker="NEP-2020 aligned curriculum · 142 active courses · 9 departments"
        badge={<Badge tone="success" icon={Check}>NEP aligned</Badge>}
        actions={
          <>
            <Button size="sm" variant="ghost" icon={Sparkles} onClick={() => navigate('/workflow')}>Credit audit</Button>
            <Button size="sm" variant="primary" icon={Plus} onClick={() => setAddOpen(true)}>Add Course</Button>
          </>
        }
      />

      <PageScroll>
        <PageStack>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: 'Active courses', value: '142', meta: 'Across 9 departments', icon: BookOpen, chip: 'bg-primary-tint text-primary-tint-fg' },
              { label: 'NEP credit pool', value: '528', meta: 'Avg 3.7 credits/course', icon: Layers, chip: 'bg-info-soft text-info' },
              { label: 'Enrollments', value: num(totalEnrolled), meta: 'In this workspace view', icon: Users, chip: 'bg-success-soft text-success' },
              { label: 'Programmes', value: '9', meta: '3 autonomous · 6 affiliated', icon: GraduationCap, chip: 'bg-warning-soft text-warning' },
            ].map((k) => (
              <div key={k.label} className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3.5 py-3">
                <span className={cx('flex h-8 w-8 items-center justify-center rounded-lg', k.chip)}><k.icon size={14} /></span>
                <div>
                  <p className="font-display text-[17px] font-bold tabular-nums leading-5 text-ink">{k.value}</p>
                  <p className="text-[9.5px] text-muted">{k.label} · {k.meta}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-line bg-surface p-3">
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput value={query} onChange={setQuery} placeholder="Search course code, title or department…" className="min-w-[250px] flex-1 sm:max-w-[380px]" />
              <Select value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Department" className="w-auto min-w-[160px]">
                <option value="all">All departments</option>
                {DEPARTMENTS.map((d) => <option key={d.code} value={d.code}>{d.code} · {d.short}</option>)}
              </Select>
              <Select value={credits} onChange={(e) => setCredits(e.target.value)} aria-label="Credits" className="w-auto min-w-[130px]">
                <option value="all">Any credits</option>
                <option value="4">4 credits</option>
                <option value="3">3 credits</option>
              </Select>
              <span className="ml-auto text-[10.5px] text-muted">{filtered.length} courses</span>
            </div>
          </div>

          <TableShell footer={<TableFooterMeta shown={filtered.length} total={courses.length} unit="courses" />}>
            <thead>
              <tr>
                <Th>Code</Th>
                <Th>Course Title</Th>
                <Th>Department &amp; Duration</Th>
                <Th>Type</Th>
                <Th align="right">NEP Credits</Th>
                <Th align="right">Enrolled</Th>
                <Th align="right">Fill</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <Tr key={c.id} className="row-hover">
                  <Td><span className="mono text-[11.5px] font-medium text-ink">{c.code}</span></Td>
                  <Td>
                    <p className="max-w-[260px] truncate text-[12.5px] font-medium text-ink">{c.title}</p>
                    <p className="text-[10px] text-muted">Semester {c.semester}</p>
                  </Td>
                  <Td>
                    <span className="inline-flex h-4 items-center rounded bg-surface-container px-1 font-mono text-[9px] text-muted">{c.dept}</span>
                    <span className="ml-1.5 text-[10.5px] text-muted">{c.duration}</span>
                  </Td>
                  <Td><Badge tone={TYPE_TONE[c.type]}>{TYPE_LABEL[c.type]}</Badge></Td>
                  <Td align="right"><span className="mono text-[12px] font-medium tabular-nums text-ink">{c.credits}</span></Td>
                  <Td align="right"><span className="mono text-[12px] tabular-nums text-ink">{num(c.enrolled)}</span></Td>
                  <Td align="right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="w-14"><Progress value={(c.enrolled / 280) * 100} height="h-1" tone={c.enrolled / 280 > 0.8 ? 'rgb(var(--warning))' : 'rgb(var(--primary))'} /></span>
                      <span className="w-8 font-mono text-[9.5px] tabular-nums text-muted">{Math.round((c.enrolled / 280) * 100)}%</span>
                    </div>
                  </Td>
                </Tr>
              ))}
              {filtered.length === 0 && (
                <tr><Td colSpan={7} align="center" className="py-10 text-sm text-muted">No courses match those filters.</Td></tr>
              )}
            </tbody>
          </TableShell>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <SectionCard title="Credits by department" subtitle="NEP-2020 mapping" icon={Layers} className="lg:col-span-2">
              <ul className="space-y-2">
                {DEPARTMENTS.map((d) => {
                  const deptCourses = courses.filter((c) => c.dept === d.code);
                  const totalCredits = deptCourses.reduce((a, c) => a + c.credits, 0);
                  return (
                    <li key={d.code} className="flex items-center gap-2.5">
                      <span className="mono w-10 text-[10px] text-muted">{d.code}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-high">
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, (totalCredits / 24) * 100)}%`, backgroundColor: d.tone }} />
                      </div>
                      <span className="w-8 text-right font-mono text-[10px] tabular-nums text-muted">{deptCourses.length}</span>
                      <span className="w-10 text-right font-mono text-[10px] tabular-nums text-ink">{totalCredits} cr</span>
                    </li>
                  );
                })}
              </ul>
            </SectionCard>
            <SectionCard title="Curriculum policy" subtitle="Academic council 2026" icon={BookOpen}>
              <ul className="space-y-2 text-[10.5px] leading-4 text-muted">
                <li>• Honours requires 160 credits; min 20 from SWAYAM/NPTEL mapped courses.</li>
                <li>• Each course must map to 3–5 programme outcomes and be assessed at 40% internals.</li>
                <li>• Lab courses cap at 24 students per batch; two batches are auto-created above that.</li>
                <li>• Changes to a course with active enrollments require Academic Council approval.</li>
              </ul>
              <Button size="xs" variant="ghost" className="mt-2 px-0" icon={Sparkles} onClick={() => pushToast({ title: 'Credit audit queued', description: 'AI flags credit shortfalls for Sem 7 honours students', tone: 'info' })}>
                Run credit-shortfall audit
              </Button>
            </SectionCard>
          </div>
        </PageStack>
      </PageScroll>

      <AddCourseModal open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}

function AddCourseModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addCourse, courses } = useApp();
  const [form, setForm] = useState({
    code: '',
    title: '',
    dept: 'CSE',
    credits: '4',
    semester: '5',
    type: 'Core' as Course['type'],
    enrolled: '60',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const errs: Record<string, string> = {};
    if (!form.code.trim()) errs.code = 'Course code is required';
    else if (courses.some((c) => c.code.toLowerCase() === form.code.trim().toLowerCase())) errs.code = 'Course code already exists';
    if (!form.title.trim()) errs.title = 'Title is required';
    if (Object.keys(errs).length) return setErrors(errs);
    addCourse({
      code: form.code.trim().toUpperCase(),
      title: form.title.trim(),
      dept: form.dept as Course['dept'],
      duration: `Sem ${form.semester} · 1 Term`,
      credits: Number(form.credits),
      enrolled: Number(form.enrolled) || 0,
      type: form.type,
      semester: Number(form.semester),
      nepAligned: true,
    });
    setForm({ ...form, code: '', title: '' });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add course"
      subtitle="Curriculum catalog · NEP-2020 aligned · requires Academic Council reference"
      icon={<BookOpen size={16} className="text-primary-tint-fg" />}
      size="lg"
      footer={
        <>
          <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button size="sm" variant="primary" icon={Plus} onClick={submit}>Add course</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <Field label="Course code" required error={errors.code}>
          <Input value={form.code} onChange={(e) => { setForm((f) => ({ ...f, code: e.target.value })); setErrors({}); }} placeholder="CS406" className="mono" autoFocus />
        </Field>
        <Field label="Course title" required error={errors.title}>
          <Input value={form.title} onChange={(e) => { setForm((f) => ({ ...f, title: e.target.value })); setErrors({}); }} placeholder="Advanced Operating Systems" />
        </Field>
        <Field label="Department">
          <Select value={form.dept} onChange={(e) => setForm((f) => ({ ...f, dept: e.target.value }))}>
            {DEPARTMENTS.map((d) => <option key={d.code} value={d.code}>{d.code} — {d.name}</option>)}
          </Select>
        </Field>
        <Field label="Semester">
          <Select value={form.semester} onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <option key={s} value={s}>Semester {s}</option>)}
          </Select>
        </Field>
        <Field label="NEP credits" hint="Valid values 1–6">
          <Input type="number" min={1} max={6} value={form.credits} onChange={(e) => setForm((f) => ({ ...f, credits: e.target.value }))} />
        </Field>
        <Field label="Course type">
          <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Course['type'] }))}>
            {(['Core', 'Elective', 'Lab', 'Seminar'] as Course['type'][]).map((t) => <option key={t}>{t}</option>)}
          </Select>
        </Field>
        <Field label="Initial enrollment">
          <Input type="number" min={0} value={form.enrolled} onChange={(e) => setForm((f) => ({ ...f, enrolled: e.target.value }))} />
        </Field>
        <div className="flex items-end">
          <div className="flex w-full items-center gap-2 rounded-md border border-success/25 bg-success-soft px-2.5 py-2 text-[10.5px] text-success">
            <Check size={12} /> NEP-2020 credit mapping enabled
          </div>
        </div>
        <div className="sm:col-span-2 rounded-md border border-line bg-surface-low px-2.5 py-2 text-[10.5px] leading-4 text-muted">
          New courses enter "draft" until the Academic Council resolution is linked. AI can suggest prerequisite mappings based on the syllabus upload.
        </div>
      </div>
    </Modal>
  );
}
