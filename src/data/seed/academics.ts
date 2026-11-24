import type { Assignment, AssignmentStatus, Course, Exam, Notice, NoticeCategory } from '../../types';

export const ASSIGNMENTS: Assignment[] = [
  { id: 'asg-1', code: 'A-2026-318', title: 'OS Scheduling Simulator', course: 'Operating Systems', courseCode: 'CS401', dept: 'CSE', semester: 5, faculty: 'Dr. Sunita Deshpande', assigned: '2026-11-10', due: '2026-11-27', submitted: 48, total: 62, status: 'Due Soon' },
  { id: 'asg-2', code: 'A-2026-317', title: 'DBMS Normalisation Set 3', course: 'Database Management', courseCode: 'CS305', dept: 'CSE', semester: 3, faculty: 'Prof. Aniket Kulkarni', assigned: '2026-11-06', due: '2026-11-20', submitted: 55, total: 58, status: 'Graded' },
  { id: 'asg-3', code: 'A-2026-315', title: 'Subnetting & Packet Capture Lab', course: 'Computer Networks', courseCode: 'IT402', dept: 'IT', semester: 5, faculty: 'Dr. Meenakshi Iyer', assigned: '2026-10-28', due: '2026-11-14', submitted: 41, total: 56, status: 'Overdue' },
  { id: 'asg-4', code: 'A-2026-312', title: 'Image Classification Pipeline', course: 'Computer Vision', courseCode: 'AI501', dept: 'AIDS', semester: 5, faculty: 'Dr. Kavita Bhosale', assigned: '2026-11-12', due: '2026-11-30', submitted: 22, total: 49, status: 'Due Soon' },
  { id: 'asg-5', code: 'A-2026-309', title: 'VLSI Layout Post-Lab Report', course: 'Digital VLSI', courseCode: 'EC402', dept: 'ECE', semester: 5, faculty: 'Dr. Vivek Chavan', assigned: '2026-11-02', due: '2026-11-18', submitted: 44, total: 47, status: 'Graded' },
  { id: 'asg-6', code: 'A-2026-306', title: 'CFD Mesh Convergence Study', course: 'Computational Fluid Dynamics', courseCode: 'ME601', dept: 'MECH', semester: 7, faculty: 'Dr. Harish Jadhav', assigned: '2026-10-25', due: '2026-11-11', submitted: 23, total: 44, status: 'Overdue' },
  { id: 'asg-7', code: 'A-2026-303', title: 'Seismic Load Case Worksheet', course: 'Earthquake Engineering', courseCode: 'CE701', dept: 'CIVIL', semester: 7, faculty: 'Dr. Ashwini Shinde', assigned: '2026-11-08', due: '2026-11-26', submitted: 31, total: 39, status: 'Due Soon' },
  { id: 'asg-8', code: 'A-2026-301', title: 'DCF Valuation — Tata Motors', course: 'Corporate Finance', courseCode: 'MB303', dept: 'MBA', semester: 3, faculty: 'Prof. Arvind Rathod', assigned: '2026-11-05', due: '2026-11-19', submitted: 52, total: 60, status: 'Graded' },
  { id: 'asg-9', code: 'A-2026-298', title: 'Brand Audit Presentation', course: 'Brand Management', courseCode: 'BB402', dept: 'BBA', semester: 3, faculty: 'Dr. Neha Salunke', assigned: '2026-11-13', due: '2026-11-28', submitted: 36, total: 58, status: 'Due Soon' },
  { id: 'asg-10', code: 'A-2026-296', title: 'Engineering Physics Virtual Lab', course: 'Engineering Physics', courseCode: 'PH102', dept: 'AS', semester: 1, faculty: 'Prof. Makarand Apte', assigned: '2026-10-30', due: '2026-11-15', submitted: 88, total: 112, status: 'Overdue' },
  { id: 'asg-11', code: 'A-2026-294', title: 'Microservices Deployment (K8s)', course: 'Cloud Computing', courseCode: 'IT503', dept: 'IT', semester: 5, faculty: 'Prof. Rohan Patil', assigned: '2026-11-14', due: '2026-12-01', submitted: 19, total: 54, status: 'Due Soon' },
  { id: 'asg-12', code: 'A-2026-291', title: 'RL Gridworld Policy Report', course: 'Reinforcement Learning', courseCode: 'AI602', dept: 'AIDS', semester: 7, faculty: 'Prof. Prasad Datar', assigned: '2026-11-01', due: '2026-11-17', submitted: 33, total: 41, status: 'Graded' },
];

