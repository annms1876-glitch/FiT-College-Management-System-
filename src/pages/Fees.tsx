import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  BadgeIndianRupee,
  Banknote,
  Check,
  CircleAlert,
  ChevronRight,
  CreditCard,
  FileSpreadsheet,
  Landmark,
  Plus,
  Printer,
  ReceiptText,
  RefreshCw,
  Search,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { Header, PageScroll, PageStack } from '../components/layout/Header';
import { Badge, Button, SectionCard } from '../components/ui/primitives';
import { Field, Input, SearchInput, Select } from '../components/ui/Form';
import { Modal } from '../components/ui/Modal';
import { TableFooterMeta, TableShell, Td, Th, Tr } from '../components/ui/Table';
import { Tabs } from '../components/ui/Tabs';
import { StackedBar } from '../components/charts/Charts';
import { useApp } from '../store/AppStore';
import { DEPARTMENTS, DEPT_MAP, PROGRAM_BY_DEPT, QUOTAS } from '../data/departments';
import { FEE_TOTALS } from '../data/seed/finance';
import { compactInr, downloadCSV, fmtDate, fmtDateSlashed, inr, num, todayISO } from '../lib/format';
import { cx } from '../lib/cx';
import { navigate, useDebounced, useRoute } from '../lib/hooks';
import type { FeeStructure, Payment, PaymentMode } from '../types';

const MODE_ICON = { UPI: BadgeIndianRupee, NEFT: Landmark, Card: CreditCard, DD: ReceiptText };

const QUOTA_TONE = {
  'General / Open': 'neutral',
  'OBC / EBC 50% Tuition Waiver': 'info',
  'SC / ST Govt. Freeship': 'success',
} as const;

const totalOf = (f: FeeStructure) => f.tuition + f.devFee + f.examLab + f.caution;

/** Collected YTD as a share of the annual demand. */
const COLLECTION_PCT = (FEE_TOTALS.collected / FEE_TOTALS.demand) * 100;
const collectionPctLabel = `${COLLECTION_PCT.toFixed(1)}%`;

