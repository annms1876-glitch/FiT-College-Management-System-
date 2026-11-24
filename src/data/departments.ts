import type { Department } from '../types';

export const AY = 'AY 2026-27';

export const DEPARTMENTS: Department[] = [
  { code: 'CSE', name: 'Computer Engineering', short: 'Computer', students: 980, faculty: 54, courses: 24, tone: '#4F46E5' },
  { code: 'IT', name: 'Information Technology', short: 'IT', students: 640, faculty: 38, courses: 19, tone: '#0EA5E9' },
  { code: 'AIDS', name: 'AI & Data Science', short: 'AI & DS', students: 520, faculty: 32, courses: 18, tone: '#8B5CF6' },
  { code: 'ECE', name: 'Electronics & Telecom', short: 'E&TC', students: 610, faculty: 40, courses: 21, tone: '#0D9488' },
  { code: 'MECH', name: 'Mechanical Engineering', short: 'Mechanical', students: 580, faculty: 36, courses: 20, tone: '#C2410C' },
  { code: 'CIVIL', name: 'Civil Engineering', short: 'Civil', students: 430, faculty: 28, courses: 16, tone: '#65A30D' },
  { code: 'MBA', name: 'Business Administration', short: 'MBA', students: 420, faculty: 24, courses: 12, tone: '#BE185D' },
  { code: 'BBA', name: 'BBA (Autonomous)', short: 'BBA', students: 360, faculty: 20, courses: 10, tone: '#7C3AED' },
  { code: 'AS', name: 'Applied Sciences (FY)', short: 'First Year', students: 280, faculty: 12, courses: 2, tone: '#475569' },
];

export const DEPT_MAP = Object.fromEntries(DEPARTMENTS.map((d) => [d.code, d])) as Record<
  Department['code'],
  Department
>;

export const PROGRAM_BY_DEPT: Record<string, string> = {
  CSE: 'B.Tech · Computer Engineering',
  IT: 'B.Tech · Information Technology',
  AIDS: 'B.Tech · AI & Data Science',
  ECE: 'B.Tech · Electronics & Telecom',
  MECH: 'B.Tech · Mechanical Engineering',
  CIVIL: 'B.Tech · Civil Engineering',
  MBA: 'MBA · Business Administration',
  BBA: 'BBA · Autonomous',
  AS: 'B.Tech · First Year (Applied Sciences)',
};

export const QUOTAS = [
  'General / Open',
  'OBC / EBC 50% Tuition Waiver',
  'SC / ST Govt. Freeship',
] as const;