export const ASSIGNMENT_STATS = {
  active: 318,
  submissionRate: 87.2,
  overdue: 46,
};

export const EXAMS: Exam[] = [
  { id: 'ex-1', code: 'CS401', subject: 'Operating Systems', type: 'Theory', dept: 'CSE', semester: 5, date: '2026-12-02', session: 'Morning', hall: 'Hall A-101', invigilator: 'Dr. Sunita Deshpande', status: 'Scheduled' },
  { id: 'ex-2', code: 'CS305', subject: 'Database Management Systems', type: 'Theory', dept: 'CSE', semester: 3, date: '2026-12-02', session: 'Afternoon', hall: 'Hall A-204', invigilator: 'Prof. Aniket Kulkarni', status: 'Scheduled' },
  { id: 'ex-3', code: 'IT402', subject: 'Network Security', type: 'Theory', dept: 'IT', semester: 5, date: '2026-12-03', session: 'Morning', hall: 'Hall B-102', invigilator: 'Dr. Meenakshi Iyer', status: 'Marks Verified' },
  { id: 'ex-4', code: 'AI501', subject: 'Computer Vision', type: 'Practical', dept: 'AIDS', semester: 5, date: '2026-12-04', session: 'Morning', hall: 'AI Lab 3', invigilator: 'Dr. Kavita Bhosale', status: 'Scheduled' },
  { id: 'ex-5', code: 'EC402', subject: 'Digital VLSI', type: 'Theory', dept: 'ECE', semester: 5, date: '2026-12-04', session: 'Afternoon', hall: 'Hall C-201', invigilator: 'Dr. Vivek Chavan', status: 'Marks Verified' },
  { id: 'ex-6', code: 'ME601', subject: 'Computational Fluid Dynamics', type: 'Viva', dept: 'MECH', semester: 7, date: '2026-12-05', session: 'Morning', hall: 'Seminar Hall 2', invigilator: 'Dr. Harish Jadhav', status: 'Scheduled' },
  { id: 'ex-7', code: 'CE701', subject: 'Earthquake Engineering', type: 'Theory', dept: 'CIVIL', semester: 7, date: '2026-12-06', session: 'Morning', hall: 'Hall D-105', invigilator: 'Dr. Ashwini Shinde', status: 'Scheduled' },
  { id: 'ex-8', code: 'MB401', subject: 'Strategic Management', type: 'Project', dept: 'MBA', semester: 3, date: '2026-12-07', session: 'Afternoon', hall: 'MBA Studio 1', invigilator: 'Dr. Shalini Mehra', status: 'Scheduled' },
  { id: 'ex-9', code: 'BB302', subject: 'Marketing Management', type: 'Theory', dept: 'BBA', semester: 3, date: '2026-12-08', session: 'Morning', hall: 'Hall E-301', invigilator: 'Dr. Neha Salunke', status: 'Scheduled' },
  { id: 'ex-10', code: 'MA101', subject: 'Engineering Mathematics I', type: 'Theory', dept: 'AS', semester: 1, date: '2026-12-09', session: 'Morning', hall: 'Hall A-101', invigilator: 'Dr. Vidya Sane', status: 'Scheduled' },
  { id: 'ex-11', code: 'IT503', subject: 'Cloud Computing', type: 'Practical', dept: 'IT', semester: 5, date: '2026-12-10', session: 'Afternoon', hall: 'Cloud Lab 1', invigilator: 'Prof. Rohan Patil', status: 'Marks Verified' },
  { id: 'ex-12', code: 'AI302', subject: 'Probability & Statistics', type: 'Theory', dept: 'AIDS', semester: 3, date: '2026-12-11', session: 'Morning', hall: 'Hall B-205', invigilator: 'Prof. Sameer Nair', status: 'Scheduled' },
];

