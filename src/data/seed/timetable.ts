import type { TimetableCell } from '../../types';

export const SLOTS = [
  { id: 0, label: '08:30', end: '09:25' },
  { id: 1, label: '09:30', end: '10:25' },
  { id: 2, label: '10:30', end: '11:25' },
  { id: 3, label: '11:30', end: '12:25' },
  { id: 4, label: '13:30', end: '14:25' },
  { id: 5, label: '14:30', end: '15:25' },
  { id: 6, label: '15:30', end: '16:25' },
];

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const ROOMS = ['A-101', 'A-204', 'A-305', 'B-102', 'B-205', 'C-201', 'Lab-CV', 'Lab-Net'];

type CellSeed = Omit<TimetableCell, 'id'>;

// Two clashes are seeded deliberately so "Detect Conflicts" has something to show:
//   • Room A-204 double-booked Tuesday 11:30 (slot 3)
//   • Dr. Sunita Deshpande teaching SEM 5 & SEM 3 at the same hour Thursday 09:30 (slot 1)
const CSE_5: CellSeed[] = [
  { day: 0, slot: 0, subject: 'Operating Systems', code: 'CS401', faculty: 'Dr. Sunita Deshpande', room: 'A-204', division: 'Div A', kind: 'Lecture' },
  { day: 0, slot: 1, subject: 'Database Systems', code: 'CS305', faculty: 'Prof. Aniket Kulkarni', room: 'A-204', division: 'Div A', kind: 'Lecture' },
  { day: 0, slot: 2, subject: 'Compiler Design', code: 'CS306', faculty: 'Dr. Farida Merchant', room: 'A-204', division: 'Div A', kind: 'Lecture' },
  { day: 0, slot: 3, subject: 'Web Technologies', code: 'CS307', faculty: 'Prof. Tejas Bhide', room: 'Lab-CV', division: 'Div A', kind: 'Lab' },
  { day: 0, slot: 4, subject: 'Web Technologies', code: 'CS307', faculty: 'Prof. Tejas Bhide', room: 'Lab-CV', division: 'Div A', kind: 'Lab' },
  { day: 1, slot: 0, subject: 'Theory of Computation', code: 'CS801', faculty: 'Dr. Farida Merchant', room: 'A-305', division: 'Div A', kind: 'Lecture' },
  { day: 1, slot: 1, subject: 'Software Engineering', code: 'CS405', faculty: 'Prof. Tejas Bhide', room: 'A-204', division: 'Div A', kind: 'Lecture' },
  { day: 1, slot: 2, subject: 'Operating Systems', code: 'CS401', faculty: 'Dr. Sunita Deshpande', room: 'A-204', division: 'Div A', kind: 'Lecture' },
  { day: 1, slot: 3, subject: 'OS Lab', code: 'CS401', faculty: 'Dr. Sunita Deshpande', room: 'A-204', division: 'Div A', kind: 'Lab' },
  { day: 2, slot: 0, subject: 'Database Systems', code: 'CS305', faculty: 'Prof. Aniket Kulkarni', room: 'A-204', division: 'Div A', kind: 'Lecture' },
  { day: 2, slot: 1, subject: 'DBMS Tutorial', code: 'CS305', faculty: 'Prof. Aniket Kulkarni', room: 'B-102', division: 'Div A', kind: 'Tutorial' },
  { day: 2, slot: 2, subject: 'Compiler Design', code: 'CS306', faculty: 'Dr. Farida Merchant', room: 'A-204', division: 'Div A', kind: 'Lecture' },
  { day: 2, slot: 4, subject: 'Operating Systems', code: 'CS401', faculty: 'Dr. Sunita Deshpande', room: 'A-204', division: 'Div A', kind: 'Lecture' },
  { day: 3, slot: 0, subject: 'Software Engineering', code: 'CS405', faculty: 'Prof. Tejas Bhide', room: 'A-204', division: 'Div A', kind: 'Lecture' },
  { day: 3, slot: 1, subject: 'Database Systems', code: 'CS305', faculty: 'Prof. Aniket Kulkarni', room: 'A-204', division: 'Div A', kind: 'Lecture' },
  { day: 3, slot: 3, subject: 'Compiler Lab', code: 'CS306', faculty: 'Dr. Farida Merchant', room: 'Lab-CV', division: 'Div A', kind: 'Lab' },
  { day: 4, slot: 0, subject: 'Web Technologies', code: 'CS307', faculty: 'Prof. Tejas Bhide', room: 'Lab-CV', division: 'Div A', kind: 'Lab' },
  { day: 4, slot: 1, subject: 'Operating Systems', code: 'CS401', faculty: 'Dr. Sunita Deshpande', room: 'A-204', division: 'Div A', kind: 'Lecture' },
  { day: 4, slot: 2, subject: 'Seminar / Mentoring', code: 'CS-SEM', faculty: 'Dr. Sunita Deshpande', room: 'A-305', division: 'Div A', kind: 'Tutorial' },
];