export default function Fees() {
  const route = useRoute();
  const [tab, setTab] = useState<'structure' | 'submissions'>('structure');
  const { feeStructures, pushToast } = useApp();
  const [structureOpen, setStructureOpen] = useState(false);
  const [program, setProgram] = useState('all');
  const [quota, setQuota] = useState('all');

  useEffect(() => {
    const t = route.query.get('tab');
    if (t === 'submissions' || t === 'structure') setTab(t);
    if (route.query.get('new') === '1') {
      setTab('submissions');
      navigate('/fees?tab=submissions', { replace: true });
    }
  }, [route]);

  const filteredStructures = useMemo(
    () =>
      feeStructures.filter((f) => {
        if (program !== 'all' && f.dept !== program) return false;
        if (quota !== 'all' && f.quota !== quota) return false;
        return true;
      }),
    [feeStructures, program, quota],
  );

  const kpis = [
    { label: 'Annual Fee Demand', value: compactInr(FEE_TOTALS.demand), exact: inr(FEE_TOTALS.demand), delta: `+${FEE_TOTALS.demandYoy}% YoY`, meta: '4,820 students · 24 structures', icon: FileSpreadsheet, tone: 'bg-primary-tint text-primary-tint-fg', valueTone: 'text-ink' },
    { label: 'Collected YTD', value: compactInr(FEE_TOTALS.collected), exact: inr(FEE_TOTALS.collected), delta: `+${FEE_TOTALS.collectedYoy}%`, meta: `${collectionPctLabel} of demand`, icon: Wallet, tone: 'bg-success-soft text-success', valueTone: 'text-success' },
    { label: 'Pending Dues', value: compactInr(FEE_TOTALS.pending), exact: inr(FEE_TOTALS.pending), delta: `${FEE_TOTALS.pendingYoy}%`, meta: '612 students overdue', icon: Banknote, tone: 'bg-warning-soft text-warning', valueTone: 'text-warning' },
    { label: 'Scholarship Waivers', value: compactInr(FEE_TOTALS.waivers), exact: inr(FEE_TOTALS.waivers), delta: `+${FEE_TOTALS.waiversYoy}%`, meta: '612 beneficiaries', icon: ShieldCheck, tone: 'bg-info-soft text-info', valueTone: 'text-info' },
  ];

  return (
    <>
      <Header
        title="Fees & Submissions"
        kicker="AY 2026-27 · 24 program/quota structures · ERP-synced ledger"
        badge={<Badge tone="success" icon={Check}>Reconciled</Badge>}
        actions={
          tab === 'structure' ? (
            <>
              <Button size="sm" variant="ghost" icon={ArrowDownToLine} onClick={() => { downloadCSV('vanguard-fee-structures.csv', ['Program', 'Quota', 'Tuition', 'Dev Fee', 'Exam & Lab', 'Caution', 'Total'], feeStructures.map(f => [f.program, f.quota, f.tuition, f.devFee, f.examLab, f.caution, totalOf(f)])); pushToast('Fee structures exported', 'success'); }}>
                Export
              </Button>
              <Button size="sm" variant="primary" icon={Plus} onClick={() => setStructureOpen(true)}>Add Fee Structure</Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" icon={RefreshCw} onClick={() => pushToast({ title: 'Gateway reconciled', description: 'HDFC + ICICI settlement files matched · 0 exceptions', tone: 'success' })}>
                Reconcile
              </Button>
              <Button size="sm" variant="primary" icon={Plus} onClick={() => navigate('/fees?tab=submissions&new=1')}>Record Fee Payment</Button>
            </>
          )
        }
      />

      <PageScroll>
        <PageStack>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((k) => (
              <div key={k.label} className="rounded-xl border border-line bg-surface p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-muted">{k.label}</p>
                  <span className={cx('flex h-6 w-6 items-center justify-center rounded-md', k.tone)}>
                    <k.icon size={13} strokeWidth={2.1} aria-hidden />
                  </span>
                </div>
                <p
                  className={cx('mt-1.5 font-display text-[24px] font-bold leading-none tabular-nums', k.valueTone)}
                  title={k.exact}
                >
                  {k.value}
                </p>
                <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
                  <p className="truncate text-[10px] text-muted">{k.meta}</p>
                  <span className="font-mono text-[10px] tabular-nums text-muted">{k.delta}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3 pt-1">
            <Tabs
              value={tab}
              onChange={(t) => {
                setTab(t as typeof tab);
                navigate(`/fees?tab=${t}`, { replace: true });
              }}
              tabs={[
                { id: 'structure', label: 'Fees Structure', icon: <FileSpreadsheet size={13} />, count: feeStructures.length },
                { id: 'submissions', label: 'Student Fees Submission', icon: <Wallet size={13} /> },
              ]}
              className="border-b-0"
            />
            <div className="flex items-center gap-2 pb-1.5 text-[10.5px] text-muted">
              <ShieldCheck size={11} className="text-success" />
              Fee revisions require Registrar + Finance Officer sign-off
            </div>
          </div>

          {tab === 'structure' ? (
            <>
              <div className="rounded-xl border border-line bg-surface p-3">
                <div className="flex flex-wrap items-end gap-2.5">
                  <Field label="Program" className="w-[260px]">
                    <Select value={program} onChange={(e) => setProgram(e.target.value)}>
                      <option value="all">All programs</option>
                      {DEPARTMENTS.map((d) => <option key={d.code} value={d.code}>{PROGRAM_BY_DEPT[d.code]}</option>)}
                    </Select>
                  </Field>
                  <Field label="Quota category" className="w-[280px]">
                    <Select value={quota} onChange={(e) => setQuota(e.target.value)}>
                      <option value="all">All quota categories</option>
                      {QUOTAS.map((q) => <option key={q} value={q}>{q}</option>)}
                    </Select>
                  </Field>
                  <div className="ml-auto flex flex-wrap items-center gap-1.5 pb-0.5">
                    <Badge tone="outline">Tuition</Badge>
                    <Badge tone="outline">Dev fee</Badge>
                    <Badge tone="outline">Exam &amp; lab</Badge>
                    <Badge tone="outline">Caution (one-time)</Badge>
                  </div>
                </div>
              </div>

              <SectionCard
                title="Fee structure · AY 2026-27"
                subtitle={`${filteredStructures.length} program/quota combinations · academic fees only`}
                icon={FileSpreadsheet}
                actions={<Badge tone="success" icon={Check}>Board approved 12 Jun 2026</Badge>}
                flush
              >
                <div className="overflow-x-auto border-t border-line scroll-thin">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr>
                        <Th className="min-w-[230px]">Program</Th>
                        <Th>Quota category</Th>
                        <Th align="right">Tuition</Th>
                        <Th align="right">Dev Fee</Th>
                        <Th align="right">Exam &amp; Lab</Th>
                        <Th align="right">Caution</Th>
                        <Th align="right">Total Annual</Th>
                        <Th align="right">Effective</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStructures.map((f) => (
                        <Tr key={f.id} className="row-hover">
                          <Td>
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-4 items-center rounded bg-surface-container px-1 font-mono text-[9px] text-muted">{f.dept}</span>
                              <span className="text-[12px] font-medium text-ink">{f.program}</span>
                            </div>
                          </Td>
                          <Td><Badge tone={QUOTA_TONE[f.quota]}>{f.quota}</Badge></Td>
                          <Td align="right"><span className={cx('mono text-[11.5px] tabular-nums', f.tuition === 0 ? 'text-success' : 'text-ink')}>{f.tuition === 0 ? 'Freeship' : inr(f.tuition)}</span></Td>
                          <Td align="right"><span className="mono text-[11.5px] tabular-nums text-muted">{inr(f.devFee)}</span></Td>
                          <Td align="right"><span className="mono text-[11.5px] tabular-nums text-muted">{inr(f.examLab)}</span></Td>
                          <Td align="right"><span className="mono text-[11.5px] tabular-nums text-muted">{inr(f.caution)}</span></Td>
                          <Td align="right"><span className="mono text-[12.5px] font-semibold tabular-nums text-ink">{inr(totalOf(f))}</span></Td>
                          <Td align="right"><span className="font-mono text-[10px] tabular-nums text-muted">{fmtDate(f.updated)}</span></Td>
                        </Tr>
                      ))}
                      {filteredStructures.length === 0 && (
                        <tr><Td colSpan={8} align="center" className="py-10 text-sm text-muted">No structures match those filters.</Td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-surface-low/60 px-4 py-2.5 text-[11px] text-muted">
                  <TableFooterMeta shown={filteredStructures.length} total={feeStructures.length} unit="structures" />
                  <span className="flex items-center gap-1.5"><ChevronRight size={10} /> Caution deposit is refundable on graduation</span>
                </div>
              </SectionCard>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <SectionCard title="Demand vs collection" subtitle="By fee head · AY 2026-27" icon={Wallet}>
                  <div className="space-y-3">
                    {[
                      { head: 'Tuition', demand: Math.round(FEE_TOTALS.demand * 0.755), collected: Math.round(FEE_TOTALS.collected * 0.756) },
                      { head: 'Development fee', demand: Math.round(FEE_TOTALS.demand * 0.126), collected: Math.round(FEE_TOTALS.collected * 0.129) },
                      { head: 'Exam & lab', demand: Math.round(FEE_TOTALS.demand * 0.084), collected: Math.round(FEE_TOTALS.collected * 0.084) },
                      { head: 'Caution deposit', demand: Math.round(FEE_TOTALS.demand * 0.035), collected: Math.round(FEE_TOTALS.collected * 0.031) },
                    ].map((r) => {
                      const pctCollected = Math.round((r.collected / r.demand) * 100);
                      return (
                        <div key={r.head}>
                          <div className="mb-1 flex items-center justify-between text-[11px]">
                            <span className="font-medium text-ink">{r.head}</span>
                            <span className="font-mono tabular-nums text-muted">{compactInr(r.collected)} <span className="opacity-60">of</span> {compactInr(r.demand)}</span>
                          </div>
                          <div className="relative h-1.5 overflow-hidden rounded-full bg-surface-high">
                            <div className="h-full rounded-full bg-primary/25" style={{ width: '100%' }} />
                            <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${pctCollected}%` }} />
                          </div>
                          <p className="mt-0.5 text-right text-[9px] text-muted">{pctCollected}% collected</p>
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>
                <SectionCard title="Quota mix" subtitle="Students by admission quota" icon={ShieldCheck}>
                  <StackedBar segments={[
                    { label: 'General', value: 2680, color: '#4F46E5' },
                    { label: 'OBC/EBC', value: 1420, color: '#0EA5E9' },
                    { label: 'SC/ST', value: 720, color: '#0D9488' },
                  ]} height={10} />
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[
                      { label: 'General / Open', value: 2680, pct: 55.6, color: 'bg-[#4F46E5]' },
                      { label: 'OBC / EBC', value: 1420, pct: 29.5, color: 'bg-[#0EA5E9]' },
                      { label: 'SC / ST', value: 720, pct: 14.9, color: 'bg-[#0D9488]' },
                    ].map((q) => (
                      <div key={q.label} className="rounded-lg border border-line px-2.5 py-2">
                        <span className="flex items-center gap-1.5 text-[9.5px] text-muted"><span className={cx('h-1.5 w-1.5 rounded-full', q.color)} />{q.label}</span>
                        <p className="mt-0.5 font-display text-[14px] font-bold tabular-nums text-ink">{num(q.value)}</p>
                        <p className="text-[9px] text-muted">{q.pct}% of intake</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2.5 rounded-lg border border-line bg-surface-low px-2.5 py-2 text-[10.5px] leading-4 text-muted">
                    Govt. freeship and EBC waiver heads are reimbursed by MahaDBT. 412 claims are pending nodal release.
                  </div>
                </SectionCard>
              </div>
            </>
          ) : (
            <SubmissionsTab />
          )}
        </PageStack>
      </PageScroll>

      <AddFeeStructureModal open={structureOpen} onClose={() => setStructureOpen(false)} />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Submissions tab                                                           */
/* -------------------------------------------------------------------------- */
function SubmissionsTab() {
  const { payments, recordPayment, pushToast } = useApp();
  const route = useRoute();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | 'Paid' | 'Partial' | 'Overdue'>('all');

  const [recordOpen, setRecordOpen] = useState(false);
  const [receipt, setReceipt] = useState<Payment | null>(null);
  const debounced = useDebounced(query, 120);

  useEffect(() => {
    if (route.query.get('new') === '1') {
      setRecordOpen(true);
      navigate('/fees?tab=submissions', { replace: true });
    }
  }, [route]);

  const ledger = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return payments
      .filter((p) => status === 'all' || p.state === status)
      .filter((p) => !q || p.student.toLowerCase().includes(q) || p.roll.toLowerCase().includes(q) || p.utr.toLowerCase().includes(q) || p.receipt.toLowerCase().includes(q));
  }, [payments, debounced, status]);

  const collected = payments.filter((p) => p.settlement === 'Cleared').reduce((a, p) => a + p.amount, 0);

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-surface p-3.5">
          <p className="text-[10px] uppercase tracking-wide text-muted">Ledger sample collected</p>
          <p className="mt-1 font-display text-[20px] font-bold tabular-nums text-ink">{inr(collected)}</p>
          <p className="text-[10px] text-muted">{payments.length} transactions in this view</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-3.5">
          <p className="text-[10px] uppercase tracking-wide text-muted">Awaiting receipt</p>
          <p className="mt-1 font-display text-[20px] font-bold tabular-nums text-warning">{payments.filter((p) => p.settlement === 'Processing').length}</p>
          <p className="text-[10px] text-muted">Settlement in progress · T+1</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-3.5">
          <p className="text-[10px] uppercase tracking-wide text-muted">Collection efficiency</p>
          <p className="mt-1 font-display text-[20px] font-bold tabular-nums text-success">{collectionPctLabel}</p>
          <p className="text-[10px] text-muted">Target 88% by 31 Mar 2027</p>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface p-3">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput value={query} onChange={setQuery} placeholder="Search student, roll, UTR or receipt…" className="min-w-[260px] flex-1 sm:max-w-[380px]" />
          <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Status filter" className="w-auto min-w-[150px]">
            <option value="all">All statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Overdue">Overdue</option>
          </Select>
          <Button size="sm" variant="primary" icon={Plus} onClick={() => setRecordOpen(true)} className="ml-auto">Record payment</Button>
        </div>
        <p className="mt-1.5 text-[10px] text-muted">
          Paid = full annual demand settled · Partial = part-payment received · Overdue = balance past the due date. Settlement state (cleared / processing) is shown separately.
        </p>
      </div>

      <TableShell footer={<TableFooterMeta shown={ledger.length} total={payments.length} unit="transactions" />}>
        <thead>
          <tr>
            <Th>Receipt ID</Th>
            <Th>UTR</Th>
            <Th>Student</Th>
            <Th>Dept · Sem</Th>
            <Th align="right">Amount</Th>
            <Th>Mode</Th>
            <Th>Paid on</Th>
            <Th>State</Th>
            <Th align="right">Receipt</Th>
          </tr>
        </thead>
        <tbody>
          {ledger.map((p) => {
            const ModeIcon = MODE_ICON[p.mode];
            return (
              <Tr key={p.id} className="row-hover">
                <Td><span className="mono text-[10.5px] font-medium text-ink">{p.receipt}</span></Td>
                <Td><span className="mono text-[10px] text-muted">{p.utr}</span></Td>
                <Td>
                  <p className="text-[12px] font-medium text-ink">{p.student}</p>
                  <p className="mono text-[9.5px] text-muted">{p.roll}</p>
                </Td>
                <Td><span className="text-[10.5px] text-muted">{p.dept} · Sem {p.semester}</span></Td>
                <Td align="right"><span className="mono text-[12px] font-medium tabular-nums text-ink">{inr(p.amount)}</span></Td>
                <Td>
                  <span className="inline-flex items-center gap-1 text-[10.5px] text-muted">
                    <ModeIcon size={11} /> {p.mode}
                  </span>
                </Td>
                <Td><span className="font-mono text-[10px] tabular-nums text-muted">{fmtDate(p.date)}</span></Td>
                <Td>
                  <div className="flex flex-col items-start gap-0.5">
                    <Badge tone={p.state === 'Paid' ? 'success' : p.state === 'Partial' ? 'info' : 'danger'} dot>
                      {p.state}
                    </Badge>
                    {p.settlement === 'Processing' && <span className="text-[9px] text-warning">Settlement processing</span>}
                  </div>
                </Td>
                <Td align="right">
                  <Button size="xs" variant="secondary" onClick={() => setReceipt(p)} disabled={p.settlement !== 'Cleared'}>
                    View
                  </Button>
                </Td>
              </Tr>
            );
          })}
          {ledger.length === 0 && (
            <tr>
              <Td colSpan={9} align="center" className="py-12">
                <Search size={18} className="mx-auto mb-2 text-muted/60" />
                <p className="text-sm font-semibold text-ink">No transactions match</p>
                <p className="mt-1 text-xs text-muted">Try a different status or clear the search.</p>
              </Td>
            </tr>
          )}
        </tbody>
      </TableShell>

      <RecordPaymentModal
        open={recordOpen}
        onClose={() => setRecordOpen(false)}
        onSubmit={(p) => {
          recordPayment(p);
          setReceipt({ ...p, id: 'new' });
        }}
      />
      <ReceiptModal payment={receipt} onClose={() => setReceipt(null)} />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Record payment                                                            */
/* -------------------------------------------------------------------------- */
function RecordPaymentModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (p: Omit<Payment, 'id'>) => void;
}) {
  const { students, pushToast } = useApp();
  // Default to the first student who still has outstanding dues.
  const [studentId, setStudentId] = useState(
    () => (students.find((s) => s.feeTotal > s.feePaid) ?? students[0])?.id ?? '',
  );
  const [amount, setAmount] = useState('148500');
  const [mode, setMode] = useState<PaymentMode>('UPI');
  const [utr, setUtr] = useState('');
  const [date, setDate] = useState(todayISO());
  const [bank, setBank] = useState('HDFC Bank');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  const student = students.find((s) => s.id === studentId);
  const outstanding = student ? Math.max(0, student.feeTotal - student.feePaid) : 0;

  useEffect(() => {
    if (open && outstanding > 0) setAmount(String(outstanding));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, studentId]);

  const submit = () => {
    const errs: Record<string, string> = {};
    if (!student) errs.student = 'Select a student';
    else if (outstanding <= 0) errs.student = 'This student has no outstanding balance — pick another student';
    const amt = Number(amount);
    if (!amt || amt <= 0) errs.amount = 'Enter a valid amount';
    else if (amt > outstanding) errs.amount = `Cannot exceed outstanding balance of ${inr(outstanding)}`;
    if (utr.length < 8) errs.utr = 'UTR / reference must be at least 8 characters';
    if (Object.keys(errs).length) {
      setErrors(errs);
      setFormError(Object.values(errs)[0] ?? '');
      return;
    }
    if (!student) return;
    setFormError('');
    onSubmit({
      receipt: `VIT/2026-27/${String(5100 + Math.floor(Math.random() * 899)).padStart(5, '0')}`,
      utr,
      student: student.name,
      roll: student.roll,
      dept: student.dept,
      semester: student.semester,
      amount: amt,
      mode,
      date,
      state: amt >= outstanding ? 'Paid' : 'Partial',
      settlement: 'Cleared',
      bank,
    });
    pushToast({ title: 'Receipt generated', description: `${student.name} · ${inr(amt)} via ${mode}`, tone: 'success' });
    setUtr('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record fee payment"
      subtitle="Manual entry for UPI, NEFT, card and DD settlement · updates ledger & student record"
      icon={<BadgeIndianRupee size={16} className="text-primary-tint-fg" />}
      size="lg"
      footer={
        <>
          <span className="mr-auto hidden text-[10.5px] text-muted sm:flex">A unique receipt number is generated on save.</span>
          <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button size="sm" variant="primary" icon={Check} onClick={submit}>Record & generate receipt</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <Field label="Student" required error={errors.student} className="sm:col-span-2">
          <Select value={studentId} onChange={(e) => { setStudentId(e.target.value); setErrors({}); }}>
            {students.slice(0, 40).map((s) => (
              <option key={s.id} value={s.id} disabled={s.feeTotal <= s.feePaid}>
                {s.name} · {s.roll} · {s.dept}
                {s.feeTotal <= s.feePaid ? ' · fully paid' : ` · due ${inr(Math.max(0, s.feeTotal - s.feePaid))}`}
              </option>
            ))}
          </Select>
        </Field>
        {student && (
          <div className="sm:col-span-2 flex items-center justify-between rounded-lg border border-line bg-surface-low px-3 py-2">
            <div>
              <p className="text-[10px] text-muted">Annual demand</p>
              <p className="font-mono text-[11.5px] tabular-nums text-ink">{inr(student.feeTotal)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted">Paid</p>
              <p className="font-mono text-[11.5px] tabular-nums text-success">{inr(student.feePaid)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted">Outstanding</p>
              <p className="font-mono text-[11.5px] tabular-nums text-danger">{inr(outstanding)}</p>
            </div>
            <button type="button" className="text-[10px] font-semibold text-primary hover:underline" onClick={() => setAmount(String(outstanding || ''))}>
              Fill full balance
            </button>
          </div>
        )}
        <Field label="Amount (₹)" required error={errors.amount}>
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mono tabular-nums" />
        </Field>
        <Field label="Payment mode" required>
          <Select value={mode} onChange={(e) => setMode(e.target.value as PaymentMode)}>
            {(['UPI', 'NEFT', 'Card', 'DD']) .map((m) => <option key={m}>{m}</option>)}
          </Select>
        </Field>
        <Field label="UTR / reference number" required error={errors.utr} hint="Bank transaction reference (min 8 characters)">
          <Input value={utr} onChange={(e) => { setUtr(e.target.value.toUpperCase()); setErrors({}); }} placeholder="UTR202600123456" className="mono uppercase" />
        </Field>
        <Field label="Payment date" required>
          <Input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Bank / gateway">
          <Select value={bank} onChange={(e) => setBank(e.target.value)}>
            {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Bank of Baroda', 'Axis Bank', 'Kotak Mahindra', 'Razorpay UPI'].map((b) => <option key={b}>{b}</option>)}
          </Select>
        </Field>
        {formError && (
          <p role="alert" className="sm:col-span-2 flex items-center gap-1.5 rounded-md border border-danger/25 bg-danger-soft px-2.5 py-2 text-[11px] text-danger">
            <CircleAlert size={12} /> {formError}
          </p>
        )}
        <div className="sm:col-span-2 rounded-md border border-info/25 bg-info-soft px-2.5 py-2 text-[10.5px] leading-4 text-info">
          Recording a payment issues a GST-compliant receipt immediately. Reversals require Finance Officer approval and are logged.
        </div>
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/*  Receipt                                                                   */
/* -------------------------------------------------------------------------- */
function ReceiptModal({ payment, onClose }: { payment: Payment | null; onClose: () => void }) {
  const { pushToast } = useApp();
  if (!payment) return null;
  const ModeIcon = MODE_ICON[payment.mode];
  const dept = DEPT_MAP[payment.dept];
  return (
    <Modal
      open={!!payment}
      onClose={onClose}
      title="Official fee receipt"
      subtitle="Vanguard Institute of Technology, Pune · AY 2026-27"
      icon={<ReceiptText size={16} className="text-primary-tint-fg" />}
      size="lg"
      headerExtra={
        <Button size="xs" variant="secondary" icon={Printer} onClick={() => window.print()}>Print</Button>
      }
      footer={
        <>
          <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
          <Button size="sm" variant="primary" icon={ArrowDownToLine} onClick={() => pushToast({ title: 'Receipt exported', description: `${payment.receipt} · signed PDF`, tone: 'success' })}>
            Download PDF
          </Button>
        </>
      }
      bodyClassName="bg-surface-low"
    >
      <div id="fee-receipt" className="mx-auto max-w-[540px] rounded-lg border border-line bg-surface p-5">
        <div className="flex items-start justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-fg">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                <path d="M6.5 6h3.6L12 13.6 13.9 6h3.6l-4 12h-3L6.5 6Z" fill="currentColor" />
              </svg>
            </span>
            <div>
              <p className="font-display text-[13px] font-bold leading-4 text-ink">Vanguard Institute of Technology</p>
              <p className="text-[9.5px] text-muted">Pune 411045 · AISHE C-41812 · AICTE 1-1023941</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-muted">Receipt</p>
            <p className="mono text-[10px] text-ink">{payment.receipt}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 border-b border-line py-3 text-[10.5px]">
          <ReceiptRow label="Student name" value={payment.student} />
          <ReceiptRow label="Roll number" value={payment.roll} mono />
          <ReceiptRow label="Programme" value={dept.name} />
          <ReceiptRow label="Semester" value={`Sem ${payment.semester}`} />
          <ReceiptRow label="Receipt date" value={fmtDateSlashed(payment.date)} />
          <ReceiptRow label="Financial year" value="2026-27" />
        </div>

        <table className="mt-3 w-full text-[10.5px]">
          <thead>
            <tr className="border-b border-line">
              <th className="pb-1 text-left font-semibold text-muted">Description</th>
              <th className="pb-1 text-right font-semibold text-muted">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-line/60">
              <td className="py-1 text-ink">Academic fee instalment {payment.semester % 2 === 0 ? 'II' : 'I'} · AY 2026-27<br /><span className="text-[9px] text-muted">Tuition, development, exam &amp; lab heads</span></td>
              <td className="py-1 text-right font-mono tabular-nums text-ink">{(payment.amount / 1.18).toFixed(2)}</td>
            </tr>
            <tr className="border-b border-line/60">
              <td className="py-1 text-ink">GST @ 18% (incl.)</td>
              <td className="py-1 text-right font-mono tabular-nums text-muted">{(payment.amount - payment.amount / 1.18).toFixed(2)}</td>
            </tr>
            <tr>
              <td className="py-1.5 font-semibold text-ink">Total paid</td>
              <td className="py-1.5 text-right font-mono font-semibold tabular-nums text-ink">{inr(payment.amount, 2)}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-surface-low p-2.5 text-[10px]">
          <div>
            <p className="text-muted">Payment mode</p>
            <p className="flex items-center gap-1 font-medium text-ink"><ModeIcon size={10} /> {payment.mode} · {payment.bank}</p>
          </div>
          <div>
            <p className="text-muted">UTR / reference</p>
            <p className="mono text-ink">{payment.utr}</p>
          </div>
          <div>
            <p className="text-muted">Status</p>
            <p className="font-medium text-success">Cleared &amp; reconciled</p>
          </div>
          <div>
            <p className="text-muted">Amount in words</p>
            <p className="text-ink">{amountInWords(payment.amount)}</p>
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <svg width="92" height="34" viewBox="0 0 92 34" aria-label="Authorised signature" className="text-ink">
              <path d="M4 24c8-14 13 6 18-6s6 12 12 2 8 6 13-4 7 10 12 0 8 8 12 2 8 2 12-2" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <p className="mt-0.5 border-t border-line pt-1 text-[8.5px] text-muted">Accounts Officer · digital signature</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-muted">Verification hash</p>
            <p className="mono text-[9px] text-ink">SHA-256 · {payment.utr.slice(-6)}{payment.receipt.slice(-5)}</p>
          </div>
        </div>
        <p className="mt-3 border-t border-line pt-2 text-[8px] leading-3 text-muted">
          This is a computer-generated receipt. Fees once paid are non-refundable except caution deposit. For assistance, write to accounts@vitp.ac.in quoting the receipt number within 7 days.
        </p>
      </div>
    </Modal>
  );
}

function ReceiptRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[8.5px] uppercase tracking-wide text-muted">{label}</p>
      <p className={cx('text-[11px] font-medium text-ink', mono && 'mono')}>{value}</p>
    </div>
  );
}

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function twoDigits(n: number): string {
  if (n < 20) return WORDS[n];
  return `${TENS[Math.floor(n / 10)]}${n % 10 ? `-${WORDS[n % 10]}` : ''}`;
}

function amountInWords(amount: number): string {
  const n = Math.round(amount);
  if (n === 0) return 'Zero rupees only';
  const crore = Math.floor(n / 1_00_00_000);
  const lakh = Math.floor((n % 1_00_00_000) / 1_00_000);
  const thousand = Math.floor((n % 1_00_000) / 1000);
  const rest = n % 1000;
  const parts: string[] = [];
  if (crore) parts.push(`${twoDigits(crore)} crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} thousand`);
  if (rest) parts.push(`${rest >= 100 ? `${WORDS[Math.floor(rest / 100)]} hundred${rest % 100 ? ' ' : ''}` : ''}${rest % 100 ? twoDigits(rest % 100) : ''}`.trim());
  const text = parts.join(' ');
  return `${text.charAt(0).toUpperCase()}${text.slice(1)} rupees only`;
}

/* -------------------------------------------------------------------------- */
/*  Add fee structure                                                         */
/* -------------------------------------------------------------------------- */
function AddFeeStructureModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addFeeStructure, feeStructures, pushToast } = useApp();
  const [dept, setDept] = useState('CSE');
  const [quota, setQuota] = useState<string>(QUOTAS[0]);
  const [tuition, setTuition] = useState('118000');
  const [devFee, setDevFee] = useState('18500');
  const [examLab, setExamLab] = useState('9000');
  const [caution, setCaution] = useState('5000');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const total = (Number(tuition) || 0) + (Number(devFee) || 0) + (Number(examLab) || 0) + (Number(caution) || 0);

  const submit = () => {
    const errs: Record<string, string> = {};
    if (Number(tuition) < 0) errs.tuition = 'Cannot be negative';
    if (feeStructures.some((f) => f.dept === dept && f.quota === quota)) errs.dupe = 'A structure already exists for this program and quota.';
    if (Object.keys(errs).length) return setErrors(errs);
    addFeeStructure({
      program: PROGRAM_BY_DEPT[dept],
      dept: dept as FeeStructure['dept'],
      quota: quota as FeeStructure['quota'],
      tuition: Number(tuition) || 0,
      devFee: Number(devFee) || 0,
      examLab: Number(examLab) || 0,
      caution: Number(caution) || 0,
      updated: todayISO(),
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add fee structure"
      subtitle="Creates a new AY 2026-27 program/quota structure · requires board approval reference"
      icon={<FileSpreadsheet size={16} className="text-primary-tint-fg" />}
      size="lg"
      footer={
        <>
          <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button size="sm" variant="primary" icon={Check} onClick={submit}>Add structure</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <Field label="Program" required>
          <Select value={dept} onChange={(e) => setDept(e.target.value)}>
            {DEPARTMENTS.map((d) => <option key={d.code} value={d.code}>{PROGRAM_BY_DEPT[d.code]}</option>)}
          </Select>
        </Field>
        <Field label="Quota category" required>
          <Select value={quota} onChange={(e) => setQuota(e.target.value)}>
            {QUOTAS.map((q) => <option key={q}>{q}</option>)}
          </Select>
        </Field>
        <Field label="Tuition fee (₹)" error={errors.tuition}>
          <Input type="number" value={tuition} onChange={(e) => setTuition(e.target.value)} className="mono" />
        </Field>
        <Field label="Development fee (₹)">
          <Input type="number" value={devFee} onChange={(e) => setDevFee(e.target.value)} className="mono" />
        </Field>
        <Field label="Exam & lab fee (₹)">
          <Input type="number" value={examLab} onChange={(e) => setExamLab(e.target.value)} className="mono" />
        </Field>
        <Field label="Caution deposit (one-time) (₹)">
          <Input type="number" value={caution} onChange={(e) => setCaution(e.target.value)} className="mono" />
        </Field>
        <div className="sm:col-span-2 flex items-center justify-between rounded-lg border border-primary/20 bg-primary-tint px-3 py-2.5">
          <span className="text-[11.5px] font-semibold text-primary-tint-fg">Total annual fee</span>
          <span className="mono text-[15px] font-bold tabular-nums text-primary-tint-fg">{inr(total)}</span>
        </div>
        {errors.dupe && <p className="sm:col-span-2 text-xs text-danger">{errors.dupe}</p>}
        <div className="sm:col-span-2 rounded-md border border-warning/25 bg-warning-soft/60 px-2.5 py-2 text-[10.5px] leading-4 text-warning">
          Adding a structure is recorded in the audit log. Existing students keep their admitted-year structure unless explicitly migrated.
        </div>
        <div className="sm:col-span-2">
          <Button size="xs" variant="ghost" onClick={() => pushToast({ title: 'Board resolution linked', description: 'REF/VIT/GB/2026-27/014', tone: 'info' })}>
            Attach board resolution
          </Button>
        </div>
      </div>
    </Modal>
  );
}