export const NOTICES: Notice[] = [
  { id: 'nt-1', title: 'Semester-end Theory Examination Timetable Released', body: 'The odd-semester theory examination schedule for AY 2026-27 is now published. Students must carry their hall ticket and college ID. Hall tickets are available on the student portal from 26 Nov 2026, 10:00 AM.', category: 'Examination', audience: 'All Students (Sem 1–7)', date: '2026-11-22', expiry: '2026-12-12', pinned: true, author: 'Dr. Rajeshwar Rao' },
  { id: 'nt-2', title: 'NEP-2020 Credit Transfer Window Closes 30 Nov', body: 'Students who completed SWAYAM/NPTEL courses must submit the credit transfer form with a verified scorecard to the Academic Section. Late submissions will not be considered for the winter 2026 transcript.', category: 'Academic', audience: 'All UG Students', date: '2026-11-20', expiry: '2026-11-30', pinned: true, author: 'Academic Section' },
  { id: 'nt-3', title: 'Annual TechFest — Vanguard Innovate 2026', body: 'Vanguard Innovate returns on 19–20 December 2026 with 24-hour hackathons, robotics arenas and an industry pitch floor. Team registration closes 10 Dec. ₹1,50,000 prize pool across six tracks.', category: 'Events', audience: 'All Students & Faculty', date: '2026-11-18', expiry: '2026-12-20', pinned: false, author: 'Students’ Council' },
  { id: 'nt-4', title: 'Winter Break — Institute Closed 24 Dec to 1 Jan', body: 'The institute will remain closed for the winter break from 24 December 2026 to 1 January 2027. Hostel residents must vacate by 22 Dec, 5:00 PM unless approved for examination duty.', category: 'Holidays', audience: 'All Departments', date: '2026-11-16', expiry: '2027-01-02', pinned: false, author: 'Registrar’s Office' },
  { id: 'nt-5', title: 'MahaDBT Scholarship Re-verification Required', body: '480 students with pending MahaDBT EBC applications must re-verify income certificates on DigiLocker before 5 Dec 2026. Accounts with incomplete documents will be forwarded back to the nodal officer.', category: 'Administration', audience: 'Scholarship Applicants', date: '2026-11-15', expiry: '2026-12-05', pinned: false, author: 'Scholarship Cell' },
  { id: 'nt-6', title: 'Scheduled Network Maintenance — 27 Nov, 11 PM–2 AM', body: 'ERP, e-library and DigiLocker integrations will be intermittently unavailable during the maintenance window. Fee-payment gateway will remain available.', category: 'Emergency Announcements', audience: 'All Portal Users', date: '2026-11-23', expiry: '2026-11-28', pinned: true, author: 'IT Infrastructure' },
  { id: 'nt-7', title: 'Faculty Development Programme on Generative AI', body: 'A three-day FDP on applied generative AI for teaching is scheduled 8–10 Dec at the Central Seminar Hall. E-certificates will be issued through the AICTE portal. Nominations through respective HODs.', category: 'Academic', audience: 'Faculty & Research Scholars', date: '2026-11-12', expiry: '2026-12-10', pinned: false, author: 'IQAC' },
  { id: 'nt-8', title: 'Placement Drive — Persistent & Bajaj Finserv', body: 'Eligibility: CGPA ≥ 7.0, no active backlogs. Pre-placement talk on 28 Nov in the Auditorium; aptitude round on 29 Nov. Upload updated résumés to the Training & Placement portal.', category: 'Administration', audience: 'Final Year B.Tech / MBA', date: '2026-11-10', expiry: '2026-11-29', pinned: false, author: 'Training & Placement Cell' },
  { id: 'nt-9', title: 'Independence Day Practice — Cultural Committee', body: 'Practice sessions for the annual cultural showcase begin 1 Dec in the Amphitheatre, 4:30–6:30 PM. Participants must confirm attendance with the Cultural Committee by 28 Nov.', category: 'Events', audience: 'Cultural Committee', date: '2026-11-08', expiry: '2026-12-15', pinned: false, author: 'Cultural Committee' },
];

export const NOTICE_CATEGORIES: NoticeCategory[] = [
  'Academic',
  'Examination',
  'Events',
  'Holidays',
  'Administration',
  'Emergency Announcements',
];

