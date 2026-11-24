import type { FeeStructure, Grievance, LibraryResource, Payment, ScholarshipApplication, ScholarshipScheme, SupportTicket } from '../../types';

/* ---------------------------------- Fees --------------------------------- */
export const FEE_STRUCTURES: FeeStructure[] = [
  { id: 'fs-1', program: 'B.Tech Computer Engineering', dept: 'CSE', quota: 'General / Open', tuition: 118000, devFee: 18500, examLab: 9000, caution: 5000, updated: '2026-06-12' },
  { id: 'fs-2', program: 'B.Tech Computer Engineering', dept: 'CSE', quota: 'OBC / EBC 50% Tuition Waiver', tuition: 59000, devFee: 18500, examLab: 9000, caution: 5000, updated: '2026-06-12' },
  { id: 'fs-3', program: 'B.Tech Computer Engineering', dept: 'CSE', quota: 'SC / ST Govt. Freeship', tuition: 0, devFee: 18500, examLab: 9000, caution: 5000, updated: '2026-06-12' },
  { id: 'fs-4', program: 'B.Tech Information Technology', dept: 'IT', quota: 'General / Open', tuition: 112000, devFee: 18000, examLab: 8500, caution: 5000, updated: '2026-06-12' },
  { id: 'fs-5', program: 'B.Tech Information Technology', dept: 'IT', quota: 'OBC / EBC 50% Tuition Waiver', tuition: 56000, devFee: 18000, examLab: 8500, caution: 5000, updated: '2026-06-12' },
  { id: 'fs-6', program: 'B.Tech Information Technology', dept: 'IT', quota: 'SC / ST Govt. Freeship', tuition: 0, devFee: 18000, examLab: 8500, caution: 5000, updated: '2026-06-12' },
  { id: 'fs-7', program: 'B.Tech AI & Data Science', dept: 'AIDS', quota: 'General / Open', tuition: 124000, devFee: 19500, examLab: 9500, caution: 5000, updated: '2026-06-12' },
  { id: 'fs-8', program: 'B.Tech AI & Data Science', dept: 'AIDS', quota: 'OBC / EBC 50% Tuition Waiver', tuition: 62000, devFee: 19500, examLab: 9500, caution: 5000, updated: '2026-06-12' },
  { id: 'fs-9', program: 'B.Tech AI & Data Science', dept: 'AIDS', quota: 'SC / ST Govt. Freeship', tuition: 0, devFee: 19500, examLab: 9500, caution: 5000, updated: '2026-06-12' },
  { id: 'fs-10', program: 'B.Tech Electronics & Telecom', dept: 'ECE', quota: 'General / Open', tuition: 108000, devFee: 17500, examLab: 10500, caution: 5000, updated: '2026-06-12' },
  { id: 'fs-11', program: 'B.Tech Electronics & Telecom', dept: 'ECE', quota: 'OBC / EBC 50% Tuition Waiver', tuition: 54000, devFee: 17500, examLab: 10500, caution: 5000, updated: '2026-06-12' },
  { id: 'fs-12', program: 'B.Tech Electronics & Telecom', dept: 'ECE', quota: 'SC / ST Govt. Freeship', tuition: 0, devFee: 17500, examLab: 10500, caution: 5000, updated: '2026-06-12' },
  { id: 'fs-13', program: 'B.Tech Mechanical Engineering', dept: 'MECH', quota: 'General / Open', tuition: 104000, devFee: 17000, examLab: 11500, caution: 5000, updated: '2026-06-12' },
  { id: 'fs-14', program: 'B.Tech Mechanical Engineering', dept: 'MECH', quota: 'OBC / EBC 50% Tuition Waiver', tuition: 52000, devFee: 17000, examLab: 11500, caution: 5000, updated: '2026-06-12' },
  { id: 'fs-15', program: 'B.Tech Mechanical Engineering', dept: 'MECH', quota: 'SC / ST Govt. Freeship', tuition: 0, devFee: 17000, examLab: 11500, caution: 5000, updated: '2026-06-12' },
  { id: 'fs-16', program: 'B.Tech Civil Engineering', dept: 'CIVIL', quota: 'General / Open', tuition: 98000, devFee: 16000, examLab: 8500, caution: 5000, updated: '2026-06-12' },
  { id: 'fs-17', program: 'B.Tech Civil Engineering', dept: 'CIVIL', quota: 'OBC / EBC 50% Tuition Waiver', tuition: 49000, devFee: 16000, examLab: 8500, caution: 5000, updated: '2026-06-12' },
  { id: 'fs-18', program: 'B.Tech Civil Engineering', dept: 'CIVIL', quota: 'SC / ST Govt. Freeship', tuition: 0, devFee: 16000, examLab: 8500, caution: 5000, updated: '2026-06-12' },
  { id: 'fs-19', program: 'MBA Business Administration', dept: 'MBA', quota: 'General / Open', tuition: 155000, devFee: 21000, examLab: 8500, caution: 5000, updated: '2026-06-12' },
  { id: 'fs-20', program: 'MBA Business Administration', dept: 'MBA', quota: 'OBC / EBC 50% Tuition Waiver', tuition: 77500, devFee: 21000, examLab: 8500, caution: 5000, updated: '2026-06-12' },
  { id: 'fs-21', program: 'MBA Business Administration', dept: 'MBA', quota: 'SC / ST Govt. Freeship', tuition: 0, devFee: 21000, examLab: 8500, caution: 5000, updated: '2026-06-12' },
  { id: 'fs-22', program: 'BBA (Autonomous)', dept: 'BBA', quota: 'General / Open', tuition: 82000, devFee: 14000, examLab: 7500, caution: 5000, updated: '2026-06-12' },
  { id: 'fs-23', program: 'BBA (Autonomous)', dept: 'BBA', quota: 'OBC / EBC 50% Tuition Waiver', tuition: 41000, devFee: 14000, examLab: 7500, caution: 5000, updated: '2026-06-12' },
  { id: 'fs-24', program: 'BBA (Autonomous)', dept: 'BBA', quota: 'SC / ST Govt. Freeship', tuition: 0, devFee: 14000, examLab: 7500, caution: 5000, updated: '2026-06-12' },
];

