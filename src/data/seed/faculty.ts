import type { DeptCode, Faculty } from '../../types';

const FACULTY_SEED: Array<Omit<Faculty, 'id' | 'attendance' | 'joined'> & { att?: 'Present' | 'On Duty' }> = [
  { name: 'Dr. Sunita Deshpande', designation: 'Professor & HOD', dept: 'CSE', specialization: 'Distributed Systems, Cloud Native', subjects: ['CS401 · Operating Systems', 'CS702 · Distributed Computing'], weeklyLoad: 16, email: 'sunita.deshpande@vitp.ac.in', phone: '+91 98220 41122' },
  { name: 'Prof. Aniket Kulkarni', designation: 'Associate Professor', dept: 'CSE', specialization: 'Machine Learning, NLP', subjects: ['CS305 · DBMS', 'CS801 · Deep Learning'], weeklyLoad: 22, email: 'aniket.kulkarni@vitp.ac.in', phone: '+91 98220 41123' },
  { name: 'Dr. Meenakshi Iyer', designation: 'Professor', dept: 'IT', specialization: 'Cyber Security, Cryptography', subjects: ['IT402 · Network Security', 'IT604 · Ethical Hacking'], weeklyLoad: 18, email: 'meenakshi.iyer@vitp.ac.in', phone: '+91 98220 41124' },
  { name: 'Prof. Rohan Patil', designation: 'Assistant Professor', dept: 'IT', specialization: 'Cloud DevOps, SRE', subjects: ['IT503 · Cloud Computing', 'IT301 · Data Structures'], weeklyLoad: 24, email: 'rohan.patil@vitp.ac.in', phone: '+91 98220 41125' },
  { name: 'Dr. Kavita Bhosale', designation: 'Associate Professor & HOD', dept: 'AIDS', specialization: 'Computer Vision, Edge AI', subjects: ['AI501 · Computer Vision', 'AI701 · MLOps'], weeklyLoad: 17, email: 'kavita.bhosale@vitp.ac.in', phone: '+91 98220 41126' },
  { name: 'Prof. Sameer Nair', designation: 'Assistant Professor', dept: 'AIDS', specialization: 'Statistics, Causal Inference', subjects: ['AI302 · Probability & Statistics', 'AI402 · Data Wrangling'], weeklyLoad: 21, email: 'sameer.nair@vitp.ac.in', phone: '+91 98220 41127' },
  { name: 'Dr. Vivek Chavan', designation: 'Professor & HOD', dept: 'ECE', specialization: 'VLSI Design, RF Circuits', subjects: ['EC402 · Digital VLSI', 'EC602 · RF Engineering'], weeklyLoad: 15, email: 'vivek.chavan@vitp.ac.in', phone: '+91 98220 41128' },
  { name: 'Prof. Pallavi Gaikwad', designation: 'Assistant Professor', dept: 'ECE', specialization: 'Embedded Systems, IoT', subjects: ['EC303 · Microcontrollers', 'EC505 · IoT Systems'], weeklyLoad: 20, email: 'pallavi.gaikwad@vitp.ac.in', phone: '+91 98220 41129' },
  { name: 'Dr. Harish Jadhav', designation: 'Professor & HOD', dept: 'MECH', specialization: 'Thermal Sciences, CFD', subjects: ['ME302 · Thermodynamics', 'ME601 · CFD'], weeklyLoad: 19, email: 'harish.jadhav@vitp.ac.in', phone: '+91 98220 41130' },
  { name: 'Prof. Rupali Kadam', designation: 'Associate Professor', dept: 'MECH', specialization: 'EV Powertrain, Mechatronics', subjects: ['ME503 · Electric Vehicles', 'ME404 · Robotics'], weeklyLoad: 23, email: 'rupali.kadam@vitp.ac.in', phone: '+91 98220 41131' },
  { name: 'Dr. Ashwini Shinde', designation: 'Professor & HOD', dept: 'CIVIL', specialization: 'Structural Engineering, Seismic Design', subjects: ['CE402 · RCC Structures', 'CE701 · Earthquake Engineering'], weeklyLoad: 16, email: 'ashwini.shinde@vitp.ac.in', phone: '+91 98220 41132' },
  { name: 'Prof. Nikhil Joshi', designation: 'Assistant Professor', dept: 'CIVIL', specialization: 'GIS, Smart Infrastructure', subjects: ['CE305 · Surveying', 'CE603 · GIS Applications'], weeklyLoad: 18, email: 'nikhil.joshi@vitp.ac.in', phone: '+91 98220 41133' },
  { name: 'Dr. Shalini Mehra', designation: 'Professor & Director', dept: 'MBA', specialization: 'Strategic Management, Family Business', subjects: ['MB401 · Strategy', 'MB601 · Entrepreneurship'], weeklyLoad: 12, email: 'shalini.mehra@vitp.ac.in', phone: '+91 98220 41134' },
  { name: 'Prof. Arvind Rathod', designation: 'Associate Professor', dept: 'MBA', specialization: 'FinTech, Capital Markets', subjects: ['MB303 · Corporate Finance', 'MB504 · FinTech Ecosystems'], weeklyLoad: 21, email: 'arvind.rathod@vitp.ac.in', phone: '+91 98220 41135' },
  { name: 'Dr. Neha Salunke', designation: 'Associate Professor & HOD', dept: 'BBA', specialization: 'Consumer Behaviour, Brand Strategy', subjects: ['BB302 · Marketing Management', 'BB402 · Brand Management'], weeklyLoad: 19, email: 'neha.salunke@vitp.ac.in', phone: '+91 98220 41136' },
  { name: 'Prof. Kunal Bapat', designation: 'Assistant Professor', dept: 'BBA', specialization: 'Business Analytics, Excel Modelling', subjects: ['BB204 · Business Analytics', 'BB306 · Operations'], weeklyLoad: 20, email: 'kunal.bapat@vitp.ac.in', phone: '+91 98220 41137' },
  { name: 'Dr. Vidya Sane', designation: 'Professor', dept: 'AS', specialization: 'Applied Mathematics, Optimization', subjects: ['MA101 · Engineering Maths I', 'MA201 · Engineering Maths II'], weeklyLoad: 17, email: 'vidya.sane@vitp.ac.in', phone: '+91 98220 41138' },
  { name: 'Prof. Makarand Apte', designation: 'Assistant Professor', dept: 'AS', specialization: 'Physics, Materials Science', subjects: ['PH102 · Engineering Physics', 'PH202 · Material Science'], weeklyLoad: 16, email: 'makarand.apte@vitp.ac.in', phone: '+91 98220 41139' },
  { name: 'Dr. Farida Merchant', designation: 'Professor', dept: 'CSE', specialization: 'Compilers, Programming Languages', subjects: ['CS306 · Compiler Design', 'CS801 · Theory of Computation'], weeklyLoad: 14, email: 'farida.merchant@vitp.ac.in', phone: '+91 98220 41140' },
  { name: 'Prof. Tejas Bhide', designation: 'Assistant Professor', dept: 'CSE', specialization: 'Full-stack Engineering, HCI', subjects: ['CS307 · Web Technologies', 'CS405 · Software Engineering'], weeklyLoad: 25, email: 'tejas.bhide@vitp.ac.in', phone: '+91 98220 41141' },
  { name: 'Dr. Anjali Kher', designation: 'Associate Professor', dept: 'IT', specialization: 'Data Engineering, Streaming', subjects: ['IT404 · Big Data', 'IT605 · Data Streaming'], weeklyLoad: 18, email: 'anjali.kher@vitp.ac.in', phone: '+91 98220 41142' },
  { name: 'Prof. Prasad Datar', designation: 'Assistant Professor', dept: 'AIDS', specialization: 'Reinforcement Learning, Simulation', subjects: ['AI602 · Reinforcement Learning', 'AI403 · Optimization'], weeklyLoad: 19, email: 'prasad.datar@vitp.ac.in', phone: '+91 98220 41143' },
  { name: 'Dr. Smita Gokhale', designation: 'Professor', dept: 'ECE', specialization: 'Signal Processing, 5G PHY', subjects: ['EC401 · DSP', 'EC604 · 5G Systems'], weeklyLoad: 17, email: 'smita.gokhale@vitp.ac.in', phone: '+91 98220 41144' },
  { name: 'Prof. Jatin Shah', designation: 'Assistant Professor', dept: 'MECH', specialization: 'Manufacturing, Additive', subjects: ['ME405 · CAD/CAM', 'ME506 · Additive Manufacturing'], weeklyLoad: 22, email: 'jatin.shah@vitp.ac.in', phone: '+91 98220 41145' },
];

export const FACULTY: Faculty[] = FACULTY_SEED.map((f, i) => ({
  ...f,
  id: `FAC-${String(1001 + i)}`,
  attendance: f.att ?? (i % 9 === 0 ? 'On Duty' : 'Present'),
  joined: `${2010 + (i % 14)}-0${1 + (i % 9)}-${String(3 + (i % 25)).padStart(2, '0')}`,
  designation: f.designation,
}));

export const FACULTY_STATS = {
  total: 284,
  presentToday: 261,
  avgWeeklyLoad: 17.6,
  overloaded: 23,
};