export const COURSES: Course[] = [
  { id: 'c-1', code: 'CS401', title: 'Operating Systems', dept: 'CSE', duration: 'Sem 5 · 1 Term', credits: 4, enrolled: 186, type: 'Core', semester: 5, nepAligned: true },
  { id: 'c-2', code: 'CS305', title: 'Database Management Systems', dept: 'CSE', duration: 'Sem 3 · 1 Term', credits: 4, enrolled: 204, type: 'Core', semester: 3, nepAligned: true },
  { id: 'c-3', code: 'CS702', title: 'Distributed Computing', dept: 'CSE', duration: 'Sem 7 · 1 Term', credits: 3, enrolled: 118, type: 'Elective', semester: 7, nepAligned: true },
  { id: 'c-4', code: 'IT402', title: 'Network Security', dept: 'IT', duration: 'Sem 5 · 1 Term', credits: 4, enrolled: 162, type: 'Core', semester: 5, nepAligned: true },
  { id: 'c-5', code: 'IT503', title: 'Cloud Computing', dept: 'IT', duration: 'Sem 5 · 1 Term', credits: 3, enrolled: 148, type: 'Elective', semester: 5, nepAligned: true },
  { id: 'c-6', code: 'AI501', title: 'Computer Vision', dept: 'AIDS', duration: 'Sem 5 · 1 Term', credits: 4, enrolled: 132, type: 'Core', semester: 5, nepAligned: true },
  { id: 'c-7', code: 'AI602', title: 'Reinforcement Learning', dept: 'AIDS', duration: 'Sem 7 · 1 Term', credits: 3, enrolled: 94, type: 'Elective', semester: 7, nepAligned: true },
  { id: 'c-8', code: 'EC402', title: 'Digital VLSI Design', dept: 'ECE', duration: 'Sem 5 · 1 Term', credits: 4, enrolled: 141, type: 'Core', semester: 5, nepAligned: true },
  { id: 'c-9', code: 'EC303', title: 'Microcontrollers & Embedded', dept: 'ECE', duration: 'Sem 3 · 1 Term', credits: 4, enrolled: 158, type: 'Lab', semester: 3, nepAligned: true },
  { id: 'c-10', code: 'ME302', title: 'Thermodynamics', dept: 'MECH', duration: 'Sem 3 · 1 Term', credits: 4, enrolled: 167, type: 'Core', semester: 3, nepAligned: true },
  { id: 'c-11', code: 'ME503', title: 'Electric Vehicle Powertrains', dept: 'MECH', duration: 'Sem 5 · 1 Term', credits: 3, enrolled: 96, type: 'Elective', semester: 5, nepAligned: true },
  { id: 'c-12', code: 'CE402', title: 'RCC Structures', dept: 'CIVIL', duration: 'Sem 5 · 1 Term', credits: 4, enrolled: 124, type: 'Core', semester: 5, nepAligned: true },
  { id: 'c-13', code: 'CE603', title: 'GIS Applications', dept: 'CIVIL', duration: 'Sem 6 · 1 Term', credits: 3, enrolled: 82, type: 'Elective', semester: 6, nepAligned: true },
  { id: 'c-14', code: 'MB401', title: 'Strategic Management', dept: 'MBA', duration: 'Sem 3 · Trimester', credits: 3, enrolled: 120, type: 'Core', semester: 3, nepAligned: true },
  { id: 'c-15', code: 'MB504', title: 'FinTech Ecosystems', dept: 'MBA', duration: 'Sem 3 · Trimester', credits: 3, enrolled: 88, type: 'Elective', semester: 3, nepAligned: true },
  { id: 'c-16', code: 'BB302', title: 'Marketing Management', dept: 'BBA', duration: 'Sem 3 · 1 Term', credits: 3, enrolled: 132, type: 'Core', semester: 3, nepAligned: true },
  { id: 'c-17', code: 'MA101', title: 'Engineering Mathematics I', dept: 'AS', duration: 'Sem 1 · 1 Term', credits: 4, enrolled: 280, type: 'Core', semester: 1, nepAligned: true },
  { id: 'c-18', code: 'PH102', title: 'Engineering Physics', dept: 'AS', duration: 'Sem 1 · 1 Term', credits: 3, enrolled: 274, type: 'Lab', semester: 1, nepAligned: true },
  { id: 'c-19', code: 'CS801', title: 'Deep Learning', dept: 'CSE', duration: 'Sem 8 · 1 Term', credits: 3, enrolled: 76, type: 'Elective', semester: 8, nepAligned: true },
  { id: 'c-20', code: 'IT605', title: 'Data Streaming Architecture', dept: 'IT', duration: 'Sem 6 · 1 Term', credits: 3, enrolled: 68, type: 'Elective', semester: 6, nepAligned: true },
];

export const ASSIGNMENT_STATUS_TONE: Record<AssignmentStatus, 'warning' | 'danger' | 'success'> = {
  'Due Soon': 'warning',
  Overdue: 'danger',
  Graded: 'success',
};
