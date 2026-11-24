import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Check,
  CircleAlert,
  Download,
  FileText,
  Fingerprint,
  FolderOpen,
  GraduationCap,
  IdCard,
  Lock,
  Mail,
  MapPin,
  Phone,
  Plus,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  Upload,
  Users,
  Wallet,
} from 'lucide-react';
import { Header, PageScroll, PageStack } from '../components/layout/Header';
import { Avatar, Badge, Button, IconButton, Progress, SectionCard, type BadgeTone } from '../components/ui/primitives';
import { Field, Input, SearchInput, Select, Textarea } from '../components/ui/Form';
import { ConfirmDialog, Modal } from '../components/ui/Modal';
import { TableFooterMeta, TableShell, Td, Th, Tr } from '../components/ui/Table';
import { Tabs } from '../components/ui/Tabs';
import { RadialGauge } from '../components/charts/Charts';
import { useApp } from '../store/AppStore';
import { DEPARTMENTS, DEPT_MAP } from '../data/departments';
import { downloadCSV, fmtDate, inr, num, pct } from '../lib/format';
import { cx } from '../lib/cx';
import { navigate, useDebounced, useRoute } from '../lib/hooks';
import type { FeeStatus, Student } from '../types';

const FEE_TONE: Record<FeeStatus, BadgeTone> = {
  Paid: 'success',
  Partial: 'warning',
  Overdue: 'danger',
};

const PAGE_SIZE = 12;