export const FEE_TOTALS = {
  demand: 18_42_00_000,
  collected: 15_18_00_000,
  pending: 3_24_00_000,
  waivers: 2_48_00_000,
  demandYoy: 8.4,
  collectedYoy: 11.2,
  pendingYoy: -6.1,
  waiversYoy: 14.8,
};

const UTR_BANK = ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Bank of Baroda', 'Axis Bank', 'Kotak Mahindra'];
const PAYER_NAMES = [
  ['Aarav Deshmukh', '2023CSEB104'],
  ['Ananya Patil', '2023AIB221'],
  ['Ishaan Kulkarni', '2023ITB310'],
  ['Diya Iyer', '2024ECEB012'],
  ['Vivaan Joshi', '2022MEBB447'],
  ['Saanvi Sharma', '2024CSEC119'],
  ['Aditya Gaikwad', '2023CVEB208'],
  ['Aadhya Nair', '2025BBAM033'],
  ['Arjun Bhosale', '2022CSEB722'],
  ['Myra Chavan', '2023ITB105'],
  ['Rohan Rao', '2024AIB044'],
  ['Anika Menon', '2023MBAM018'],
  ['Kabir Agarwal', '2022ECEB330'],
  ['Kiara Jadhav', '2024CSEC260'],
  ['Dhruv Mehta', '2023MEBB190'],
  ['Riya Pawar', '2024ITB077'],
  ['Aryan Kadam', '2022CSEB501'],
  ['Sara Bhat', '2025BBAM024'],
  ['Neel Shinde', '2023AIB172'],
  ['Meera Verma', '2024CVEB098'],
];

const DEPT_FOR_ROLL = (roll: string): Payment['dept'] => {
  const m = roll.match(/^\d{4}(CSE|AI|IT|ECE|MECH|CIVIL|MBA|BBA|FY)/);
  if (!m) return 'CSE';
  const map: Record<string, Payment['dept']> = { CSE: 'CSE', AI: 'AIDS', IT: 'IT', ECE: 'ECE', MECH: 'MECH', CIVIL: 'CIVIL', MBA: 'MBA', BBA: 'BBA', FY: 'AS' };
  return map[m[1]] ?? 'CSE';
};

