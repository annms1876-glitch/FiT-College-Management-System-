import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  Assignment,
  AuditEntry,
  Course,
  Exam,
  Faculty,
  FeeStructure,
  Grievance,
  GrievanceStatus,
  LibraryResource,
  Notice,
  Payment,
  ScholarshipApplication,
  ScholarshipStatus,
  Student,
  SupportTicket,
  Theme,
  TimetableCell,
  WorkflowRun,
  WorkflowStatus,
} from '../types';
import {
  ASSIGNMENTS,
  COURSES,
  EXAMS,
  NOTICES,
} from '../data/seed/academics';
import { FACULTY } from '../data/seed/faculty';
import { STUDENTS } from '../data/seed/students';
import {
  FEE_STRUCTURES,
  GRIEVANCES,
  LIBRARY_RESOURCES,
  PAYMENTS,
  SCHOLARSHIP_APPLICATIONS,
  SUPPORT_TICKETS,
} from '../data/seed/finance';
import { buildTimetable } from '../data/seed/timetable';
import { useLocalStorage } from '../lib/hooks';
import { draftWorkflow } from '../lib/workflow';
import { driver, resetAllCollections, useCollection, type Collection } from '../lib/baas';

/* -------------------------------------------------------------------------- */
/*  Toast system                                                              */
/* -------------------------------------------------------------------------- */
export type ToastTone = 'success' | 'error' | 'info' | 'warning';
export interface Toast {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
  duration?: number;
}

export interface WidgetPrefs {
  kpis: boolean;
  charts: boolean;
  feeds: boolean;
  quickActions: boolean;
}

interface AppState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;

  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;

  students: Student[];
  addStudent: (s: Omit<Student, 'id'>) => void;
  deleteStudent: (id: string) => void;

  faculty: Faculty[];
  addFaculty: (f: Omit<Faculty, 'id'>) => void;

  assignments: Assignment[];
  addAssignment: (a: Omit<Assignment, 'id'>) => void;

  timetable: TimetableCell[];
  setTimetable: (cells: TimetableCell[]) => void;
  publishedAt: string | null;
  publishTimetable: () => void;

  scholarships: ScholarshipApplication[];
  updateScholarship: (id: string, status: ScholarshipStatus) => void;

  feeStructures: FeeStructure[];
  addFeeStructure: (f: Omit<FeeStructure, 'id'>) => void;
  payments: Payment[];
  recordPayment: (p: Omit<Payment, 'id'>) => void;

  grievances: Grievance[];
  updateGrievance: (id: string, status: GrievanceStatus) => void;

  tickets: SupportTicket[];
  updateTicket: (id: string, status: SupportTicket['status']) => void;

  resources: LibraryResource[];
  addResource: (r: Omit<LibraryResource, 'id' | 'downloads'>) => void;
  trackDownload: (id: string) => void;

  exams: Exam[];
  publishResults: () => void;
  lastResultsPublish: string | null;

  notices: Notice[];
  addNotice: (n: Omit<Notice, 'id'>) => void;
  togglePin: (id: string) => void;
  deleteNotice: (id: string) => void;

  courses: Course[];
  addCourse: (c: Omit<Course, 'id'>) => void;

  workflows: WorkflowRun[];
  runWorkflow: (prompt: string) => WorkflowRun;
  decideWorkflow: (id: string, status: Exclude<WorkflowStatus, 'Awaiting Approval'>) => void;

  audit: AuditEntry[];
  logAudit: (entry: Omit<AuditEntry, 'id' | 'ts'>) => void;

  toasts: Toast[];
  pushToast: (t: Omit<Toast, 'id'> | string, tone?: ToastTone) => void;
  dismissToast: (id: string) => void;

  widgets: WidgetPrefs;
  setWidgets: (w: WidgetPrefs) => void;

  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;

  /** Clears the local BaaS cache and reloads with seed data. */
  resetDemo: () => Promise<void>;
  backendLabel: string;
}

const Ctx = createContext<AppState | null>(null);

const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