export default function Students() {
  const { students, deleteStudent, pushToast } = useApp();
  const route = useRoute();
  const [query, setQuery] = useState('');
  const [dept, setDept] = useState('all');
  const [semester, setSemester] = useState('all');
  const [feeFilter, setFeeFilter] = useState<'all' | 'below' | FeeStatus>('all');
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [profileRoll, setProfileRoll] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const debounced = useDebounced(query, 120);

  useEffect(() => {
    if (route.query.get('new') === '1') {
      setAddOpen(true);
      navigate('/students', { replace: true });
    }
    const s = route.query.get('student');
    if (s) setProfileRoll(s);
  }, [route]);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return students.filter((s) => {
      if (dept !== 'all' && s.dept !== dept) return false;
      if (semester !== 'all' && String(s.semester) !== semester) return false;
      if (feeFilter === 'below' && s.attendance >= 75) return false;
      if ((feeFilter === 'Paid' || feeFilter === 'Partial' || feeFilter === 'Overdue') && s.feeStatus !== feeFilter) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.roll.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
      );
    });
  }, [students, debounced, dept, semester, feeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const profileStudent = students.find((s) => s.roll === profileRoll) ?? null;

  const resetFilters = () => {
    setQuery('');
    setDept('all');
    setSemester('all');
    setFeeFilter('all');
    setPage(1);
  };

  const activeFilters = (dept !== 'all' ? 1 : 0) + (semester !== 'all' ? 1 : 0) + (feeFilter !== 'all' ? 1 : 0);

  const exportCsv = () => {
    downloadCSV(
      'vanguard-students.csv',
      ['Roll No', 'Name', 'Email', 'Department', 'Course', 'Semester', 'Attendance %', 'CGPA', 'Fee status'],
      filtered.map((s) => [s.roll, s.name, s.email, DEPT_MAP[s.dept].name, s.course, s.semester, s.attendance, s.cgpa, s.feeStatus]),
    );
    pushToast({ title: 'CSV exported', description: `${filtered.length} student records · vanguard-students.csv`, tone: 'success' });
  };

  const toggleAll = () => {
    if (selected.size === pageRows.length) setSelected(new Set());
    else setSelected(new Set(pageRows.map((r) => r.id)));
  };

  return (
    <>
      <Header
        title="Student Records"
        kicker={`${num(students.length)} records in this workspace · ${num(4820)} enrolled institute-wide`}
        actions={
          <>
            <Button size="sm" variant="ghost" icon={Download} onClick={exportCsv}>
              Export CSV
            </Button>
            <Button size="sm" variant="secondary" icon={Upload} onClick={() => setImportOpen(true)}>
              CSV Import
            </Button>
            <Button size="sm" variant="primary" icon={Plus} onClick={() => setAddOpen(true)}>
              Add Student
            </Button>
          </>
        }
      />

      <PageScroll>
        <PageStack>
          {/* Stat strip */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: 'Total on rolls', value: '4,820', meta: '+184 YoY', icon: Users, tone: 'text-ink' },
              { label: 'Below 75% attendance', value: '186', meta: 'Needs counselling', icon: TriangleAlert, tone: 'text-danger' },
              { label: 'Fee overdue', value: num(students.filter((s) => s.feeStatus === 'Overdue').length * 62), meta: '₹3.24 Cr pending', icon: Wallet, tone: 'text-warning' },
              { label: 'DigiLocker KYC complete', value: '4,610', meta: '95.6% coverage', icon: ShieldCheck, tone: 'text-success' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3.5 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-low text-muted">
                  <s.icon size={15} strokeWidth={2} aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className={cx('font-display text-[17px] font-bold leading-5 tabular-nums', s.tone)}>{s.value}</p>
                  <p className="truncate text-[10.5px] text-muted">{s.label} · {s.meta}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="rounded-xl border border-line bg-surface p-3">
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput
                value={query}
                onChange={(v) => {
                  setQuery(v);
                  setPage(1);
                }}
                placeholder="Search name, roll number or email…"
                className="min-w-[240px] flex-1 sm:max-w-[360px]"
              />
              <Select
                value={dept}
                onChange={(e) => {
                  setDept(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter by department"
                className="w-auto min-w-[150px]"
              >
                <option value="all">All departments</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.code} · {d.short}
                  </option>
                ))}
              </Select>
              <Select
                value={semester}
                onChange={(e) => {
                  setSemester(e.target.value);
                  setPage(1);
                }}
                aria-label="Filter by semester"
                className="w-auto min-w-[124px]"
              >
                <option value="all">All semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </Select>
              <Select
                value={feeFilter}
                onChange={(e) => {
                  setFeeFilter(e.target.value as typeof feeFilter);
                  setPage(1);
                }}
                aria-label="Filter by fee / attendance"
                className="w-auto min-w-[140px]"
              >
                <option value="all">All fee statuses</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Overdue">Overdue</option>
                <option value="below">Attendance &lt; 75%</option>
              </Select>
              {(query || activeFilters > 0) && (
                <Button size="xs" variant="ghost" onClick={resetFilters} className="text-muted">
                  Reset {activeFilters > 0 && `(${activeFilters})`}
                </Button>
              )}
              <span className="ml-auto text-[11px] text-muted">
                {filtered.length} match{filtered.length === 1 ? '' : 'es'}
              </span>
            </div>
            {selected.size > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-primary/20 bg-primary-tint px-3 py-2 animate-pop-in">
                <span className="text-xs font-semibold text-primary-tint-fg">{selected.size} selected</span>
                <span className="h-3 w-px bg-primary/20" />
                <button type="button" className="text-xs font-semibold text-primary-tint-fg hover:underline" onClick={() => pushToast({ title: 'Email draft created', description: `${selected.size} guardian emails staged in Outbox`, tone: 'info' })}>
                  Email guardians
                </button>
                <button type="button" className="text-xs font-semibold text-primary-tint-fg hover:underline" onClick={() => { downloadCSV('vanguard-selection.csv', ['Roll', 'Name'], pageRows.filter(r => selected.has(r.id)).map(r => [r.roll, r.name])); pushToast('Selection exported', 'success'); }}>
                  Export selection
                </button>
                <button type="button" className="ml-auto text-xs font-semibold text-primary-tint-fg/70 hover:text-primary-tint-fg" onClick={() => setSelected(new Set())}>
                  Clear
                </button>
              </div>
            )}
          </div>

          <TableShell
            footer={
              <>
                <TableFooterMeta shown={pageRows.length} total={filtered.length} />
                <div className="flex items-center gap-1.5">
                  <Button size="xs" variant="secondary" disabled={currentPage <= 1} onClick={() => setPage((p) => p - 1)}>
                    Previous
                  </Button>
                  <span className="px-1.5 font-mono text-[11px] tabular-nums text-muted">
                    {currentPage} / {totalPages}
                  </span>
                  <Button size="xs" variant="secondary" disabled={currentPage >= totalPages} onClick={() => setPage((p) => p + 1)}>
                    Next
                  </Button>
                </div>
              </>
            }
          >
            <thead>
              <tr>
                <Th className="w-8 pr-0">
                  <input
                    type="checkbox"
                    aria-label="Select all rows on this page"
                    checked={pageRows.length > 0 && selected.size === pageRows.length}
                    onChange={toggleAll}
                    className="h-3.5 w-3.5 rounded border-line accent-primary"
                  />
                </Th>
                <Th>Roll No</Th>
                <Th>Student</Th>
                <Th>Dept &amp; Course</Th>
                <Th>Semester</Th>
                <Th align="right">Attendance</Th>
                <Th>Fee status</Th>
                <Th align="right" />
              </tr>
            </thead>
            <tbody>
              {pageRows.map((s) => {
                const deptMeta = DEPT_MAP[s.dept];
                return (
                  <Tr key={s.id} interactive onClick={() => setProfileRoll(s.roll)}>
                    <Td className="pr-0" >
                      <input
                        type="checkbox"
                        aria-label={`Select ${s.name}`}
                        checked={selected.has(s.id)}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          setSelected((prev) => {
                            const next = new Set(prev);
                            if (next.has(s.id)) next.delete(s.id);
                            else next.add(s.id);
                            return next;
                          });
                        }}
                        className="h-3.5 w-3.5 rounded border-line accent-primary"
                      />
                    </Td>
                    <Td>
                      <span className="mono text-[11.5px] font-medium text-ink">{s.roll}</span>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={s.name} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-[12.5px] font-semibold leading-4 text-ink">{s.name}</p>
                          <p className="truncate text-[10.5px] leading-3.5 text-muted">{s.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex h-4 items-center rounded bg-surface-container px-1 font-mono text-[9.5px] font-medium text-muted">
                          {s.dept}
                        </span>
                        <span className="truncate text-[11.5px] text-muted">{s.course.replace('B.Tech ', '')}</span>
                      </div>
                    </Td>
                    <Td>
                      <span className="text-[12px] tabular-nums text-ink">Sem {s.semester}</span>
                      <span className="ml-1.5 text-[10px] text-muted">{s.division}</span>
                    </Td>
                    <Td align="right">
                      <span
                        className={cx(
                          'inline-flex items-center gap-1 font-mono text-[12px] font-medium tabular-nums',
                          s.attendance < 75 ? 'text-danger' : s.attendance < 85 ? 'text-warning' : 'text-ink',
                        )}
                      >
                        {s.attendance < 75 && <TriangleAlert size={10} aria-label="Below threshold" />}
                        {pct(s.attendance)}
                      </span>
                    </Td>
                    <Td>
                      <Badge tone={FEE_TONE[s.feeStatus]} dot>
                        {s.feeStatus}
                      </Badge>
                    </Td>
                    <Td align="right">
                      <div className="flex items-center justify-end gap-0.5">
                        <IconButton
                          icon={Trash2}
                          label={`Delete ${s.name}`}
                          variant="danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(s);
                          }}
                        />
                        <IconButton
                          icon={ArrowRight}
                          label={`Open ${s.name} profile`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setProfileRoll(s.roll);
                          }}
                        />
                      </div>
                    </Td>
                  </Tr>
                );
              })}
              {pageRows.length === 0 && (
                <tr>
                  <Td colSpan={8} align="center" className="py-12">
                    <Users size={20} className="mx-auto mb-2 text-muted/60" />
                    <p className="text-sm font-semibold text-ink">No students match those filters</p>
                    <p className="mt-1 text-xs text-muted">Try clearing the search or choosing a different department.</p>
                    <Button size="xs" variant="secondary" className="mx-auto mt-3" onClick={resetFilters}>
                      Reset filters
                    </Button>
                  </Td>
                </tr>
              )}
            </tbody>
          </TableShell>

          <p className="text-[10.5px] leading-4 text-muted">
            Clicking a row opens the tabbed student profile. Data shown here is a representative sample of the 4,820 enrolled students; every record is scoped by RBAC and KYC consent.
          </p>
        </PageStack>
      </PageScroll>

      <AddStudentModal open={addOpen} onClose={() => setAddOpen(false)} />
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
      <StudentProfileModal student={profileStudent} onClose={() => setProfileRoll(null)} />
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteStudent(deleteTarget.id)}
        title={`Archive ${deleteTarget?.name}?`}
        description={`${deleteTarget?.roll} will be removed from active records. This is soft-archive only — the academic transcript is retained for 7 years per UGC norms.`}
        confirmLabel="Archive record"
      />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Add student                                                               */