export const PAYMENTS: Payment[] = PAYER_NAMES.map(([student, roll], i) => {
  const amountBase = [148500, 124000, 104000, 98500, 96500, 148500, 118000, 82000, 148500, 104000];
  const modes: Payment['mode'][] = ['UPI', 'NEFT', 'Card', 'DD'];
  const amount = amountBase[i % amountBase.length] - (i % 4 === 0 ? 0 : i % 3 === 0 ? 74000 : 0);
  const day = 4 + ((i * 3) % 19);
  return {
    id: `pay-${i + 1}`,
    receipt: `VIT/2026-27/${String(4821 + i * 7).padStart(5, '0')}`,
    utr: `UTR${String(202600000000 + i * 98432)}`,
    student,
    roll,
    dept: DEPT_FOR_ROLL(roll),
    semester: roll.startsWith('2025') ? 1 : roll.startsWith('2024') ? 3 : 5,
    amount,
    mode: modes[i % 4],
    date: `2026-11-${String(day).padStart(2, '0')}`,
    state: i % 11 === 10 ? 'Overdue' : amount >= 90000 ? 'Paid' : 'Partial',
    settlement: i % 9 === 8 ? 'Processing' : 'Cleared',
    bank: UTR_BANK[i % UTR_BANK.length],
  };
});

/* ------------------------------- Scholarship ------------------------------ */
export const SCHOLARSHIP_SCHEMES: ScholarshipScheme[] = [
  { id: 'sch-1', name: 'NSP Central Schemes', description: 'National Scholarship Portal — Post-Matric & Central Sector schemes', authority: 'Ministry of Education, GoI', applicants: 412, approved: 268, disbursed: 96_40_000, accent: 'primary', icon: 'landmark' },
  { id: 'sch-2', name: 'State Govt MahaDBT', description: 'Maharashtra Direct Benefit Transfer — EBC & Rajarshi Chhatrapati Shahu Maharaj', authority: 'Govt. of Maharashtra', applicants: 386, approved: 211, disbursed: 69_20_000, accent: 'info', icon: 'building' },
  { id: 'sch-3', name: 'Institutional Merit', description: 'Vanguard merit awards for top-10 rank holders per department', authority: 'Vanguard Institute Trust', applicants: 164, approved: 133, disbursed: 24_80_000, accent: 'success', icon: 'award' },
  { id: 'sch-4', name: 'Potential AI Matches', description: 'AI-flagged candidates pending Nodal Officer verification', authority: 'Awaiting nodal approval', applicants: 96, approved: 0, disbursed: 0, accent: 'warning', icon: 'sparkles' },
];

export const SCHOLARSHIP_STATS = { active: 612, disbursed: 2_48_00_000, pending: 88, aiMatches: 96 };