const SEED_WORKFLOW: WorkflowRun[] = [
  {
    id: 'WF-2026-1042',
    ts: '2026-11-23T09:42:00.000Z',
    prompt: 'Flag students with attendance below 75% in CSE and prepare guardian outreach list.',
    agents: ['Student Data', 'Academic', 'Notice'],
    title: 'Attendance <75% audit — CSE',
    summary:
      '42 CSE students are below the 75% threshold (avg 68.2%). Draft guardian outreach ready for counsellor dispatch.',
    previewHeaders: ['Student', 'Roll', 'Attendance', 'Guardian'],
    previewRows: [
      ['Riddhi Joshi', '2023CSEC087', '62.4%', 'Mahesh Joshi'],
      ['Neha Rane', '2023CSEC144', '66.1%', 'Sunita Rane'],
    ],
    scope: 'CSE · Sem 3–7',
    records: 42,
    status: 'Completed',
    decidedAt: '2026-11-23T09:46:00.000Z',
    decidedBy: 'Dr. Rajeshwar Rao',
  },
  {
    id: 'WF-2026-1041',
    ts: '2026-11-22T14:18:00.000Z',
    prompt: 'Summarise scholarship applications pending nodal verification for MahaDBT.',
    agents: ['Scholarship', 'Student Data'],
    title: 'MahaDBT nodal verification queue',
    summary: '88 applications awaiting nodal verification; 14 missing income certificates on DigiLocker.',
    previewHeaders: ['Scheme', 'Pending', 'Missing docs'],
    previewRows: [
      ['MahaDBT EBC 50%', '52', '9'],
      ['MahaDBT SC Freeship', '36', '5'],
    ],
    scope: 'All departments',
    records: 88,
    status: 'Rejected',
    decidedAt: '2026-11-22T15:02:00.000Z',
    decidedBy: 'Dr. Rajeshwar Rao',
  },
];

