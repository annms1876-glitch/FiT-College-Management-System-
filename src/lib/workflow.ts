import type { WorkflowRun } from '../types';

export interface WorkflowDraft {
  title: string;
  agents: string[];
  summary: string;
  previewHeaders: string[];
  previewRows: string[][];
  scope: string;
  records: number;
}

export const AGENTS = [
  { id: 'student', name: 'Student Data', description: 'Records, attendance & KYC' },
  { id: 'academic', name: 'Academic', description: 'Courses, timetables & load' },
  { id: 'scholarship', name: 'Scholarship', description: 'NSP, MahaDBT & merit' },
  { id: 'grievance', name: 'Grievance', description: 'SLA, ICC & escalation' },
  { id: 'examination', name: 'Examination', description: 'Schedules & results' },
  { id: 'notice', name: 'Notice', description: 'Drafts & distribution' },
];

export const SUGGESTED_PROMPTS = [
  {
    id: 'attendance',
    title: 'Attendance < 75% Audit',
    prompt:
      'Audit all students with attendance below 75% across CSE and list guardian contact details for a counsellor outreach. Generate a report for the Academic Section.',
    icon: 'radar',
  },
  {
    id: 'scholarship',
    title: 'Scholarship Eligibility Match',
    prompt:
      'Identify students eligible for the MahaDBT EBC 50% tuition waiver for AY 2026-27 and prepare a verified candidate list with missing documents for nodal review.',
    icon: 'sparkles',
  },
  {
    id: 'grievance',
    title: 'Grievance Escalation Report',
    prompt:
      'Summarise every grievance that has breached its 7-day SLA, group them by category, and recommend escalation owners for the principal’s review.',
    icon: 'shield',
  },
  {
    id: 'timetable',
    title: 'Clash-Free CSE Timetable',
    prompt:
      'Build a clash-free Monday to Friday timetable for CSE Semester 5 that respects faculty weekly load, room capacity and the two existing double-bookings.',
    icon: 'calendar',
  },
];

export const GENERIC_PROMPT = (prompt: string) =>
  `Process the following administrative request and prepare an approval-ready draft: “${prompt}”`;