export const SCHOLARSHIP_APPLICATIONS: ScholarshipApplication[] = [
  { id: 'NSP/2026/10482', student: 'Aarav Deshmukh', roll: '2023CSEB104', scheme: 'NSP Central Schemes', category: 'SC · Post-Matric', amount: 48000, status: 'Approved', verifiedBy: 'Nodal Officer · MH-EDU-02' },
  { id: 'MDB/2026/22914', student: 'Ananya Patil', roll: '2023AIB221', scheme: 'State Govt MahaDBT', category: 'OBC · EBC 50%', amount: 62000, status: 'Approved', verifiedBy: 'Nodal Officer · MH-EDU-02' },
  { id: 'NSP/2026/10517', student: 'Ishaan Kulkarni', roll: '2023ITB310', scheme: 'NSP Central Schemes', category: 'General · Merit', amount: 30000, status: 'Pending' },
  { id: 'INST/2026/0088', student: 'Diya Iyer', roll: '2024ECEB012', scheme: 'Institutional Merit', category: 'Rank 3 · ECE', amount: 25000, status: 'Approved', verifiedBy: 'Registrar' },
  { id: 'MDB/2026/23017', student: 'Vivaan Joshi', roll: '2022MEBB447', scheme: 'State Govt MahaDBT', category: 'SC · Freeship', amount: 104000, status: 'Potential Match (Verify)' },
  { id: 'NSP/2026/10603', student: 'Saanvi Sharma', roll: '2024CSEC119', scheme: 'NSP Central Schemes', category: 'OBC · Post-Matric', amount: 45000, status: 'Incomplete Docs' },
  { id: 'INST/2026/0102', student: 'Aditya Gaikwad', roll: '2023CVEB208', scheme: 'Institutional Merit', category: 'Rank 7 · Civil', amount: 15000, status: 'Approved', verifiedBy: 'Registrar' },
  { id: 'MDB/2026/23124', student: 'Aadhya Nair', roll: '2025BBAM033', scheme: 'State Govt MahaDBT', category: 'OBC · EBC 50%', amount: 41000, status: 'Potential Match (Verify)' },
  { id: 'NSP/2026/10701', student: 'Arjun Bhosale', roll: '2022CSEB722', scheme: 'NSP Central Schemes', category: 'SC · Post-Matric', amount: 52000, status: 'Pending' },
  { id: 'NSP/2026/10734', student: 'Myra Chavan', roll: '2023ITB105', scheme: 'NSP Central Schemes', category: 'General · Central Sector', amount: 20000, status: 'Incomplete Docs' },
  { id: 'MDB/2026/23238', student: 'Rohan Rao', roll: '2024AIB044', scheme: 'State Govt MahaDBT', category: 'SC · Freeship', amount: 62000, status: 'Approved', verifiedBy: 'Nodal Officer · MH-EDU-02' },
  { id: 'INST/2026/0119', student: 'Anika Menon', roll: '2023MBAM018', scheme: 'Institutional Merit', category: 'Rank 1 · MBA', amount: 40000, status: 'Approved', verifiedBy: 'Registrar' },
  { id: 'MDB/2026/23341', student: 'Kabir Agarwal', roll: '2022ECEB330', scheme: 'State Govt MahaDBT', category: 'OBC · EBC 50%', amount: 54000, status: 'Potential Match (Verify)' },
  { id: 'NSP/2026/10852', student: 'Kiara Jadhav', roll: '2024CSEC260', scheme: 'NSP Central Schemes', category: 'SC · Post-Matric', amount: 48000, status: 'Pending' },
  { id: 'INST/2026/0126', student: 'Dhruv Mehta', roll: '2023MEBB190', scheme: 'Institutional Merit', category: 'Rank 5 · Mechanical', amount: 20000, status: 'Approved', verifiedBy: 'Registrar' },
  { id: 'MDB/2026/23402', student: 'Riya Pawar', roll: '2024ITB077', scheme: 'State Govt MahaDBT', category: 'SC · Freeship', amount: 56000, status: 'Potential Match (Verify)' },
  { id: 'NSP/2026/10918', student: 'Aryan Kadam', roll: '2022CSEB501', scheme: 'NSP Central Schemes', category: 'OBC · Post-Matric', amount: 42000, status: 'Incomplete Docs' },
  { id: 'INST/2026/0133', student: 'Sara Bhat', roll: '2025BBAM024', scheme: 'Institutional Merit', category: 'Rank 2 · BBA', amount: 18000, status: 'Pending' },
];