const SEED_AUDIT: AuditEntry[] = [
  { id: 'au-1', ts: '2026-11-23T09:46:12.000Z', actor: 'Dr. Rajeshwar Rao', action: 'Workflow approved', detail: 'WF-2026-1042 · Attendance <75% audit — CSE', badge: 'Approved' },
  { id: 'au-2', ts: '2026-11-23T09:46:12.000Z', actor: 'Orchestrator', action: 'Audit pack generated', detail: '42 guardian outreach letters staged in Outbox', badge: 'AI' },
  { id: 'au-3', ts: '2026-11-22T15:02:44.000Z', actor: 'Dr. Rajeshwar Rao', action: 'Workflow rejected', detail: 'WF-2026-1041 · MahaDBT nodal queue (resubmit after DigiLocker fix)', badge: 'Rejected' },
  { id: 'au-4', ts: '2026-11-22T11:30:05.000Z', actor: 'System', action: 'DigiLocker sync', detail: '1,284 Aadhaar/KYC records reconciled · 0 exceptions', badge: 'System' },
  { id: 'au-5', ts: '2026-11-21T17:04:19.000Z', actor: 'Aarti Kulkarni', action: 'Bonafide issued', detail: 'TKT-9021 · Meera Verma · 2024CVEB098' },
  { id: 'au-6', ts: '2026-11-21T10:12:31.000Z', actor: 'Dr. Rajeshwar Rao', action: 'Fee structure published', detail: 'AY 2026-27 · 24 program/quota combinations', badge: 'System' },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useLocalStorage<Theme>('vanguard-theme', 'light');
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage<boolean>('vanguard-sidebar', false);
  const [widgets, setWidgets] = useLocalStorage<WidgetPrefs>('vanguard-widgets', {
    kpis: true,
    charts: true,
    feeds: true,
    quickActions: true,
  });

  const [students, setStudents] = useCollection<Student>('students', STUDENTS);
  const [faculty, setFaculty] = useCollection<Faculty>('faculty', FACULTY);
  const [assignments, setAssignments] = useCollection<Assignment>('assignments', ASSIGNMENTS);
  const [timetable, setTimetable] = useState<TimetableCell[]>(() => buildTimetable('CSE-5'));
  const [publishedAt, setPublishedAt] = useState<string | null>('2026-11-18T10:30:00.000Z');
  const [scholarships, setScholarships] = useCollection<ScholarshipApplication>('scholarships', SCHOLARSHIP_APPLICATIONS);
  const [feeStructures, setFeeStructures] = useCollection<FeeStructure>('fee_structures', FEE_STRUCTURES);
  const [payments, setPayments] = useCollection<Payment>('payments', PAYMENTS);
  const [grievances, setGrievances] = useCollection<Grievance>('grievances', GRIEVANCES);
  const [tickets, setTickets] = useCollection<SupportTicket>('tickets', SUPPORT_TICKETS);
  const [resources, setResources] = useCollection<LibraryResource>('resources', LIBRARY_RESOURCES);
  const [exams, setExams] = useCollection<Exam>('exams', EXAMS);
  const [lastResultsPublish, setLastResultsPublish] = useState<string | null>(null);
  const [notices, setNotices] = useCollection<Notice>('notices', NOTICES);
  const [courses, setCourses] = useCollection<Course>('courses', COURSES);
  const [workflows, setWorkflows] = useCollection<WorkflowRun>('workflows', SEED_WORKFLOW);
  const workflowSeq = useRef(1042);
  const [audit, setAudit] = useState<AuditEntry[]>(SEED_AUDIT);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [commandOpen, setCommandOpen] = useState(false);
  const timers = useRef<Record<string, number>>({});

  /* Theme */
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
    root.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute('content', theme === 'dark' ? '#171717' : '#FFFFFF');
  }, [theme]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), [setThemeState]);
  const toggleTheme = useCallback(() => setThemeState((t) => (t === 'dark' ? 'light' : 'dark')), [setThemeState]);

  /* Toasts */
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      window.clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const pushToast = useCallback(
    (input: Omit<Toast, 'id'> | string, tone: ToastTone = 'success') => {
      const toast: Toast =
        typeof input === 'string' ? { id: uid('toast'), title: input, tone } : { id: uid('toast'), ...input };
      setToasts((prev) => [...prev.slice(-3), toast]);
      timers.current[toast.id] = window.setTimeout(() => dismissToast(toast.id), toast.duration ?? 4200);
    },
    [dismissToast],
  );

  const logAudit = useCallback((entry: Omit<AuditEntry, 'id' | 'ts'>) => {
    setAudit((prev) => [{ id: uid('au'), ts: new Date().toISOString(), ...entry }, ...prev].slice(0, 60));
  }, []);

  /* Students */
  const addStudent = useCallback(
    (s: Omit<Student, 'id'>) => {
      setStudents((prev) => [{ ...s, id: uid('stu') }, ...prev]);
      pushToast({ title: 'Student record created', description: `${s.name} · ${s.roll} added to ${s.dept}`, tone: 'success' });
      logAudit({ actor: 'Dr. Rajeshwar Rao', action: 'Student created', detail: `${s.name} · ${s.roll}` });
    },
    [pushToast, logAudit],
  );

  const deleteStudent = useCallback(
    (id: string) => {
      setStudents((prev) => {
        const target = prev.find((s) => s.id === id);
        if (target) {
          pushToast({ title: 'Student record archived', description: `${target.name} · ${target.roll}`, tone: 'warning' });
          logAudit({ actor: 'Dr. Rajeshwar Rao', action: 'Student archived', detail: `${target.name} · ${target.roll}` });
        }
        return prev.filter((s) => s.id !== id);
      });
    },
    [pushToast, logAudit],
  );

  /* Faculty */
  const addFaculty = useCallback(
    (f: Omit<Faculty, 'id'>) => {
      setFaculty((prev) => [{ ...f, id: `FAC-${1001 + prev.length}` }, ...prev]);
      pushToast({ title: 'Faculty added', description: `${f.name} · ${f.dept} department`, tone: 'success' });
      logAudit({ actor: 'Dr. Rajeshwar Rao', action: 'Faculty onboarded', detail: `${f.name} · ${f.designation}` });
    },
    [pushToast, logAudit],
  );

  /* Assignments */
  const addAssignment = useCallback(
    (a: Omit<Assignment, 'id'>) => {
      setAssignments((prev) => [{ ...a, id: uid('asg') }, ...prev]);
      pushToast({ title: 'Assignment published', description: `${a.title} · due ${a.due}`, tone: 'success' });
      logAudit({ actor: 'Dr. Rajeshwar Rao', action: 'Assignment created', detail: `${a.courseCode} · ${a.title}` });
    },
    [pushToast, logAudit],
  );

  /* Timetable */
  const publishTimetable = useCallback(() => {
    setPublishedAt(new Date().toISOString());
    pushToast({ title: 'Timetable published', description: 'Students & faculty notified via portal and email digest.', tone: 'success' });
    logAudit({ actor: 'Dr. Rajeshwar Rao', action: 'Timetable published', detail: 'CSE Sem 5 · Div A · 19 sessions' });
  }, [pushToast, logAudit]);

  /* Scholarships */
  const updateScholarship = useCallback(
    (id: string, status: ScholarshipStatus) => {
      setScholarships((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
      pushToast({
        title: 'Scholarship status updated',
        description: `${id} → ${status}${status === 'Approved' ? ' (nodal verification recorded)' : ''}`,
        tone: status === 'Approved' ? 'success' : 'info',
      });
      logAudit({ actor: 'Dr. Rajeshwar Rao', action: 'Scholarship updated', detail: `${id} → ${status}` });
    },
    [pushToast, logAudit],
  );

  /* Fees */
  const addFeeStructure = useCallback(
    (f: Omit<FeeStructure, 'id'>) => {
      setFeeStructures((prev) => [{ ...f, id: uid('fs') }, ...prev]);
      pushToast({ title: 'Fee structure added', description: `${f.program} · ${f.quota}`, tone: 'success' });
      logAudit({ actor: 'Dr. Rajeshwar Rao', action: 'Fee structure added', detail: `${f.program} · ${f.quota}` });
    },
    [pushToast, logAudit],
  );

  const recordPayment = useCallback(
    (p: Omit<Payment, 'id'>) => {
      setPayments((prev) => [{ ...p, id: uid('pay') }, ...prev]);
      setStudents((prev) =>
        prev.map((s) =>
          s.roll === p.roll
            ? {
                ...s,
                feePaid: Math.min(s.feeTotal, s.feePaid + p.amount),
                feeStatus: s.feePaid + p.amount >= s.feeTotal ? 'Paid' : 'Partial',
              }
            : s,
        ),
      );
      pushToast({ title: 'Payment recorded', description: `${p.receipt} · ${p.student} · ₹${p.amount.toLocaleString('en-IN')}`, tone: 'success' });
      logAudit({ actor: 'Accounts Section', action: 'Fee payment recorded', detail: `${p.receipt} · ${p.mode} · UTR ${p.utr}` });
    },
    [pushToast, logAudit],
  );

  /* Grievances */
  const updateGrievance = useCallback(
    (id: string, status: GrievanceStatus) => {
      setGrievances((prev) => prev.map((g) => (g.id === id ? { ...g, status } : g)));
      pushToast({ title: 'Grievance updated', description: `${id} → ${status}`, tone: 'info' });
      logAudit({ actor: 'Dr. Rajeshwar Rao', action: 'Grievance updated', detail: `${id} → ${status}` });
    },
    [pushToast, logAudit],
  );

  /* Support tickets */
  const updateTicket = useCallback(
    (id: string, status: SupportTicket['status']) => {
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
      pushToast({ title: 'Ticket updated', description: `${id} → ${status}`, tone: 'info' });
      logAudit({ actor: 'Support Staff', action: 'Ticket updated', detail: `${id} → ${status}` });
    },
    [pushToast, logAudit],
  );

  /* Library */
  const addResource = useCallback(
    (r: Omit<LibraryResource, 'id' | 'downloads'>) => {
      setResources((prev) => [{ ...r, id: uid('lib'), downloads: 0 }, ...prev]);
      pushToast({ title: 'Resource uploaded', description: `${r.title} · visible to ${r.dept} students`, tone: 'success' });
      logAudit({ actor: 'Dr. Rajeshwar Rao', action: 'Library resource uploaded', detail: r.title });
    },
    [pushToast, logAudit],
  );

  const trackDownload = useCallback((id: string) => {
    setResources((prev) => prev.map((r) => (r.id === id ? { ...r, downloads: r.downloads + 1 } : r)));
  }, []);

  /* Exams */
  const publishResults = useCallback(() => {
    setExams((prev) => prev.map((e) => ({ ...e, status: 'Marks Verified' })));
    setLastResultsPublish(new Date().toISOString());
    pushToast({ title: 'Results published', description: 'Examination Admin sign-off recorded · 28 papers live.', tone: 'success' });
    logAudit({ actor: 'Dr. Rajeshwar Rao', action: 'Results published', detail: '28 papers · Examination Admin sign-off', badge: 'Approved' });
  }, [pushToast, logAudit]);

  /* Notices */
  const addNotice = useCallback(
    (n: Omit<Notice, 'id'>) => {
      setNotices((prev) => [{ ...n, id: uid('nt') }, ...prev]);
      pushToast({ title: 'Notice published', description: `${n.title} · ${n.audience}`, tone: 'success' });
      logAudit({ actor: 'Dr. Rajeshwar Rao', action: 'Notice published', detail: `${n.category} · ${n.title}` });
    },
    [pushToast, logAudit],
  );

  const togglePin = useCallback((id: string) => {
    setNotices((prev) => prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));
  }, []);

  const deleteNotice = useCallback(
    (id: string) => {
      setNotices((prev) => {
        const target = prev.find((n) => n.id === id);
        if (target) {
          pushToast({ title: 'Notice withdrawn', description: target.title, tone: 'warning' });
          logAudit({ actor: 'Dr. Rajeshwar Rao', action: 'Notice withdrawn', detail: target.title });
        }
        return prev.filter((n) => n.id !== id);
      });
    },
    [pushToast, logAudit],
  );

  /* Courses */
  const addCourse = useCallback(
    (c: Omit<Course, 'id'>) => {
      setCourses((prev) => [{ ...c, id: uid('c') }, ...prev]);
      pushToast({ title: 'Course added', description: `${c.code} · ${c.title} (${c.credits} NEP credits)`, tone: 'success' });
      logAudit({ actor: 'Dr. Rajeshwar Rao', action: 'Course created', detail: `${c.code} · ${c.title}` });
    },
    [pushToast, logAudit],
  );

  /* Workflow */
  const runWorkflow = useCallback((prompt: string) => {
    workflowSeq.current += 1;
    const run = draftWorkflow(prompt, `WF-2026-${workflowSeq.current}`);
    setWorkflows((prev) => [run, ...prev]);
    return run;
  }, []);

  const resetDemo = useCallback(async () => {
    const collections: Collection[] = [
      'students', 'faculty', 'assignments', 'scholarships', 'fee_structures', 'payments',
      'grievances', 'tickets', 'resources', 'exams', 'notices', 'courses', 'workflows',
    ];
    await resetAllCollections(collections);
    window.location.reload();
  }, []);

  const decideWorkflow = useCallback(
    (id: string, status: Exclude<WorkflowStatus, 'Awaiting Approval'>) => {
      setWorkflows((prev) =>
        prev.map((w) =>
          w.id === id
            ? { ...w, status, decidedAt: new Date().toISOString(), decidedBy: 'Dr. Rajeshwar Rao' }
            : w,
        ),
      );
      const run = workflows.find((w) => w.id === id);
      pushToast(
        status === 'Completed'
          ? { title: 'Workflow approved & executed', description: `${id} · audit entry recorded`, tone: 'success' }
          : { title: 'Workflow rejected', description: `${id} · draft discarded, no records changed`, tone: 'warning' },
      );
      logAudit({
        actor: 'Dr. Rajeshwar Rao',
        action: status === 'Completed' ? 'Workflow approved' : 'Workflow rejected',
        detail: `${id}${run ? ` · ${run.title}` : ''}`,
        badge: status === 'Completed' ? 'Approved' : 'Rejected',
      });
    },
    [pushToast, logAudit, workflows],
  );

  const value = useMemo<AppState>(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      sidebarCollapsed,
      setSidebarCollapsed,
      students,
      addStudent,
      deleteStudent,
      faculty,
      addFaculty,
      assignments,
      addAssignment,
      timetable,
      setTimetable,
      publishedAt,
      publishTimetable,
      scholarships,
      updateScholarship,
      feeStructures,
      addFeeStructure,
      payments,
      recordPayment,
      grievances,
      updateGrievance,
      tickets,
      updateTicket,
      resources,
      addResource,
      trackDownload,
      exams,
      publishResults,
      lastResultsPublish,
      notices,
      addNotice,
      togglePin,
      deleteNotice,
      courses,
      addCourse,
      workflows,
      setWorkflows,
      runWorkflow,
      decideWorkflow,
      audit,
      logAudit,
      toasts,
      pushToast,
      dismissToast,
      widgets,
      setWidgets,
      commandOpen,
      setCommandOpen,
      resetDemo,
      backendLabel: driver.name,
    }),
    [
      theme, setTheme, toggleTheme, sidebarCollapsed, setSidebarCollapsed, students, addStudent, deleteStudent,
      faculty, addFaculty, assignments, addAssignment, timetable, publishedAt, publishTimetable, scholarships,
      updateScholarship, feeStructures, addFeeStructure, payments, recordPayment, grievances, updateGrievance,
      tickets, updateTicket, resources, addResource, trackDownload, exams, publishResults, lastResultsPublish,
      notices, addNotice, togglePin, deleteNotice, courses, addCourse, workflows, runWorkflow, decideWorkflow,
      audit, logAudit, toasts, pushToast, dismissToast, widgets, setWidgets, commandOpen, resetDemo,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
