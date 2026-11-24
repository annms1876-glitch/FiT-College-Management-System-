import type { DeptCode, FeeStatus, Student } from '../../types';

const FIRST = [
  'Aarav', 'Ananya', 'Ishaan', 'Diya', 'Vivaan', 'Saanvi', 'Aditya', 'Aadhya', 'Arjun', 'Myra',
  'Rohan', 'Anika', 'Kabir', 'Kiara', 'Dhruv', 'Riya', 'Aryan', 'Sara', 'Neel', 'Meera',
  'Vedant', 'Tara', 'Shaurya', 'Nisha', 'Yash', 'Pooja', 'Omkar', 'Shreya', 'Tanmay', 'Isha',
  'Siddharth', 'Nupur', 'Manav', 'Rutuja', 'Karan', 'Aditi', 'Harsh', 'Gauri', 'Rajat', 'Riddhi',
  'Sahil', 'Trisha', 'Nikhil', 'Aisha', 'Parth', 'Sanya', 'Devang', 'Gayatri', 'Kunal', 'Vaishnavi',
  'Atharva', 'Sayali', 'Swapnil', 'Kavya', 'Akash', 'Sneha', 'Ruthwik', 'Pranjal', 'Vikram', 'Matangi',
];

const LAST = [
  'Deshmukh', 'Patil', 'Iyer', 'Kulkarni', 'Joshi', 'Sharma', 'Gaikwad', 'Nair', 'Bhosale', 'Chavan',
  'Rao', 'Menon', 'Agarwal', 'Jadhav', 'Mehta', 'Pawar', 'Kadam', 'Bhat', 'Shinde', 'Verma',
  'Naik', 'Sawant', 'Patwardhan', 'Reddy', 'Kale', 'Mane', 'Datar', 'Kurup', 'Sethi', 'Salunke',
  'Pandey', 'Gokhale', 'Bapat', 'Fernandes', 'Pillai', 'More', 'Sane', 'Upadhyay', 'Rane', 'Apte',
];

const COURSE_BY_DEPT: Record<DeptCode, string[]> = {
  CSE: ['B.Tech Computer Engineering', 'B.Tech CSE · AI/ML Minor'],
  IT: ['B.Tech Information Technology', 'B.Tech IT · Cyber Security'],
  AIDS: ['B.Tech AI & Data Science', 'B.Tech AI & DS · Robotics'],
  ECE: ['B.Tech Electronics & Telecom', 'B.Tech E&TC · VLSI'],
  MECH: ['B.Tech Mechanical Engineering', 'B.Tech Mechanical · EV Tech'],
  CIVIL: ['B.Tech Civil Engineering', 'B.Tech Civil · Smart Infra'],
  MBA: ['MBA Business Administration', 'MBA · FinTech'],
  BBA: ['BBA (Autonomous)', 'BBA · Digital Marketing'],
  AS: ['B.Tech First Year', 'B.Tech First Year · Honours'],
};

const BLOOD = ['A+', 'B+', 'O+', 'AB+', 'A-', 'O-', 'B-', 'AB-'];
const SCHOLARSHIPS = [
  'NSP · Post-Matric Scholarship',
  'MahaDBT · Rajarshi Chhatrapati Shahu Maharaj',
  "MahaDBT · EBC 50% Tuition Waiver",
  'Institutional Merit · Rank 1-10',
  'NSP · Central Sector Scheme',
  null,
  null,
  null,
];

const RELATIONS = ['Father', 'Father', 'Mother', 'Guardian'];

function pick<T>(arr: T[], i: number) {
  return arr[i % arr.length];
}

const deptWheel: { code: DeptCode; weight: number }[] = [
  { code: 'CSE', weight: 14 },
  { code: 'IT', weight: 10 },
  { code: 'AIDS', weight: 9 },
  { code: 'ECE', weight: 9 },
  { code: 'MECH', weight: 8 },
  { code: 'CIVIL', weight: 7 },
  { code: 'MBA', weight: 6 },
  { code: 'BBA', weight: 5 },
];

const deptsExpanded: DeptCode[] = deptWheel.flatMap((d) => Array<DeptCode>(d.weight).fill(d.code));

const YEAR_BY_SEM = (sem: number) => (sem <= 2 ? 2025 : sem <= 4 ? 2024 : sem <= 6 ? 2023 : 2022);