/* -------------------------------- Grievance ------------------------------- */
export const GRIEVANCES: Grievance[] = [
  { id: 'GRV-2026-0412', category: 'Examination', subject: 'Re-evaluation not reflected for DS&A (CS402)', student: 'Rohit Salunke', roll: '2022CSEB611', dept: 'CSE', opened: '2026-11-04', daysOpen: 20, status: 'Escalated', confidential: false, assignedTo: 'Examination Cell', slaBreached: true, body: 'Re-evaluation request RA-3321 was accepted on 28 Oct but the corrected marks are still not visible on the portal. Placement eligibility is at risk.' },
  { id: 'GRV-2026-0418', category: 'Harassment & Safety (Confidential)', subject: 'Hostel ragging complaint — Block C', student: 'Identity withheld', roll: '——', dept: 'AS', opened: '2026-11-09', daysOpen: 15, status: 'In Review', confidential: true, assignedTo: 'ICC Committee', slaBreached: true, body: 'Confidential complaint referred to the Internal Complaints Committee. Access restricted to ICC members and Super Administrator.' },
  { id: 'GRV-2026-0431', category: 'Fees & Finance', subject: 'Fee receipt not generated after NEFT payment', student: 'Pranav Kher', roll: '2023ITB208', dept: 'IT', opened: '2026-11-18', daysOpen: 6, status: 'In Review', confidential: false, assignedTo: 'Accounts Section', slaBreached: false, body: 'NEFT of ₹74,250 debited on 14 Nov from Bank of Baroda. UTR shared with accounts but receipt is pending.' },
  { id: 'GRV-2026-0437', category: 'Academic', subject: 'Semester change request from Div A to Div C', student: 'Tanvi Gokhale', roll: '2024AIB019', dept: 'AIDS', opened: '2026-11-20', daysOpen: 4, status: 'New', confidential: false, assignedTo: 'Academic Section', slaBreached: false, body: 'Batch clash with part-time internship. Requesting division change from A to C for Sem 3.' },
  { id: 'GRV-2026-0442', category: 'Hostel', subject: 'Wi-Fi outage in Boys Hostel Block D since 3 days', student: 'Siddhant More', roll: '2025FYB118', dept: 'AS', opened: '2026-11-17', daysOpen: 7, status: 'Escalated', confidential: false, assignedTo: 'Hostel Office', slaBreached: true, body: 'Complete network outage on floors 2–3 of Block D. Online classes affected.' },
  { id: 'GRV-2026-0445', category: 'Infrastructure', subject: 'Projector failure in CSE Seminar Hall', student: 'Neha Rane', roll: '2023CSEC144', dept: 'CSE', opened: '2026-11-21', daysOpen: 3, status: 'New', confidential: false, assignedTo: 'Facilities', slaBreached: false, body: 'Projector displays vertical banding. Scheduled guest lecture affected twice this week.' },
  { id: 'GRV-2026-0448', category: 'Faculty Complaints', subject: 'Lecture attendance not marked for ML Lab', student: 'Akash Pandey', roll: '2024AIB066', dept: 'AIDS', opened: '2026-11-15', daysOpen: 9, status: 'In Review', confidential: false, assignedTo: 'HOD · AI & DS', slaBreached: true, body: 'Attendance for AI Lab sessions (4, 11, 18 Nov) not updated. Affecting the 75% threshold.' },
  { id: 'GRV-2026-0452', category: 'Examination', subject: 'Hall ticket name spelling mismatch', student: 'Sneha Datar', roll: '2025FYB091', dept: 'AS', opened: '2026-11-22', daysOpen: 2, status: 'New', confidential: false, assignedTo: 'Examination Cell', slaBreached: false, body: 'Aadhaar name is "Sneha J. Datar" but hall ticket reads "Sneha Datar" — requires correction before 2 Dec.' },
  { id: 'GRV-2026-0455', category: 'Fees & Finance', subject: 'EBC 50% waiver not applied in sem fee', student: 'Kunal Sawant', roll: '2023MEBB231', dept: 'MECH', opened: '2026-11-19', daysOpen: 5, status: 'Resolved', confidential: false, assignedTo: 'Accounts Section', slaBreached: false, body: 'MahaDBT approval 2026 already granted but the portal is charging full tuition.' },
  { id: 'GRV-2026-0459', category: 'Other', subject: 'Transport bus route 14 timing change', student: 'Isha Pillai', roll: '2022CVEB303', dept: 'CIVIL', opened: '2026-11-12', daysOpen: 12, status: 'Resolved', confidential: false, assignedTo: 'Transport Office', slaBreached: false, body: 'Bus now arrives 20 minutes before the first period; request rescheduling.' },
  { id: 'GRV-2026-0461', category: 'Academic', subject: 'NEP elective allotment confirmation', student: 'Manav Shinde', roll: '2024ITB152', dept: 'IT', opened: '2026-11-23', daysOpen: 1, status: 'New', confidential: false, assignedTo: 'Academic Section', slaBreached: false, body: 'Need confirmation that the minor elective "Cyber Forensics" has been allotted for Sem 3.' },
  { id: 'GRV-2026-0464', category: 'Hostel', subject: 'Mess menu not adhering to approved cycle', student: 'Gauri Deshpande', roll: '2025BBAM017', dept: 'BBA', opened: '2026-11-08', daysOpen: 16, status: 'Closed', confidential: false, assignedTo: 'Hostel Office', slaBreached: false, body: 'Weekly menu deviates from the approved nutrition cycle; resolved after inspection.' },
  { id: 'GRV-2026-0467', category: 'Examination', subject: 'Re-exam clash with placement drive', student: 'Vikram Rao', roll: '2022ECEB120', dept: 'ECE', opened: '2026-11-10', daysOpen: 14, status: 'Escalated', confidential: false, assignedTo: 'Controller of Exams', slaBreached: true, body: 'Backlog exam for EC303 clashes with the Persistent drive on 29 Nov.' },
  { id: 'GRV-2026-0470', category: 'Faculty Complaints', subject: 'Unannounced internal test during lab slot', student: 'Riddhi Joshi', roll: '2023CSEC087', dept: 'CSE', opened: '2026-11-20', daysOpen: 4, status: 'In Review', confidential: false, assignedTo: 'HOD · CSE', slaBreached: false, body: 'Internal assessment conducted without schedule notice; students with certifications absent.' },
];

