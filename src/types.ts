export type Theme = 'light' | 'dark';

export type DeptCode =
  | 'CSE'
  | 'IT'
  | 'AIDS'
  | 'ECE'
  | 'MECH'
  | 'CIVIL'
  | 'MBA'
  | 'BBA'
  | 'AS';

export interface Department {
  code: DeptCode;
  name: string;
  short: string;
  students: number;
  faculty: number;
  courses: number;
  tone: string;
}

export type FeeStatus = 'Paid' | 'Partial' | 'Overdue';

export interface StudentDocs {
  digilocker: boolean;
  aadhaar: boolean;
  income: boolean;
  caste: boolean;
  photo: boolean;
}

export interface Student {
  id: string;
  roll: string;
  name: string;
  email: string;
  phone: string;
  dept: DeptCode;
  course: string;
  semester: number;
  division: string;
  attendance: number;
  feeStatus: FeeStatus;
  cgpa: number;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  address: string;
  admissionYear: number;
  scholarship: string | null;
  docs: StudentDocs;
  feePaid: number;
  feeTotal: number;
  bloodGroup: string;
  hosteller: boolean;
}

export type AttendanceState = 'Present' | 'On Duty';

export interface Faculty {
  id: string;
  name: string;
  designation: string;
  dept: DeptCode;
  specialization: string;
  subjects: string[];
  weeklyLoad: number;
  attendance: AttendanceState;
  email: string;
  phone: string;
  joined: string;
}

export type AssignmentStatus = 'Due Soon' | 'Overdue' | 'Graded';

export interface Assignment {
  id: string;
  code: string;
  title: string;
  course: string;
  courseCode: string;
  dept: DeptCode;
  semester: number;
  faculty: string;
  assigned: string;
  due: string;
  submitted: number;
  total: number;
  status: AssignmentStatus;
}

export interface TimetableCell {
  id: string;
  day: number;
  slot: number;
  subject: string;
  code: string;
  faculty: string;
  room: string;
  division: string;
  kind: 'Lecture' | 'Lab' | 'Tutorial';
}

export type ExamStatus = 'Scheduled' | 'Marks Verified';

export interface Exam {
  id: string;
  code: string;
  subject: string;
  type: 'Theory' | 'Practical' | 'Viva' | 'Project';
  dept: DeptCode;
  semester: number;
  date: string;
  session: 'Morning' | 'Afternoon';
  hall: string;
  invigilator: string;
  status: ExamStatus;
}

export type ScholarshipStatus = 'Approved' | 'Pending' | 'Potential Match (Verify)' | 'Incomplete Docs';

export interface ScholarshipApplication {
  id: string;
  student: string;
  roll: string;
  scheme: string;
  category: string;
  amount: number;
  status: ScholarshipStatus;
  verifiedBy?: string;
}

export interface ScholarshipScheme {
  id: string;
  name: string;
  description: string;
  authority: string;
  applicants: number;
  approved: number;
  disbursed: number;
  accent: 'primary' | 'info' | 'success' | 'warning';
  icon: 'landmark' | 'building' | 'award' | 'sparkles';
}

export interface FeeStructure {
  id: string;
  program: string;
  dept: DeptCode;
  quota: 'General / Open' | 'OBC / EBC 50% Tuition Waiver' | 'SC / ST Govt. Freeship';
  tuition: number;
  devFee: number;
  examLab: number;
  caution: number;
  updated: string;
}

export type PaymentMode = 'UPI' | 'NEFT' | 'Card' | 'DD';

export interface Payment {
  id: string;
  receipt: string;
  utr: string;
  student: string;
  roll: string;
  dept: DeptCode;
  semester: number;
  amount: number;
  mode: PaymentMode;
  date: string;
  /** Receipt state against the student's annual demand. */
  state: FeeStatus;
  /** Bank/gateway settlement state. */
  settlement: 'Cleared' | 'Processing';
  bank: string;
}

export type GrievanceStatus = 'New' | 'In Review' | 'Escalated' | 'Resolved' | 'Closed';

export type GrievanceCategory =
  | 'Academic'
  | 'Examination'
  | 'Faculty Complaints'
  | 'Fees & Finance'
  | 'Hostel'
  | 'Infrastructure'
  | 'Harassment & Safety (Confidential)'
  | 'Other';

export interface Grievance {
  id: string;
  category: GrievanceCategory;
  subject: string;
  student: string;
  roll: string;
  dept: DeptCode;
  opened: string;
  daysOpen: number;
  status: GrievanceStatus;
  confidential: boolean;
  assignedTo: string;
  slaBreached: boolean;
  body: string;
}

export type TicketStatus = 'Ready' | 'In Review' | 'Assigned';

export interface SupportTicket {
  id: string;
  subject: string;
  requester: string;
  roll: string;
  type: 'Bonafide Certificate' | 'Transcript' | 'Fee Query' | 'Hostel NOC' | 'ID Card' | 'DigiLocker Help';
  dept: DeptCode;
  opened: string;
  status: TicketStatus;
  priority: 'High' | 'Medium' | 'Low';
  agent: string;
}

export interface LibraryResource {
  id: string;
  title: string;
  author: string;
  type: 'Digital Textbook' | 'Lecture Notes' | 'IEEE Journal';
  dept: DeptCode;
  semester: number | null;
  downloads: number;
  size: string;
  format: 'PDF' | 'EPUB';
  year: number;
  accent: string;
}

export type NoticeCategory =
  | 'Academic'
  | 'Examination'
  | 'Events'
  | 'Holidays'
  | 'Administration'
  | 'Emergency Announcements';

export interface Notice {
  id: string;
  title: string;
  body: string;
  category: NoticeCategory;
  audience: string;
  date: string;
  expiry: string;
  pinned: boolean;
  author: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  dept: DeptCode;
  duration: string;
  credits: number;
  enrolled: number;
  type: 'Core' | 'Elective' | 'Lab' | 'Seminar';
  semester: number;
  nepAligned: boolean;
}

export interface AuditEntry {
  id: string;
  ts: string;
  actor: string;
  action: string;
  detail: string;
  badge?: 'Approved' | 'Rejected' | 'AI' | 'System';
}

export type WorkflowStatus = 'Awaiting Approval' | 'Completed' | 'Rejected';

export interface WorkflowRun {
  id: string;
  ts: string;
  prompt: string;
  agents: string[];
  title: string;
  summary: string;
  previewHeaders: string[];
  previewRows: string[][];
  scope: string;
  records: number;
  status: WorkflowStatus;
  decidedAt?: string;
  decidedBy?: string;
}

export type NavKey =
  | 'dashboard'
  | 'students'
  | 'faculty'
  | 'timetable'
  | 'assignments'
  | 'scholarships'
  | 'fees'
  | 'grievances'
  | 'support'
  | 'library'
  | 'examinations'
  | 'notices'
  | 'courses'
  | 'workflow'
  | 'settings';