export const STUDENTS: Student[] = Array.from({ length: 78 }, (_, i) => {
  const dept = deptsExpanded[i % deptsExpanded.length];
  const semester = dept === 'MBA' || dept === 'BBA' ? (i % 2 === 0 ? 3 : 1) : [1, 3, 5, 7][i % 4];
  const first = pick(FIRST, i * 7 + 3);
  const last = pick(LAST, i * 5 + 1);
  const name = `${first} ${last}`;
  const admissionYear = YEAR_BY_SEM(semester);
  const roll = `${admissionYear}${dept === 'AIDS' ? 'AI' : dept === 'AS' ? 'FY' : dept}${
    dept === 'MBA' || dept === 'BBA' ? 'M' : 'B'
  }${String(1000 + ((i * 37) % 899)).slice(-3)}`;
  const attRoll = (i * 29 + 17) % 100;
  const attendance = Number((58 + (attRoll % 43) + (attRoll % 7) / 10).toFixed(1));
  const statusSeed = (i * 13 + 5) % 10;
  const feeStatus: FeeStatus = statusSeed < 6 ? 'Paid' : statusSeed < 8 ? 'Partial' : 'Overdue';
  const feeTotal = dept === 'MBA' ? 184500 : dept === 'BBA' ? 96500 : 148500;
  const feePaid =
    feeStatus === 'Paid' ? feeTotal : feeStatus === 'Partial' ? Math.round(feeTotal * (0.5 + (i % 3) * 0.1)) : 0;
  const docSeed = (i * 11) % 7;
  const emailLocal = `${first.toLowerCase()}.${last.toLowerCase()}${String(i + 1).padStart(2, '0')}`;

  return {
    id: `stu-${i + 1}`,
    roll,
    name,
    email: `${emailLocal}@vitp.ac.in`,
    phone: `+91 9${String(80000000 + i * 137917).slice(0, 9)}`,
    dept,
    course: pick(COURSE_BY_DEPT[dept], i),
    semester,
    division: `Div ${String.fromCharCode(65 + (i % 3))}`,
    attendance,
    feeStatus,
    cgpa: Number((6.1 + ((i * 31) % 37) / 10).toFixed(2)) > 10 ? 9.4 : Number((6.1 + ((i * 31) % 37) / 10).toFixed(2)),
    guardianName: `${pick(['Suresh', 'Anil', 'Kavita', 'Ramesh', 'Sunita', 'Mahesh', 'Priya', 'Rahul', 'Vandana', 'Sanjay'], i)} ${last}`,
    guardianRelation: pick(RELATIONS, i),
    guardianPhone: `+91 9${String(70000000 + i * 211111).slice(0, 9)}`,
    address: `${12 + (i % 40)}, ${pick(['Kothrud', 'Baner', 'Viman Nagar', 'Hinjewadi', 'Karve Nagar', 'Wakad', 'Hadapsar', 'Pimpri'], i)}, Pune – ${411000 + (i % 60)}`,
    admissionYear,
    scholarship: docSeed < 4 ? pick(SCHOLARSHIPS, i) : null,
    docs: {
      digilocker: i % 5 !== 0,
      aadhaar: true,
      income: i % 4 !== 0,
      caste: i % 3 !== 0,
      photo: i % 6 !== 0,
    },
    feePaid,
    feeTotal,
    bloodGroup: pick(BLOOD, i),
    hosteller: i % 3 === 0,
  };
});

export const STUDENT_STATS = {
  total: 4820,
  newAdmissions: 1184,
  below75: 186,
  avgAttendance: 86.4,
};

export const ENROLLMENT_HISTORY = [
  { year: '2022', students: 3980, intake: 1080 },
  { year: '2023', students: 4235, intake: 1140 },
  { year: '2024', students: 4482, intake: 1160 },
  { year: '2025', students: 4660, intake: 1175 },
  { year: '2026', students: 4820, intake: 1184 },
];

export const CGPA_BANDS = [
  { band: '5.0–5.9', count: 142 },
  { band: '6.0–6.9', count: 486 },
  { band: '7.0–7.9', count: 1382 },
  { band: '8.0–8.9', count: 1044 },
  { band: '9.0–10', count: 268 },
];