export const GRIEVANCE_STATS = { open: 19, escalated: 4, slaMet: 91, avgResolution: 4.2 };

export const GRIEVANCE_CATEGORIES_LIST = [
  'Academic',
  'Examination',
  'Faculty Complaints',
  'Fees & Finance',
  'Hostel',
  'Infrastructure',
  'Harassment & Safety (Confidential)',
  'Other',
] as const;

/* --------------------------------- Support -------------------------------- */
export const SUPPORT_TICKETS: SupportTicket[] = [
  { id: 'TKT-9021', subject: 'Bonafide certificate for passport application', requester: 'Meera Verma', roll: '2024CVEB098', type: 'Bonafide Certificate', dept: 'CIVIL', opened: '2026-11-22', status: 'Ready', priority: 'High', agent: 'Aarti Kulkarni' },
  { id: 'TKT-9024', subject: 'Consolidated transcript for MS application', requester: 'Aryan Kadam', roll: '2022CSEB501', type: 'Transcript', dept: 'CSE', opened: '2026-11-21', status: 'In Review', priority: 'High', agent: 'Aarti Kulkarni' },
  { id: 'TKT-9027', subject: 'UPI payment debited but ledger not updated', requester: 'Pranav Kher', roll: '2023ITB208', type: 'Fee Query', dept: 'IT', opened: '2026-11-20', status: 'Assigned', priority: 'High', agent: 'Accounts Desk' },
  { id: 'TKT-9031', subject: 'Hostel NOC for off-campus internship', requester: 'Siddhant More', roll: '2025FYB118', type: 'Hostel NOC', dept: 'AS', opened: '2026-11-19', status: 'Ready', priority: 'Medium', agent: 'Hostel Office' },
  { id: 'TKT-9034', subject: 'Duplicate ID card after loss in transit', requester: 'Ananya Patil', roll: '2023AIB221', type: 'ID Card', dept: 'AIDS', opened: '2026-11-18', status: 'Ready', priority: 'Medium', agent: 'Front Desk' },
  { id: 'TKT-9038', subject: 'DigiLocker caste certificate fetch failing', requester: 'Saanvi Sharma', roll: '2024CSEC119', type: 'DigiLocker Help', dept: 'CSE', opened: '2026-11-18', status: 'In Review', priority: 'Medium', agent: 'Scholarship Cell' },
  { id: 'TKT-9041', subject: 'Semester fee split request — 3 instalments', requester: 'Aadhya Nair', roll: '2025BBAM033', type: 'Fee Query', dept: 'BBA', opened: '2026-11-17', status: 'Assigned', priority: 'Medium', agent: 'Accounts Desk' },
  { id: 'TKT-9044', subject: 'Bonafide for education loan from SBI', requester: 'Dhruv Mehta', roll: '2023MEBB190', type: 'Bonafide Certificate', dept: 'MECH', opened: '2026-11-16', status: 'Ready', priority: 'High', agent: 'Aarti Kulkarni' },
  { id: 'TKT-9047', subject: 'Transcript apostille guidance for Germany', requester: 'Kiara Jadhav', roll: '2024CSEC260', type: 'Transcript', dept: 'CSE', opened: '2026-11-15', status: 'In Review', priority: 'Medium', agent: 'Registrar Office' },
  { id: 'TKT-9051', subject: 'Roll number correction in portal', requester: 'Neel Shinde', roll: '2023AIB172', type: 'ID Card', dept: 'AIDS', opened: '2026-11-14', status: 'Ready', priority: 'Low', agent: 'Front Desk' },
  { id: 'TKT-9054', subject: 'Hostel NOC for examination leave', requester: 'Riya Pawar', roll: '2024ITB077', type: 'Hostel NOC', dept: 'IT', opened: '2026-11-13', status: 'Assigned', priority: 'Low', agent: 'Hostel Office' },
  { id: 'TKT-9057', subject: 'Fee receipt duplicate for LIC reimbursement', requester: 'Sara Bhat', roll: '2025BBAM024', type: 'Fee Query', dept: 'BBA', opened: '2026-11-12', status: 'Ready', priority: 'Medium', agent: 'Accounts Desk' },
  { id: 'TKT-9060', subject: 'DigiLocker linking help — first year', requester: 'Omkar Salunke', roll: '2025FYB133', type: 'DigiLocker Help', dept: 'AS', opened: '2026-11-11', status: 'Ready', priority: 'Low', agent: 'Helpdesk' },
];

