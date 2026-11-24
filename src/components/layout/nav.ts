import {
  Award,
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileCheck2,
  GraduationCap,
  Headphones,
  LayoutDashboard,
  Library,
  Megaphone,
  ShieldAlert,
  Sparkles,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { NavKey } from '../../types';

export interface NavLink {
  key: NavKey;
  label: string;
  path: string;
  icon: LucideIcon;
  group: 'primary' | 'ai' | 'account';
  title: string;
  kicker: string;
}

export const NAV_LINKS: NavLink[] = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, group: 'primary', title: 'Administration', kicker: 'Institute command centre' },
  { key: 'students', label: 'Student Records', path: '/students', icon: Users, group: 'primary', title: 'Student Records', kicker: '4,820 enrolled · 186 below 75% attendance' },
  { key: 'faculty', label: 'Faculty Management', path: '/faculty', icon: GraduationCap, group: 'primary', title: 'Faculty Management', kicker: '284 faculty across 9 departments' },
  { key: 'timetable', label: 'Timetable Management', path: '/timetable', icon: CalendarDays, group: 'primary', title: 'Timetable Management', kicker: 'Odd semester · 8 divisions published' },
  { key: 'assignments', label: 'Assignment Management', path: '/assignments', icon: ClipboardList, group: 'primary', title: 'Assignment Management', kicker: '318 active · 87.2% submission rate' },
  { key: 'scholarships', label: 'Scholarship Tracker', path: '/scholarships', icon: Award, group: 'primary', title: 'Scholarship Tracker', kicker: 'NSP, MahaDBT & institutional schemes' },
  { key: 'fees', label: 'Fees & Submissions', path: '/fees', icon: Wallet, group: 'primary', title: 'Fees & Submissions', kicker: 'AY 2026-27 · ₹15.18 Cr collected YTD' },
  { key: 'grievances', label: 'Grievance Management', path: '/grievances', icon: ShieldAlert, group: 'primary', title: 'Grievance Management', kicker: '19 open · 91% SLA met' },
  { key: 'support', label: 'Student Support', path: '/support', icon: Headphones, group: 'primary', title: 'Student Support', kicker: 'Helpdesk · 2.4 h average response' },
  { key: 'library', label: 'E-Library', path: '/library', icon: Library, group: 'primary', title: 'E-Library', kicker: '22 digital resources · IEEE Xplore' },
  { key: 'examinations', label: 'Examination Management', path: '/examinations', icon: FileCheck2, group: 'primary', title: 'Examination Management', kicker: 'Audit protected · 28 papers' },
  { key: 'notices', label: 'Notices & Announcements', path: '/notices', icon: Megaphone, group: 'primary', title: 'Notices & Announcements', kicker: '9 notices · 3 pinned' },
  { key: 'courses', label: 'Course Information', path: '/courses', icon: BookOpen, group: 'primary', title: 'Course Information', kicker: '142 NEP-2020 aligned courses' },
  { key: 'workflow', label: 'Agentic Workflow', path: '/workflow', icon: Sparkles, group: 'ai', title: 'Agentic Workflow', kicker: 'AI orchestrator · human-in-the-loop' },
  { key: 'settings', label: 'Admin Settings', path: '/settings', icon: ShieldAlert, group: 'account', title: 'Admin Settings & Security', kicker: 'Profile, RBAC & appearance' },
];

export const PRIMARY_NAV = NAV_LINKS.filter((l) => l.group === 'primary');
export const AI_NAV = NAV_LINKS.find((l) => l.key === 'workflow')!;

export const findLink = (key: NavKey) => NAV_LINKS.find((l) => l.key === key);