/* -------------------------------------------------------------------------- */
function AddStudentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addStudent, students } = useApp();
  const blank = {
    name: '',
    roll: '',
    email: '',
    phone: '',
    dept: 'CSE',
    course: 'B.Tech Computer Engineering',
    semester: '3',
    division: 'Div A',
    guardianName: '',
    guardianRelation: 'Father',
    guardianPhone: '',
    attendance: '88',
    cgpa: '7.8',
    feeStatus: 'Paid' as FeeStatus,
    scholarship: '',
    address: '',
  };
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof typeof form, v: string) => {
    setForm((f) => {
      const next = { ...f, [k]: v };
      if (k === 'dept') {
        const map: Record<string, string> = {
          CSE: 'B.Tech Computer Engineering',
          IT: 'B.Tech Information Technology',
          AIDS: 'B.Tech AI & Data Science',
          ECE: 'B.Tech Electronics & Telecom',
          MECH: 'B.Tech Mechanical Engineering',
          CIVIL: 'B.Tech Civil Engineering',
          MBA: 'MBA Business Administration',
          BBA: 'BBA (Autonomous)',
          AS: 'B.Tech First Year',
        };
        next.course = map[v] ?? next.course;
      }
      return next;
    });
    setErrors((e) => ({ ...e, [k]: '' }));
  };

  const submit = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!/^[A-Za-z .'-]{2,}$/.test(form.name.trim())) errs.name = errs.name || 'Use letters only';
    if (!form.roll.trim()) errs.roll = 'Roll number is required';
    else if (!/^[0-9]{4}[A-Z]{2,5}[A-Z0-9]{3,5}$/.test(form.roll.trim().toUpperCase())) errs.roll = 'Use format 2023CSEB104';
    else if (students.some((s) => s.roll.toLowerCase() === form.roll.trim().toLowerCase())) errs.roll = 'Roll number already exists';
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(form.email.trim())) errs.email = 'Enter a valid email';
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, '').slice(-10))) errs.phone = 'Enter a valid 10-digit mobile';
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    const dept = form.dept as Student['dept'];
    const feeTotal = dept === 'MBA' ? 184500 : dept === 'BBA' ? 96500 : 148500;
    addStudent({
      name: form.name.trim(),
      roll: form.roll.trim().toUpperCase(),
      email: form.email.trim().toLowerCase(),
      phone: `+91 ${form.phone.replace(/\D/g, '').slice(-10)}`,
      dept,
      course: form.course,
      semester: Number(form.semester),
      division: form.division,
      attendance: Number(form.attendance) || 0,
      feeStatus: form.feeStatus,
      cgpa: Math.min(10, Number(form.cgpa) || 0),
      guardianName: form.guardianName.trim() || 'Not provided',
      guardianRelation: form.guardianRelation,
      guardianPhone: form.guardianPhone ? `+91 ${form.guardianPhone.replace(/\D/g, '').slice(-10)}` : 'Not provided',
      address: form.address.trim() || 'Pune, Maharashtra',
      admissionYear: 2026 - Math.ceil(Number(form.semester) / 2),
      scholarship: form.scholarship || null,
      docs: { digilocker: false, aadhaar: false, income: false, caste: false, photo: false },
      feePaid: form.feeStatus === 'Paid' ? feeTotal : form.feeStatus === 'Partial' ? Math.round(feeTotal * 0.6) : 0,
      feeTotal,
      bloodGroup: '—',
      hosteller: false,
    });
    setForm(blank);
    setErrors({});
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add student record"
      subtitle="Admissions module · AY 2026-27 · record is created in draft KYC state"
      icon={<Plus size={16} className="text-primary-tint-fg" />}
      size="xl"
      footer={
        <>
          <span className="mr-auto hidden items-center gap-1.5 text-[10.5px] text-muted sm:flex">
            <Lock size={11} /> Aadhaar/income documents remain unverified until DigiLocker KYC.
          </span>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" onClick={submit} icon={Check}>
            Create student
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <Field label="Full name" required error={errors.name}>
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Aarav Deshmukh" autoFocus />
        </Field>
        <Field label="Roll number" required error={errors.roll} hint="Format: year + department + programme">
          <Input value={form.roll} onChange={(e) => set('roll', e.target.value)} placeholder="2026CSEB104" className="mono" />
        </Field>
        <Field label="Institute email" required error={errors.email}>
          <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="aarav.deshmukh@vitp.ac.in" />
        </Field>
        <Field label="Mobile" required error={errors.phone}>
          <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="98765 43210" inputMode="tel" />
        </Field>
        <Field label="Department" required>
          <Select value={form.dept} onChange={(e) => set('dept', e.target.value)}>
            {DEPARTMENTS.map((d) => (
              <option key={d.code} value={d.code}>
                {d.code} — {d.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Programme">
          <Input value={form.course} onChange={(e) => set('course', e.target.value)} />
        </Field>
        <Field label="Semester" required>
          <Select value={form.semester} onChange={(e) => set('semester', e.target.value)}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Division">
          <Select value={form.division} onChange={(e) => set('division', e.target.value)}>
            {['Div A', 'Div B', 'Div C'].map((d) => (
              <option key={d}>{d}</option>
            ))}
          </Select>
        </Field>
        <Field label="Guardian name">
          <Input value={form.guardianName} onChange={(e) => set('guardianName', e.target.value)} placeholder="Suresh Deshmukh" />
        </Field>
        <Field label="Guardian relation">
          <Select value={form.guardianRelation} onChange={(e) => set('guardianRelation', e.target.value)}>
            {['Father', 'Mother', 'Guardian'].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </Select>
        </Field>
        <Field label="Guardian mobile">
          <Input value={form.guardianPhone} onChange={(e) => set('guardianPhone', e.target.value)} placeholder="98220 00000" inputMode="tel" />
        </Field>
        <Field label="Scholarship scheme" hint="AI match can be re-run after KYC">
          <Select value={form.scholarship} onChange={(e) => set('scholarship', e.target.value)}>
            <option value="">None declared</option>
            <option>NSP · Post-Matric Scholarship</option>
            <option>MahaDBT · EBC 50% Tuition Waiver</option>
            <option>MahaDBT · Rajarshi Chhatrapati Shahu Maharaj</option>
            <option>Institutional Merit · Rank 1-10</option>
          </Select>
        </Field>
        <Field label="Initial attendance %">
          <Input type="number" min={0} max={100} value={form.attendance} onChange={(e) => set('attendance', e.target.value)} />
        </Field>
        <Field label="Current CGPA">
          <Input type="number" step="0.01" min={0} max={10} value={form.cgpa} onChange={(e) => set('cgpa', e.target.value)} />
        </Field>
        <Field label="Fee status">
          <Select value={form.feeStatus} onChange={(e) => set('feeStatus', e.target.value)}>
            {(['Paid', 'Partial', 'Overdue'] as FeeStatus[]).map((f) => (
              <option key={f}>{f}</option>
            ))}
          </Select>
        </Field>
        <Field label="Residential address" className="sm:col-span-2">
          <Textarea value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Flat, street, locality, Pune – 411038" className="min-h-[60px]" />
        </Field>
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/*  CSV import                                                                */
/* -------------------------------------------------------------------------- */
const CSV_SAMPLE = `roll,name,email,dept,semester,attendance
2026CSEB901,Riya Kulkarni,riya.kulkarni@vitp.ac.in,CSE,1,92.4
2026ITB902,Sahil Mane,sahil.mane@vitp.ac.in,IT,1,68.2`;

function ImportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addStudent, pushToast } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<string[][]>([]);
  const [error, setError] = useState('');

  const parse = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) {
      setError('CSV needs a header row and at least one record.');
      return;
    }
    const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const required = ['roll', 'name', 'email', 'dept'];
    const missing = required.filter((r) => !header.includes(r));
    if (missing.length) {
      setError(`Missing required column(s): ${missing.join(', ')}`);
      return;
    }
    const parsed = lines.slice(1).map((line) => {
      const cells = line.split(',').map((c) => c.trim());
      return required.map((key) => cells[header.indexOf(key)] ?? '');
    });
    setRows(parsed);
    setError('');
  };

  const importRows = () => {
    let created = 0;
    rows.forEach(([roll, name, email, dept], i) => {
      if (!roll || !name) return;
      const d = (dept?.toUpperCase() || 'CSE') as Student['dept'];
      const deptValid = DEPARTMENTS.some((x) => x.code === d);
      addStudent({
        name,
        roll: roll.toUpperCase(),
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@vitp.ac.in`,
        phone: '+91 90000 00000',
        dept: deptValid ? d : 'CSE',
        course: DEPT_MAP[deptValid ? d : 'CSE'].name,
        semester: 1,
        division: 'Div A',
        attendance: 90,
        feeStatus: 'Partial',
        cgpa: 0,
        guardianName: 'To be updated',
        guardianRelation: 'Father',
        guardianPhone: 'To be updated',
        address: 'Pune, Maharashtra',
        admissionYear: 2026,
        scholarship: null,
        docs: { digilocker: false, aadhaar: false, income: false, caste: false, photo: false },
        feePaid: 0,
        feeTotal: 148500,
        bloodGroup: '—',
        hosteller: false,
      });
      created += 1;
      void i;
    });
    pushToast({ title: 'CSV import complete', description: `${created} student record${created === 1 ? '' : 's'} created from ${fileName}`, tone: 'success' });
    setRows([]);
    setFileName('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="CSV import"
      subtitle="Bulk upload admissions data · validation runs before records are created"
      icon={<Upload size={16} className="text-primary-tint-fg" />}
      size="lg"
      footer={
        <>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" variant="secondary" icon={Download} onClick={() => downloadTextFileSafe('vanguard-import-sample.csv', CSV_SAMPLE)}>
            Sample file
          </Button>
          <Button size="sm" variant="primary" icon={Upload} disabled={rows.length === 0} onClick={importRows}>
            Import {rows.length > 0 ? `${rows.length} records` : ''}
          </Button>
        </>
      }
    >
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            setFileName(file.name);
            parse(String(reader.result));
          };
          reader.readAsText(file);
        }}
        className="flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-line bg-surface-low px-4 py-8 text-center transition-colors duration-120 hover:border-primary/40 hover:bg-primary-tint/40"
      >
        <Upload size={18} className="text-muted" aria-hidden />
        <span className="text-sm font-semibold text-ink">{fileName || 'Drop CSV here or click to browse'}</span>
        <span className="text-[11px] text-muted">Required columns: roll, name, email, dept · max 2 MB</span>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            setFileName(file.name);
            parse(String(reader.result));
          };
          reader.readAsText(file);
          e.target.value = '';
        }}
      />
      {error && (
        <p className="mt-2 flex items-center gap-1.5 rounded-md border border-danger/25 bg-danger-soft px-2.5 py-2 text-xs text-danger">
          <CircleAlert size={13} /> {error}
        </p>
      )}
      {rows.length > 0 && (
        <div className="mt-3 overflow-hidden rounded-lg border border-line">
          <div className="flex items-center justify-between border-b border-line bg-surface-low px-3 py-1.5">
            <span className="text-[11px] font-semibold text-ink">Preview · {rows.length} rows</span>
            <Badge tone="success" icon={Check}>
              Schema valid
            </Badge>
          </div>
          <div className="max-h-44 overflow-y-auto scroll-thin">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr>
                  {['Roll', 'Name', 'Email', 'Dept'].map((h) => (
                    <th key={h} className="bg-surface px-3 py-1.5 font-semibold text-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-line/70">
                    {r.map((c, j) => (
                      <td key={j} className="px-3 py-1.5 font-mono text-[10.5px] text-ink">
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Modal>
  );
}

function downloadTextFileSafe(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* -------------------------------------------------------------------------- */
/*  Student profile                                                           */
/* -------------------------------------------------------------------------- */
function StudentProfileModal({ student, onClose }: { student: Student | null; onClose: () => void }) {
  const [tab, setTab] = useState('overview');
  const { pushToast } = useApp();

  useEffect(() => {
    if (student) setTab('overview');
  }, [student]);

  if (!student) return null;
  const dept = DEPT_MAP[student.dept];
  const docEntries = [
    { key: 'digilocker', label: 'DigiLocker account linked' },
    { key: 'aadhaar', label: 'Aadhaar (masked) verified' },
    { key: 'income', label: 'Income certificate' },
    { key: 'caste', label: 'Caste / validity certificate' },
    { key: 'photo', label: 'Passport photograph' },
  ] as const;
  const verifiedCount = docEntries.filter((d) => student.docs[d.key]).length;

  return (
    <Modal
      open={!!student}
      onClose={onClose}
      size="2xl"
      title={
        <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          {student.name}
          <span className="mono rounded bg-surface-container px-1.5 py-0.5 text-[11px] font-medium text-muted">{student.roll}</span>
          <Badge tone={FEE_TONE[student.feeStatus]} dot>
            {student.feeStatus}
          </Badge>
        </span>
      }
      subtitle={`${dept.name} · ${student.course} · Semester ${student.semester} · ${student.division}`}
      icon={<GraduationCap size={17} className="text-primary-tint-fg" />}
      headerExtra={
        <div className="mr-1 hidden items-center gap-1.5 sm:flex">
          <Button size="xs" variant="ghost" icon={Mail} onClick={() => pushToast({ title: 'Email composer opened', description: `Draft to ${student.email}`, tone: 'info' })}>
            Email
          </Button>
          <Button size="xs" variant="secondary" icon={Download} onClick={() => pushToast({ title: 'Profile exported', description: `${student.roll} · PDF with KYC cover sheet`, tone: 'success' })}>
            Export
          </Button>
        </div>
      }
      bodyClassName="px-0 py-0"
      footer={
        <>
          <span className="mr-auto hidden items-center gap-1.5 text-[10.5px] text-muted sm:flex">
            <Lock size={11} /> Access logged · RBAC scoped to Super Administrator
          </span>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button size="sm" variant="primary" icon={ArrowRight} onClick={() => { onClose(); navigate('/fees?tab=submissions'); }}>
            Open fee ledger
          </Button>
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-4 border-b border-line bg-surface-low/60 px-5 py-3.5">
        <Avatar name={student.name} size="xl" />
        <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-4">
          <ProfileMeta icon={Mail} label="Email" value={student.email} mono={false} />
          <ProfileMeta icon={Phone} label="Mobile" value={student.phone} />
          <ProfileMeta icon={CalendarClock} label="Admitted" value={String(student.admissionYear)} />
          <ProfileMeta icon={MapPin} label="Location" value={student.hosteller ? 'Hostel · Block C' : 'Day scholar'} />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="font-display text-[18px] font-bold tabular-nums text-ink">{student.cgpa.toFixed(2)}</p>
            <p className="text-[9.5px] uppercase tracking-wide text-muted">CGPA</p>
          </div>
          <div className="h-8 w-px bg-line" />
          <div className="text-center">
            <p className={cx('font-display text-[18px] font-bold tabular-nums', student.attendance < 75 ? 'text-danger' : 'text-ink')}>
              {pct(student.attendance)}
            </p>
            <p className="text-[9.5px] uppercase tracking-wide text-muted">Attendance</p>
          </div>
        </div>
      </div>

      <div className="px-5">
        <Tabs
          className="border-b-0"
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'overview', label: 'Overview & Guardian', icon: <IdCard size={13} /> },
            { id: 'academics', label: 'Attendance & Academics', icon: <GraduationCap size={13} /> },
            { id: 'fees', label: 'Fees, Scholarship & Docs', icon: <Wallet size={13} />, count: verifiedCount },
          ]}
        />
      </div>

      <div className="border-t border-line px-5 py-4">
        {tab === 'overview' && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoCard title="Personal details" icon={IdCard}>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                <Detail label="Full name" value={student.name} />
                <Detail label="Roll number" value={student.roll} mono />
                <Detail label="Department" value={`${student.dept} — ${dept.name}`} />
                <Detail label="Division" value={student.division} />
                <Detail label="Blood group" value={student.bloodGroup} />
                <Detail label="Residence" value={student.hosteller ? 'Hostel resident' : 'Day scholar'} />
                <Detail label="Address" value={student.address} className="col-span-2" />
              </dl>
            </InfoCard>
            <InfoCard title="Guardian & emergency contact" icon={Users}>
              <div className="flex items-center gap-2.5 rounded-lg border border-line bg-surface-low px-3 py-2.5">
                <Avatar name={student.guardianName} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-ink">{student.guardianName}</p>
                  <p className="text-[10.5px] text-muted">{student.guardianRelation} · Primary contact</p>
                </div>
                <Badge tone="success" className="ml-auto" icon={ShieldCheck}>
                  Verified
                </Badge>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5">
                <Detail label="Guardian mobile" value={student.guardianPhone} />
                <Detail label="Student mobile" value={student.phone} />
                <Detail label="Consent to contact" value="Granted (2026-07-14)" />
                <Detail label="Preferred language" value="Marathi / English" />
              </dl>
              <div className="mt-3 rounded-md border border-info/25 bg-info-soft px-2.5 py-2 text-[11px] leading-4 text-info">
                Guardian communication is restricted to attendance, fees and safety. Academic scores require student consent.
              </div>
            </InfoCard>
            <InfoCard title="Enrollment summary" icon={FileText} className="md:col-span-2">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { label: 'Programme', value: student.course.replace('B.Tech ', 'B.Tech · ') },
                  { label: 'Current semester', value: `Sem ${student.semester} · Odd` },
                  { label: 'Scholarship', value: student.scholarship ?? 'None' },
                  { label: 'NEP credits earned', value: `${64 + student.semester * 8} / 160` },
                ].map((x) => (
                  <div key={x.label} className="rounded-lg bg-surface-low px-2.5 py-2">
                    <p className="text-[9.5px] uppercase tracking-wide text-muted">{x.label}</p>
                    <p className="mt-0.5 truncate text-[12px] font-semibold text-ink" title={x.value}>
                      {x.value}
                    </p>
                  </div>
                ))}
              </div>
            </InfoCard>
          </div>
        )}

        {tab === 'academics' && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div className="md:col-span-2">
              <InfoCard title="Attendance" icon={CalendarClock}>
                <div className="flex flex-col items-center">
                  <RadialGauge
                    value={student.attendance}
                    size={124}
                    color={student.attendance < 75 ? 'rgb(var(--danger))' : 'rgb(var(--primary))'}
                    sublabel={student.attendance < 75 ? 'Below 75%' : 'Eligible'}
                    label="Attendance"
                  />
                  {student.attendance < 75 ? (
                    <p className="mt-2 flex items-center gap-1.5 rounded-md bg-danger-soft px-2 py-1 text-[11px] font-medium text-danger">
                      <TriangleAlert size={11} /> Detention risk — parent intimation pending
                    </p>
                  ) : (
                    <p className="mt-2 flex items-center gap-1.5 rounded-md bg-success-soft px-2 py-1 text-[11px] font-medium text-success">
                      <BadgeCheck size={11} /> Exam eligible
                    </p>
                  )}
                </div>
                <div className="mt-3 space-y-2">
                  {[
                    { label: 'Theory lectures attended', value: `${Math.round(student.attendance * 0.62)} / ${Math.round(student.attendance * 0.62 + 9)}` },
                    { label: 'Practical sessions', value: `${Math.round(student.attendance * 0.3)} / ${Math.round(student.attendance * 0.3 + 3)}` },
                    { label: 'Medical leaves approved', value: '2 days' },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center justify-between border-b border-line/70 pb-1.5 text-[11.5px]">
                      <span className="text-muted">{r.label}</span>
                      <span className="font-mono tabular-nums text-ink">{r.value}</span>
                    </div>
                  ))}
                </div>
              </InfoCard>
            </div>
            <div className="md:col-span-3">
              <InfoCard title="Semester performance" icon={GraduationCap}>
                <div className="mb-3 grid grid-cols-3 gap-2">
                  {[
                    { label: 'Current CGPA', value: student.cgpa.toFixed(2) },
                    { label: 'SGPA (last)', value: Math.min(10, student.cgpa + 0.18).toFixed(2) },
                    { label: 'Backlogs', value: student.cgpa < 6.5 ? '1' : '0' },
                  ].map((x) => (
                    <div key={x.label} className="rounded-lg border border-line bg-surface-low px-2.5 py-2 text-center">
                      <p className="font-display text-[16px] font-bold tabular-nums text-ink">{x.value}</p>
                      <p className="text-[9.5px] text-muted">{x.label}</p>
                    </div>
                  ))}
                </div>
                <SubjectRow name="Operating Systems" code="CS401" marks={78} credits={4} />
                <SubjectRow name="Database Systems" code="CS305" marks={84} credits={4} />
                <SubjectRow name="Computer Networks" code="IT402" marks={71} credits={3} />
                <SubjectRow name="Software Engineering" code="CS405" marks={88} credits={3} />
                <SubjectRow name="Web Technologies Lab" code="CS307" marks={92} credits={2} />
              </InfoCard>
            </div>
          </div>
        )}

        {tab === 'fees' && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoCard title="Fee ledger · AY 2026-27" icon={Wallet}>
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="font-display text-[22px] font-bold leading-none tabular-nums text-ink">{inr(student.feePaid)}</p>
                  <p className="mt-1 text-[10.5px] text-muted">paid of {inr(student.feeTotal)} annual demand</p>
                </div>
                <Badge tone={FEE_TONE[student.feeStatus]} dot>
                  {student.feeStatus}
                </Badge>
              </div>
              <Progress value={(student.feePaid / student.feeTotal) * 100} className="mt-2.5" height="h-2" tone={student.feeStatus === 'Overdue' ? 'rgb(var(--danger))' : 'rgb(var(--primary))'} />
              <div className="mt-3 space-y-1.5 text-[11.5px]">
                {[
                  { label: 'Tuition fee', value: Math.round(student.feeTotal * 0.76) },
                  { label: 'Development fee', value: Math.round(student.feeTotal * 0.12) },
                  { label: 'Exam & lab fee', value: Math.round(student.feeTotal * 0.07) },
                  { label: 'Caution deposit (one-time)', value: student.feeTotal - Math.round(student.feeTotal * 0.95) },
                ].map((x) => (
                  <div key={x.label} className="flex items-center justify-between border-b border-line/70 pb-1.5">
                    <span className="text-muted">{x.label}</span>
                    <span className="font-mono tabular-nums text-ink">{inr(x.value)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-1">
                  <span className="font-semibold text-ink">Outstanding</span>
                  <span className={cx('font-mono font-semibold tabular-nums', student.feePaid < student.feeTotal ? 'text-danger' : 'text-success')}>
                    {inr(Math.max(0, student.feeTotal - student.feePaid))}
                  </span>
                </div>
              </div>
              <div className="mt-3 rounded-md border border-line bg-surface-low px-2.5 py-2">
                <p className="text-[10px] uppercase tracking-wide text-muted">Scholarship</p>
                <p className="text-[12px] font-medium text-ink">{student.scholarship ?? 'No active scholarship'}</p>
                {student.scholarship && <p className="mt-0.5 text-[10.5px] text-muted">₹62,000 credited to fee head · nodal verified</p>}
              </div>
            </InfoCard>
            <InfoCard title="Documents & DigiLocker KYC" icon={Fingerprint}>
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-[11px] text-muted">{verifiedCount} of 5 verified</span>
                <Badge tone={verifiedCount === 5 ? 'success' : verifiedCount >= 3 ? 'warning' : 'danger'}>
                  {verifiedCount === 5 ? 'KYC complete' : 'Action needed'}
                </Badge>
              </div>
              <ul className="space-y-1.5">
                {docEntries.map((d) => {
                  const ok = student.docs[d.key];
                  return (
                    <li key={d.key} className="flex items-center justify-between rounded-md border border-line px-2.5 py-1.5">
                      <span className="flex items-center gap-1.5 text-[11.5px] text-ink">
                        {ok ? <ShieldCheck size={12} className="text-success" /> : <TriangleAlert size={12} className="text-warning" />}
                        {d.label}
                      </span>
                      <span className={cx('text-[10px] font-semibold', ok ? 'text-success' : 'text-warning')}>
                        {ok ? (d.key === 'digilocker' ? 'Linked' : 'Verified') : 'Pending'}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                onClick={() => pushToast({ title: 'DigiLocker verification requested', description: `Consent link sent to ${student.email}`, tone: 'info' })}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border border-primary/25 bg-primary-tint px-2.5 py-2 text-[11.5px] font-semibold text-primary-tint-fg transition-colors duration-120 hover:border-primary/40"
              >
                <FolderOpen size={13} /> Request missing documents via DigiLocker
              </button>
              <p className="mt-2 flex items-start gap-1.5 text-[10px] leading-4 text-muted">
                <Lock size={10} className="mt-0.5 shrink-0" />
                Documents are fetched through DigiLocker consent (MeitY). Vanguard never stores raw Aadhaar numbers.
              </p>
            </InfoCard>
          </div>
        )}
      </div>
    </Modal>
  );
}

function ProfileMeta({ icon: Icon, label, value, mono = true }: { icon: typeof Mail; label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1 text-[9.5px] uppercase tracking-wide text-muted">
        <Icon size={10} /> {label}
      </p>
      <p className={cx('truncate text-[11.5px] font-medium text-ink', mono && 'font-mono')} title={value}>
        {value}
      </p>
    </div>
  );
}

function InfoCard({ title, icon: Icon, children, className }: { title: string; icon: typeof Mail; children: React.ReactNode; className?: string }) {
  return (
    <section className={cx('rounded-lg border border-line bg-surface', className)}>
      <header className="flex items-center gap-1.5 border-b border-line px-3 py-2">
        <Icon size={12} className="text-muted" aria-hidden />
        <h3 className="text-[12px] font-semibold text-ink">{title}</h3>
      </header>
      <div className="p-3">{children}</div>
    </section>
  );
}

function Detail({ label, value, mono, className }: { label: string; value: string; mono?: boolean; className?: string }) {
  return (
    <div className={cx('min-w-0', className)}>
      <dt className="text-[9.5px] uppercase tracking-wide text-muted">{label}</dt>
      <dd className={cx('truncate text-[11.5px] text-ink', mono && 'mono')} title={value}>
        {value}
      </dd>
    </div>
  );
}

function SubjectRow({ name, code, marks, credits }: { name: string; code: string; marks: number; credits: number }) {
  const tone = marks >= 85 ? 'success' : marks >= 70 ? 'primary' : 'warning';
  return (
    <div className="flex items-center gap-2 border-b border-line/70 py-1.5 last:border-0">
      <span className="mono w-12 shrink-0 text-[10px] text-muted">{code}</span>
      <span className="min-w-0 flex-1 truncate text-[11.5px] text-ink">{name}</span>
      <span className="w-8 shrink-0 text-right font-mono text-[10px] text-muted">{credits} cr</span>
      <span className="w-14 shrink-0">
        <Progress value={marks} height="h-1" tone={tone === 'success' ? 'rgb(var(--success))' : tone === 'primary' ? 'rgb(var(--primary))' : 'rgb(var(--warning))'} />
      </span>
      <span className="w-9 shrink-0 text-right font-mono text-[11px] font-medium tabular-nums text-ink">{marks}</span>
    </div>
  );
}