export const SUPPORT_STATS = { open: 42, certificates: 17, feeQueries: 11, avgResponse: '2.4 hrs' };

/* -------------------------------- E-Library ------------------------------- */
export const LIBRARY_RESOURCES: LibraryResource[] = [
  { id: 'lib-1', title: 'Operating System Concepts (10th Ed.)', author: 'Silberschatz, Galvin & Gagne', type: 'Digital Textbook', dept: 'CSE', semester: 5, downloads: 1842, size: '18.4 MB', format: 'PDF', year: 2024, accent: '#4F46E5' },
  { id: 'lib-2', title: 'Database System Concepts (7th Ed.)', author: 'Silberschatz, Korth & Sudarshan', type: 'Digital Textbook', dept: 'CSE', semester: 3, downloads: 1654, size: '22.1 MB', format: 'PDF', year: 2023, accent: '#0EA5E9' },
  { id: 'lib-3', title: 'Deep Learning — NEP Module Notes', author: 'Dr. Aniket Kulkarni', type: 'Lecture Notes', dept: 'CSE', semester: 8, downloads: 962, size: '6.2 MB', format: 'PDF', year: 2026, accent: '#8B5CF6' },
  { id: 'lib-4', title: 'Computer Networking: A Top-Down Approach', author: 'Kurose & Ross', type: 'Digital Textbook', dept: 'IT', semester: 5, downloads: 1428, size: '27.6 MB', format: 'PDF', year: 2024, accent: '#0D9488' },
  { id: 'lib-5', title: 'Cloud Native Patterns — Lecture Compilation', author: 'Prof. Rohan Patil', type: 'Lecture Notes', dept: 'IT', semester: 5, downloads: 684, size: '4.9 MB', format: 'PDF', year: 2026, accent: '#4F46E5' },
  { id: 'lib-6', title: 'Pattern Recognition & Machine Learning', author: 'Bishop', type: 'Digital Textbook', dept: 'AIDS', semester: 5, downloads: 1102, size: '19.8 MB', format: 'EPUB', year: 2023, accent: '#BE185D' },
  { id: 'lib-7', title: 'Computer Vision: Algorithms & Applications', author: 'Szeliski', type: 'Digital Textbook', dept: 'AIDS', semester: 5, downloads: 886, size: '31.2 MB', format: 'PDF', year: 2022, accent: '#8B5CF6' },
  { id: 'lib-8', title: 'IEEE Trans. on Neural Networks & Learning', author: 'IEEE Xplore · Vol 37', type: 'IEEE Journal', dept: 'AIDS', semester: null, downloads: 412, size: '8.7 MB', format: 'PDF', year: 2026, accent: '#1D4ED8' },
  { id: 'lib-9', title: 'Digital VLSI Design — Lab Handbook', author: 'Dr. Vivek Chavan', type: 'Lecture Notes', dept: 'ECE', semester: 5, downloads: 748, size: '3.1 MB', format: 'PDF', year: 2026, accent: '#0D9488' },
  { id: 'lib-10', title: 'Microelectronic Circuits (8th Ed.)', author: 'Sedra & Smith', type: 'Digital Textbook', dept: 'ECE', semester: 3, downloads: 1320, size: '24.5 MB', format: 'PDF', year: 2021, accent: '#0EA5E9' },
  { id: 'lib-11', title: 'IEEE Journal of Solid-State Circuits', author: 'IEEE Xplore · Vol 61', type: 'IEEE Journal', dept: 'ECE', semester: null, downloads: 296, size: '11.3 MB', format: 'PDF', year: 2026, accent: '#1D4ED8' },
  { id: 'lib-12', title: 'Engineering Thermodynamics Notes', author: 'Dr. Harish Jadhav', type: 'Lecture Notes', dept: 'MECH', semester: 3, downloads: 918, size: '5.6 MB', format: 'PDF', year: 2026, accent: '#C2410C' },
  { id: 'lib-13', title: 'Shigley’s Mechanical Engineering Design', author: 'Budynas & Nisbett', type: 'Digital Textbook', dept: 'MECH', semester: 5, downloads: 1046, size: '29.4 MB', format: 'PDF', year: 2020, accent: '#B45309' },
  { id: 'lib-14', title: 'RCC Structures — IS 456 Workbook', author: 'Dr. Ashwini Shinde', type: 'Lecture Notes', dept: 'CIVIL', semester: 5, downloads: 612, size: '4.4 MB', format: 'PDF', year: 2026, accent: '#65A30D' },
  { id: 'lib-15', title: 'Structural Analysis (9th Ed.)', author: 'Hibbeler', type: 'Digital Textbook', dept: 'CIVIL', semester: 5, downloads: 724, size: '26.8 MB', format: 'PDF', year: 2022, accent: '#65A30D' },
  { id: 'lib-16', title: 'Strategic Management: Concepts & Cases', author: 'Fred R. David', type: 'Digital Textbook', dept: 'MBA', semester: 3, downloads: 856, size: '16.9 MB', format: 'EPUB', year: 2023, accent: '#BE185D' },
  { id: 'lib-17', title: 'FinTech Casebook — Indian Markets', author: 'Prof. Arvind Rathod', type: 'Lecture Notes', dept: 'MBA', semester: 3, downloads: 574, size: '7.8 MB', format: 'PDF', year: 2026, accent: '#7C3AED' },
  { id: 'lib-18', title: 'IEEE Internet of Things Journal', author: 'IEEE Xplore · Vol 13', type: 'IEEE Journal', dept: 'IT', semester: null, downloads: 338, size: '9.5 MB', format: 'PDF', year: 2026, accent: '#1D4ED8' },
  { id: 'lib-19', title: 'Marketing Management (16th Ed.)', author: 'Kotler & Keller', type: 'Digital Textbook', dept: 'BBA', semester: 3, downloads: 1088, size: '23.2 MB', format: 'PDF', year: 2022, accent: '#C2410C' },
  { id: 'lib-20', title: 'Engineering Mathematics — Solved Papers', author: 'Dr. Vidya Sane', type: 'Lecture Notes', dept: 'AS', semester: 1, downloads: 2014, size: '8.8 MB', format: 'PDF', year: 2026, accent: '#475569' },
  { id: 'lib-21', title: 'Engineering Physics Lab Manual', author: 'Prof. Makarand Apte', type: 'Lecture Notes', dept: 'AS', semester: 1, downloads: 1722, size: '6.4 MB', format: 'PDF', year: 2026, accent: '#475569' },
  { id: 'lib-22', title: 'IEEE Access — Edge AI Special Issue', author: 'IEEE Xplore · Vol 14', type: 'IEEE Journal', dept: 'CSE', semester: null, downloads: 486, size: '12.1 MB', format: 'PDF', year: 2026, accent: '#1D4ED8' },
];