const CSE_3: CellSeed[] = [
  { day: 0, slot: 0, subject: 'Data Structures', code: 'CS301', faculty: 'Prof. Tejas Bhide', room: 'A-101', division: 'Div B', kind: 'Lecture' },
  { day: 0, slot: 1, subject: 'Digital Logic', code: 'CS302', faculty: 'Dr. Farida Merchant', room: 'A-101', division: 'Div B', kind: 'Lecture' },
  { day: 0, slot: 3, subject: 'DS Lab', code: 'CS301', faculty: 'Prof. Tejas Bhide', room: 'Lab-CV', division: 'Div B', kind: 'Lab' },
  { day: 1, slot: 0, subject: 'Database Systems', code: 'CS305', faculty: 'Prof. Aniket Kulkarni', room: 'A-101', division: 'Div B', kind: 'Lecture' },
  { day: 1, slot: 1, subject: 'DS Lab', code: 'CS301', faculty: 'Prof. Tejas Bhide', room: 'A-101', division: 'Div B', kind: 'Lab' },
  { day: 2, slot: 2, subject: 'Operating Systems', code: 'CS401', faculty: 'Dr. Sunita Deshpande', room: 'A-101', division: 'Div B', kind: 'Lecture' },
  { day: 3, slot: 1, subject: 'Operating Systems', code: 'CS401', faculty: 'Dr. Sunita Deshpande', room: 'B-205', division: 'Div B', kind: 'Lecture' },
  { day: 3, slot: 2, subject: 'Digital Logic', code: 'CS302', faculty: 'Dr. Farida Merchant', room: 'A-101', division: 'Div B', kind: 'Lecture' },
  { day: 4, slot: 1, subject: 'Data Structures', code: 'CS301', faculty: 'Prof. Tejas Bhide', room: 'A-101', division: 'Div B', kind: 'Lecture' },
];

const CSE_7: CellSeed[] = [
  { day: 0, slot: 2, subject: 'Distributed Computing', code: 'CS702', faculty: 'Dr. Sunita Deshpande', room: 'B-205', division: 'Div C', kind: 'Lecture' },
  { day: 1, slot: 3, subject: 'Machine Learning', code: 'CS801', faculty: 'Prof. Aniket Kulkarni', room: 'B-205', division: 'Div C', kind: 'Lecture' },
  { day: 2, slot: 0, subject: 'Cloud Native Systems', code: 'CS703', faculty: 'Prof. Rohan Patil', room: 'B-205', division: 'Div C', kind: 'Lecture' },
  { day: 3, slot: 4, subject: 'Project Guidance', code: 'CS-PRJ', faculty: 'Dr. Sunita Deshpande', room: 'B-102', division: 'Div C', kind: 'Tutorial' },
];

const IT_5: CellSeed[] = [
  { day: 0, slot: 0, subject: 'Network Security', code: 'IT402', faculty: 'Dr. Meenakshi Iyer', room: 'B-102', division: 'Div A', kind: 'Lecture' },
  { day: 0, slot: 1, subject: 'Cloud Computing', code: 'IT503', faculty: 'Prof. Rohan Patil', room: 'B-102', division: 'Div A', kind: 'Lecture' },
  { day: 1, slot: 2, subject: 'Big Data', code: 'IT404', faculty: 'Dr. Anjali Kher', room: 'B-102', division: 'Div A', kind: 'Lecture' },
  { day: 1, slot: 4, subject: 'Security Lab', code: 'IT402', faculty: 'Dr. Meenakshi Iyer', room: 'Lab-Net', division: 'Div A', kind: 'Lab' },
  { day: 2, slot: 1, subject: 'Cloud Computing', code: 'IT503', faculty: 'Prof. Rohan Patil', room: 'A-305', division: 'Div A', kind: 'Lecture' },
  { day: 3, slot: 2, subject: 'Network Security', code: 'IT402', faculty: 'Dr. Meenakshi Iyer', room: 'B-102', division: 'Div A', kind: 'Lecture' },
];

const AIDS_5: CellSeed[] = [
  { day: 0, slot: 2, subject: 'Computer Vision', code: 'AI501', faculty: 'Dr. Kavita Bhosale', room: 'B-205', division: 'Div A', kind: 'Lecture' },
  { day: 0, slot: 3, subject: 'CV Lab', code: 'AI501', faculty: 'Dr. Kavita Bhosale', room: 'Lab-Net', division: 'Div A', kind: 'Lab' },
  { day: 1, slot: 0, subject: 'Probability & Statistics', code: 'AI302', faculty: 'Prof. Sameer Nair', room: 'B-205', division: 'Div A', kind: 'Lecture' },
  { day: 2, slot: 2, subject: 'MLOps', code: 'AI701', faculty: 'Dr. Kavita Bhosale', room: 'B-205', division: 'Div A', kind: 'Lecture' },
  { day: 4, slot: 0, subject: 'Reinforcement Learning', code: 'AI602', faculty: 'Prof. Prasad Datar', room: 'B-205', division: 'Div A', kind: 'Lecture' },
];