const templateFor = (prompt: string): WorkflowDraft => {
  const p = prompt.toLowerCase();

  if (/(timetable|schedule|clash|room)/.test(p)) {
    return {
      title: 'Clash-free CSE Semester 5 timetable — draft v2',
      agents: ['Academic', 'Student Data'],
      summary:
        'Resolved 2 room/faculty clashes by moving OS Lab to Lab-CV (Tue 11:30) and shifting Web Technologies Lab to Mon 08:30 in Lab-CV. Faculty load for Prof. Tejas Bhide drops from 25 h/wk to 21 h/wk. No room exceeds 72% utilisation.',
      previewHeaders: ['Day', 'Slot', 'Subject', 'Room', 'Faculty', 'Change'],
      previewRows: [
        ['Tuesday', '11:30–12:25', 'CS401 · OS Lab', 'Lab-CV', 'Dr. Sunita Deshpande', 'Room moved A-204 → Lab-CV'],
        ['Monday', '08:30–09:25', 'CS307 · Web Tech Lab', 'Lab-CV', 'Prof. Tejas Bhide', 'Added to resolve faculty clash'],
        ['Thursday', '09:30–10:25', 'CS305 · DBMS', 'A-204', 'Prof. Aniket Kulkarni', 'Unchanged, conflict cleared'],
      ],
      scope: 'CSE · Semester 5 · Div A',
      records: 18,
    };
  }

  if (/(grievance|sla|escalat|complaint)/.test(p)) {
    return {
      title: 'Grievance SLA escalation report — 4 breaches',
      agents: ['Grievance', 'Examination'],
      summary:
        '4 grievances breach the 7-day SLA: two examination disputes, one hostel infrastructure outage and one confidential ICC case flagged for expedited review. Suggested owners: Controller of Examinations, Hostel Office and ICC Chairperson respectively.',
      previewHeaders: ['Grievance', 'Category', 'Days open', 'Owner', 'SLA'],
      previewRows: [
        ['GRV-2026-0412', 'Examination', '20', 'Controller of Exams', 'Breached'],
        ['GRV-2026-0418', 'Harassment & Safety', '15', 'ICC Committee', 'Breached · confidential'],
        ['GRV-2026-0442', 'Hostel', '7', 'Hostel Office', 'Breached'],
        ['GRV-2026-0467', 'Examination', '14', 'Controller of Exams', 'Breached'],
      ],
      scope: 'All departments · 19 open cases',
      records: 19,
    };
  }

  if (/(scholarship|mahabdt|nsp|fee waiver|eligible)/.test(p)) {
    return {
      title: 'MahaDBT EBC 50% eligibility match — 96 candidates',
      agents: ['Scholarship', 'Student Data'],
      summary:
        'Cross-checked 612 active scholarship records against income ceilings and quota declarations. 96 students show a potential match; 14 are missing an income certificate on DigiLocker. Nodal Officer verification is mandatory before any approval.',
      previewHeaders: ['Student', 'Roll', 'Category', 'Flag', 'Missing docs'],
      previewRows: [
        ['Vivaan Joshi', '2022MEBB447', 'SC · Freeship', 'Potential match', 'None'],
        ['Aadhya Nair', '2025BBAM033', 'OBC · EBC 50%', 'Potential match', 'Income certificate'],
        ['Kabir Agarwal', '2022ECEB330', 'OBC · EBC 50%', 'Potential match', 'None'],
        ['Riya Pawar', '2024ITB077', 'SC · Freeship', 'Potential match', 'Caste validity'],
      ],
      scope: 'AY 2026-27 · UG + PG',
      records: 96,
    };
  }

  if (/(notice|announce|circular|publish)/.test(p)) {
    return {
      title: 'Draft notice — winter examination guidelines',
      agents: ['Notice', 'Examination'],
      summary:
        'Prepared a notice draft for all Sem 1–7 students covering hall ticket collection, reporting time and prohibited items. Audience targeting: 4,820 students and 284 faculty. Publishing requires Administrator approval.',
      previewHeaders: ['Field', 'Draft value'],
      previewRows: [
        ['Title', 'Winter 2026 examination guidelines'],
        ['Category', 'Examination'],
        ['Audience', 'All Students (Sem 1–7)'],
        ['Publish window', '25 Nov 2026 – 12 Dec 2026'],
        ['Delivery', 'Portal + email digest + LMS'],
      ],
      scope: 'Institute-wide',
      records: 4820,
    };
  }

  if (/(fee|payment|collection|dues|receipt)/.test(p)) {
    return {
      title: 'Fee collection reconciliation — 18 pending receipts',
      agents: ['Student Data', 'Scholarship'],
      summary:
        'Matched 512 gateway settlements with the ledger. 18 NEFT transactions are awaiting receipt generation and 6 scholarship waivers are applied against the wrong head. Draft reconciliation journal prepared for Accounts.',
      previewHeaders: ['Receipt', 'Student', 'Amount', 'Mode', 'Issue'],
      previewRows: [
        ['VIT/2026-27/04821', 'Aarav Deshmukh', '₹1,48,500', 'UPI', 'Receipt pending'],
        ['VIT/2026-27/04912', 'Ananya Patil', '₹50,000', 'NEFT', 'Partial allocation'],
        ['VIT/2026-27/05018', 'Diya Iyer', '₹98,500', 'DD', 'Waiver head mismatch'],
      ],
      scope: 'AY 2026-27 · All departments',
      records: 18,
    };
  }

  if (/(exam|result|marks|hall ticket)/.test(p)) {
    return {
      title: 'Examination readiness audit — 28 papers',
      agents: ['Examination', 'Academic'],
      summary:
        '12 of 28 papers have invigilators confirmed. 4 halls clash with the placement drive on 29 Nov. Marks verification is pending for 6 subjects; results cannot be published until Examination Admin sign-off.',
      previewHeaders: ['Paper', 'Date', 'Hall', 'Invigilator', 'Status'],
      previewRows: [
        ['CS401 · Operating Systems', '02 Dec 2026', 'A-101', 'Dr. Sunita Deshpande', 'Scheduled'],
        ['IT402 · Network Security', '03 Dec 2026', 'B-102', 'Dr. Meenakshi Iyer', 'Marks verified'],
        ['ME601 · CFD Viva', '05 Dec 2026', 'Seminar Hall 2', 'Dr. Harish Jadhav', 'Scheduled'],
      ],
      scope: 'Odd semester · 9 departments',
      records: 28,
    };
  }

  if (/(faculty|workload|staff)/.test(p)) {
    return {
      title: 'Faculty workload rebalance — 23 over 20 h/wk',
      agents: ['Academic', 'Student Data'],
      summary:
        '23 faculty exceed the 20 h/wk guideline. Redistributing two lab batches from Prof. Tejas Bhide (25 h) and Prof. Rohan Patil (24 h) to Dr. Sunita Deshpande (16 h) brings 18 faculty within policy.',
      previewHeaders: ['Faculty', 'Current load', 'Proposed', 'Subjects affected'],
      previewRows: [
        ['Prof. Tejas Bhide', '25 h/wk', '21 h/wk', 'CS307 Web Technologies Lab'],
        ['Prof. Rohan Patil', '24 h/wk', '20 h/wk', 'IT503 Cloud Computing'],
        ['Dr. Sunita Deshpande', '16 h/wk', '18 h/wk', '+1 OS tutorial'],
      ],
      scope: 'All departments · 284 faculty',
      records: 23,
    };
  }

  return {
    title: 'Administrative request — draft prepared for approval',
    agents: ['Student Data', 'Academic'],
    summary:
      'Request interpreted against current AY 2026-27 records. A structured draft has been prepared with the relevant scope, affected cohort and recommended next action. No records have been modified; execution requires administrator approval.',
    previewHeaders: ['Item', 'Value'],
    previewRows: [
      ['Request', prompt.length > 68 ? `${prompt.slice(0, 68)}…` : prompt],
      ['Records reviewed', '182'],
      ['Agents engaged', 'Student Data, Academic'],
      ['Risk classification', 'Low · read-only draft'],
    ],
    scope: 'Institute-wide',
    records: 182,
  };
};

export const draftWorkflow = (prompt: string, id: string): WorkflowRun => {
  const t = templateFor(prompt);
  const ts = new Date().toISOString();
  return {
    id,
    ts,
    prompt,
    agents: t.agents,
    title: t.title,
    summary: t.summary,
    previewHeaders: t.previewHeaders,
    previewRows: t.previewRows,
    scope: t.scope,
    records: t.records,
    status: 'Awaiting Approval',
  };
};

export const reportText = (run: WorkflowRun) => {
  const lines = [
    `VANGUARD INSTITUTE OF TECHNOLOGY, PUNE`,
    `AI Orchestrator report · ${run.id}`,
    `Generated ${new Date(run.ts).toLocaleString('en-IN')}`,
    ``,
    `Request: ${run.prompt}`,
    `Agents: ${run.agents.join(', ')}`,
    `Scope: ${run.scope}`,
    `Status: ${run.status}`,
    ``,
    `Summary`,
    run.summary,
    ``,
    run.previewHeaders.join('\t'),
    ...run.previewRows.map((r) => r.join('\t')),
    ``,
    `AI flags candidates and prepares drafts only. Nothing is published, deleted or approved without an administrator.`,
  ];
  return lines.join('\n');
};