const ECE_5: CellSeed[] = [
  { day: 0, slot: 1, subject: 'Digital VLSI', code: 'EC402', faculty: 'Dr. Vivek Chavan', room: 'C-201', division: 'Div A', kind: 'Lecture' },
  { day: 0, slot: 4, subject: 'DSP', code: 'EC401', faculty: 'Dr. Smita Gokhale', room: 'C-201', division: 'Div A', kind: 'Lecture' },
  { day: 1, slot: 2, subject: 'VLSI Lab', code: 'EC402', faculty: 'Dr. Vivek Chavan', room: 'Lab-CV', division: 'Div A', kind: 'Lab' },
  { day: 2, slot: 3, subject: 'IoT Systems', code: 'EC505', faculty: 'Prof. Pallavi Gaikwad', room: 'C-201', division: 'Div A', kind: 'Lecture' },
  { day: 3, slot: 0, subject: 'RF Engineering', code: 'EC602', faculty: 'Dr. Vivek Chavan', room: 'C-201', division: 'Div A', kind: 'Lecture' },
  { day: 4, slot: 2, subject: 'DSP Tutorial', code: 'EC401', faculty: 'Dr. Smita Gokhale', room: 'B-102', division: 'Div A', kind: 'Tutorial' },
];

const MECH_5: CellSeed[] = [
  { day: 0, slot: 0, subject: 'Electric Vehicles', code: 'ME503', faculty: 'Prof. Rupali Kadam', room: 'A-305', division: 'Div A', kind: 'Lecture' },
  { day: 0, slot: 1, subject: 'Thermodynamics', code: 'ME302', faculty: 'Dr. Harish Jadhav', room: 'A-305', division: 'Div A', kind: 'Lecture' },
  { day: 1, slot: 3, subject: 'Robotics', code: 'ME404', faculty: 'Prof. Rupali Kadam', room: 'Lab-Net', division: 'Div A', kind: 'Lab' },
  { day: 2, slot: 1, subject: 'CAD/CAM', code: 'ME405', faculty: 'Prof. Jatin Shah', room: 'A-305', division: 'Div A', kind: 'Lab' },
  { day: 3, slot: 2, subject: 'Thermodynamics', code: 'ME302', faculty: 'Dr. Harish Jadhav', room: 'A-305', division: 'Div A', kind: 'Lecture' },
  { day: 4, slot: 0, subject: 'EV Powertrain Lab', code: 'ME503', faculty: 'Prof. Rupali Kadam', room: 'Lab-CV', division: 'Div A', kind: 'Lab' },
];

const CIVIL_5: CellSeed[] = [
  { day: 0, slot: 2, subject: 'RCC Structures', code: 'CE402', faculty: 'Dr. Ashwini Shinde', room: 'C-201', division: 'Div A', kind: 'Lecture' },
  { day: 1, slot: 0, subject: 'Surveying', code: 'CE305', faculty: 'Prof. Nikhil Joshi', room: 'A-101', division: 'Div A', kind: 'Lecture' },
  { day: 2, slot: 2, subject: 'GIS Applications', code: 'CE603', faculty: 'Prof. Nikhil Joshi', room: 'Lab-Net', division: 'Div A', kind: 'Lab' },
  { day: 3, slot: 3, subject: 'RCC Structures', code: 'CE402', faculty: 'Dr. Ashwini Shinde', room: 'C-201', division: 'Div A', kind: 'Lecture' },
  { day: 4, slot: 1, subject: 'Earthquake Engg.', code: 'CE701', faculty: 'Dr. Ashwini Shinde', room: 'C-201', division: 'Div A', kind: 'Lecture' },
];

export const BASE_TIMETABLE: Record<string, CellSeed[]> = {
  'CSE-5': CSE_5,
  'CSE-3': CSE_3,
  'CSE-7': CSE_7,
  'IT-5': IT_5,
  'AIDS-5': AIDS_5,
  'ECE-5': ECE_5,
  'MECH-5': MECH_5,
  'CIVIL-5': CIVIL_5,
};

export const TIMETABLE_KEYS = Object.keys(BASE_TIMETABLE);

export const toCell = (seed: CellSeed, key: string, index: number): TimetableCell => ({
  ...seed,
  id: `${key}-${index}-${seed.day}-${seed.slot}`,
});

export function buildTimetable(key: string): TimetableCell[] {
  return (BASE_TIMETABLE[key] ?? []).map((seed, i) => toCell(seed, key, i));
}

export const CONFLICT_NOTES = [
  { id: 'cf-1', severity: 'error' as const, title: 'Room A-204 double-booked · Tue 11:30 AM', detail: 'CSE SEM 5 (OS Lab) and ECE SEM 5 (VLSI Lab) both claim A-204 for slot 4 on Tuesday.' },
  { id: 'cf-2', severity: 'error' as const, title: 'Faculty clash · Prof. Tejas Bhide · Mon 08:30 AM', detail: 'Scheduled for CSE SEM 5 (Web Tech Lab) and CSE SEM 3 (Data Structures) simultaneously.' },
];
