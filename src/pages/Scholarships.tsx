import { useMemo, useState } from 'react';
import { Award, BadgeCheck, Building2, Check, CircleAlert, ExternalLink, Info, Landmark, Lock, Search, Sparkles, TrendingUp, Wallet, XCircle } from 'lucide-react';
import { Header, PageScroll, PageStack } from '../components/layout/Header';
import { Badge, Button, Progress, SectionCard } from '../components/ui/primitives';
import { Field, Select } from '../components/ui/Form';
import { Modal } from '../components/ui/Modal';
import { TableFooterMeta, Td, Th, Tr } from '../components/ui/Table';
import { useApp } from '../store/AppStore';
import { SCHOLARSHIP_SCHEMES, SCHOLARSHIP_STATS } from '../data/seed/finance';
import { compactInr, inr, num } from '../lib/format';
import { cx } from '../lib/cx';
import { navigate } from '../lib/hooks';
import type { ScholarshipApplication, ScholarshipStatus } from '../types';

const STATUS_TONE: Record<ScholarshipStatus, 'success' | 'warning' | 'primary' | 'danger'> = {
  Approved: 'success',
  Pending: 'warning',
  'Potential Match (Verify)': 'primary',
  'Incomplete Docs': 'danger',
};

const SCHEME_ICON = { landmark: Landmark, building: Building2, award: Award, sparkles: Sparkles };

export default function Scholarships() {
  const { scholarships, updateScholarship, pushToast } = useApp();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | ScholarshipStatus>('all');
  const [scheme, setScheme] = useState('all');
  const [reviewTarget, setReviewTarget] = useState<ScholarshipApplication | null>(null);
  const [decision, setDecision] = useState<ScholarshipStatus>('Approved');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scholarships.filter((s) => {
      if (status !== 'all' && s.status !== status) return false;
      if (scheme !== 'all' && s.scheme !== scheme) return false;
      if (!q) return true;
      return (
        s.student.toLowerCase().includes(q) ||
        s.roll.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    });
  }, [scholarships, query, status, scheme]);

  const counts = useMemo(() => {
    const c = { Approved: 0, Pending: 0, 'Potential Match (Verify)': 0, 'Incomplete Docs': 0 } as Record<ScholarshipStatus, number>;
    scholarships.forEach((s) => { c[s.status] += 1; });
    return c;
  }, [scholarships]);

  return (
    <>
      <Header
        title="Scholarship Tracker"
        kicker={`${SCHOLARSHIP_STATS.active} active holders · ${compactInr(SCHOLARSHIP_STATS.disbursed)} disbursed AY 2026-27`}
        badge={<Badge tone="primary" icon={Sparkles}>AI assist</Badge>}
        actions={
          <>
            <Button size="sm" variant="ghost" icon={Sparkles} onClick={() => navigate('/workflow?prompt=scholarship')}>
              Run eligibility match
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon={ExternalLink}
              onClick={() => pushToast({ title: 'MahaDBT portal opened', description: 'Nodal Officer session · SSO handoff', tone: 'info' })}
            >
              MahaDBT portal
            </Button>
          </>
        }
      />

      <PageScroll>
        <PageStack>
          {/* Scheme cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {SCHOLARSHIP_SCHEMES.map((s) => {
              const Icon = SCHEME_ICON[s.icon];
              return (
                <div
                  key={s.id}
                  className={cx(
                    'group flex flex-col rounded-xl border bg-surface p-3.5 transition-all duration-120 hover:-translate-y-px',
                    s.accent === 'warning' ? 'border-warning/30 bg-warning-soft/20' : 'border-line hover:border-primary/25',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={cx(
                        'flex h-7 w-7 items-center justify-center rounded-lg',
                        s.accent === 'primary' && 'bg-primary-tint text-primary-tint-fg',
                        s.accent === 'info' && 'bg-info-soft text-info',
                        s.accent === 'success' && 'bg-success-soft text-success',
                        s.accent === 'warning' && 'bg-warning-soft text-warning',
                      )}
                    >
                      <Icon size={14} strokeWidth={2.1} aria-hidden />
                    </span>
                    {s.accent === 'warning' ? (
                      <Badge tone="warning" icon={CircleAlert}>Verify</Badge>
                    ) : (
                      <Badge tone="success" icon={TrendingUp}>{Math.round((s.approved / s.applicants) * 100)}%</Badge>
                    )}
                  </div>
                  <h3 className="mt-2 font-display text-[13.5px] font-bold leading-4 text-ink">{s.name}</h3>
                  <p className="mt-0.5 line-clamp-2 text-[10.5px] leading-4 text-muted">{s.description}</p>
                  <div className="mt-2.5 grid grid-cols-2 gap-1.5 border-t border-line pt-2 text-[10px]">
                    <div>
                      <p className="text-muted">Applicants</p>
                      <p className="font-display text-[14px] font-bold tabular-nums text-ink">{num(s.applicants)}</p>
                    </div>
                    <div>
                      <p className="text-muted">Disbursed</p>
                      <p className="font-display text-[14px] font-bold tabular-nums text-ink">{s.disbursed ? compactInr(s.disbursed) : '—'}</p>
                    </div>
                  </div>
                  <Progress
                    value={(s.approved / s.applicants) * 100}
                    className="mt-2"
                    height="h-1"
                    tone={s.accent === 'warning' ? 'rgb(var(--warning))' : 'rgb(var(--primary))'}
                  />
                  <p className="mt-1.5 text-[9.5px] text-muted">{s.authority}</p>
                </div>
              );
            })}
          </div>

          {/* Mandatory AI disclosure */}
          <div className="flex items-start gap-2.5 rounded-xl border border-info/25 bg-info-soft px-3.5 py-3">
            <Info size={15} className="mt-px shrink-0 text-info" aria-hidden />
            <div>
              <p className="text-[12px] font-semibold text-info">AI only flags potential candidates — it never approves scholarships.</p>
              <p className="mt-0.5 text-[11px] leading-4 text-info/90">
                Official approval requires Nodal Officer verification of income, caste and domicile documents through DigiLocker.
                {' '}<span className="font-semibold">Potential Match (Verify)</span> records must not be disbursed or communicated as approved.
              </p>
            </div>
          </div>

          {/* 4-state summary */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {([
              ['Approved', counts.Approved, 'success', BadgeCheck],
              ['Pending', counts.Pending, 'warning', CircleAlert],
              ['Potential Match (Verify)', counts['Potential Match (Verify)'], 'primary', Sparkles],
              ['Incomplete Docs', counts['Incomplete Docs'], 'danger', XCircle],
            ] as const).map(([label, value, tone, Icon]) => (
              <button
                key={label}
                type="button"
                onClick={() => setStatus(status === label ? 'all' : (label as ScholarshipStatus))}
                className={cx(
                  'flex items-center gap-3 rounded-xl border bg-surface p-3 text-left transition-all duration-120 hover:border-primary/25',
                  status === label ? 'border-primary/40 ring-1 ring-primary/15' : 'border-line',
                )}
              >
                <span
                  className={cx(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                    tone === 'success' && 'bg-success-soft text-success',
                    tone === 'warning' && 'bg-warning-soft text-warning',
                    tone === 'primary' && 'bg-primary-tint text-primary-tint-fg',
                    tone === 'danger' && 'bg-danger-soft text-danger',
                  )}
                >
                  <Icon size={15} />
                </span>
                <div>
                  <p className="font-display text-[19px] font-bold leading-5 tabular-nums text-ink">{value}</p>
                  <p className="text-[10px] text-muted">{label}</p>
                </div>
              </button>
            ))}
          </div>

          <SectionCard
            title="Applications"
            subtitle="Nodal verification state machine · sample of active queue"
            icon={Wallet}
            actions={
              <Badge tone="outline" icon={Lock}>Nodal-gated</Badge>
            }
            flush
          >
            <div className="flex flex-wrap items-center gap-2 border-y border-line px-4 py-2.5">
              <div className="relative min-w-[220px] flex-1 sm:max-w-[320px]">
                <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search application ID, student or roll…" aria-label="Search applications" className="field-input pl-8" />
              </div>
              <Select value={scheme} onChange={(e) => setScheme(e.target.value)} aria-label="Scheme" className="w-auto min-w-[170px]">
                <option value="all">All schemes</option>
                {SCHOLARSHIP_SCHEMES.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
              </Select>
              <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Status" className="w-auto min-w-[170px]">
                <option value="all">All statuses</option>
                {(['Approved', 'Pending', 'Potential Match (Verify)', 'Incomplete Docs'] as ScholarshipStatus[]).map((s) => <option key={s}>{s}</option>)}
              </Select>
              <span className="ml-auto text-[10.5px] text-muted">{filtered.length} applications</span>
            </div>
            <div className="overflow-x-auto scroll-thin">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr>
                    <Th>Application ID</Th>
                    <Th>Student</Th>
                    <Th>Scheme &amp; Category</Th>
                    <Th align="right">Amount</Th>
                    <Th>Status</Th>
                    <Th align="right">Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <Tr key={s.id} className="row-hover">
                      <Td><span className="mono text-[11px] text-ink">{s.id}</span></Td>
                      <Td>
                        <p className="text-[12.5px] font-semibold text-ink">{s.student}</p>
                        <p className="mono text-[10px] text-muted">{s.roll}</p>
                      </Td>
                      <Td>
                        <p className="max-w-[210px] truncate text-[11.5px] text-ink">{s.scheme}</p>
                        <p className="text-[10px] text-muted">{s.category}</p>
                      </Td>
                      <Td align="right"><span className="mono text-[12px] font-medium tabular-nums text-ink">{inr(s.amount)}</span></Td>
                      <Td>
                        <Badge tone={STATUS_TONE[s.status]} dot>{s.status}</Badge>
                        {s.verifiedBy && <p className="mt-0.5 max-w-[160px] truncate text-[9px] text-muted">{s.verifiedBy}</p>}
                      </Td>
                      <Td align="right">
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => {
                            setReviewTarget(s);
                            setDecision(s.status === 'Approved' ? 'Approved' : 'Approved');
                          }}
                        >
                          Review
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><Td colSpan={6} align="center" className="py-10 text-sm text-muted">No applications match those filters.</Td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-surface-low/60 px-4 py-2.5 text-[11px] text-muted">
              <TableFooterMeta shown={filtered.length} total={scholarships.length} unit="applications" />
              <span className="flex items-center gap-1.5"><Lock size={10} /> Approvals require Nodal Officer + DigiLocker verification</span>
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <SectionCard title="Disbursement by scheme" subtitle="AY 2026-27 · released YTD" icon={Wallet} className="lg:col-span-2">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { label: 'NSP Central', value: 96_40_000, pctOf: 38, color: 'rgb(var(--primary))' },
                  { label: 'MahaDBT', value: 69_20_000, pctOf: 28, color: 'rgb(var(--info))' },
                  { label: 'Institutional', value: 24_80_000, pctOf: 10, color: 'rgb(var(--success))' },
                ].map((d) => (
                  <div key={d.label} className="rounded-lg border border-line p-2.5">
                    <p className="text-[10px] text-muted">{d.label}</p>
                    <p className="font-display text-[16px] font-bold tabular-nums text-ink">{compactInr(d.value)}</p>
                    <Progress value={d.pctOf * 2.5} className="mt-1.5" height="h-1" tone={d.color} />
                    <p className="mt-1 text-[9px] text-muted">{d.pctOf}% of ₹2.48 Cr</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between rounded-lg border border-line bg-surface-low px-2.5 py-2 text-[10.5px]">
                <span className="text-muted">Awaiting nodal verification</span>
                <span className="font-mono font-semibold tabular-nums text-warning">{inr(1_42_00_000)}</span>
              </div>
            </SectionCard>
            <SectionCard title="Compliance" subtitle="Document verification status" icon={Lock}>
              <ul className="space-y-1.5">
                {[
                  ['Aadhaar-linked applications', '98.2%'],
                  ['Income certificate on DigiLocker', '91.4%'],
                  ['Caste validity verified', '88.7%'],
                  ['Domicile certificate (MH)', '94.1%'],
                ].map(([l, v]) => (
                  <li key={l} className="flex items-center justify-between border-b border-line/70 pb-1.5 text-[11px]">
                    <span className="text-muted">{l}</span>
                    <span className="font-mono tabular-nums text-ink">{v}</span>
                  </li>
                ))}
              </ul>
              <Button size="xs" variant="ghost" icon={ExternalLink} className="mt-2 px-0" onClick={() => pushToast({ title: 'DigiLocker consent dashboard', description: '1,284 records reconciled', tone: 'info' })}>
                Open DigiLocker sync log
              </Button>
            </SectionCard>
          </div>
        </PageStack>
      </PageScroll>

      <Modal
        open={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
        title={reviewTarget ? `${reviewTarget.id}` : ''}
        subtitle={reviewTarget ? `${reviewTarget.student} · ${reviewTarget.roll} · ${reviewTarget.scheme}` : ''}
        icon={<Award size={16} className="text-primary-tint-fg" />}
        footer={
          <>
            <Button size="sm" variant="ghost" onClick={() => setReviewTarget(null)}>Cancel</Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={decision === 'Approved'}
              onClick={() => { if (reviewTarget) updateScholarship(reviewTarget.id, 'Incomplete Docs'); setReviewTarget(null); }}
            >
              Mark incomplete
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={Check}
              onClick={() => {
                if (reviewTarget) updateScholarship(reviewTarget.id, decision);
                setReviewTarget(null);
              }}
            >
              Record nodal approval
            </Button>
          </>
        }
      >
        {reviewTarget && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {[
                ['Application', reviewTarget.id],
                ['Category', reviewTarget.category],
                ['Amount', inr(reviewTarget.amount)],
                ['Current status', reviewTarget.status],
              ].map(([l, v]) => (
                <div key={l} className="rounded-lg border border-line bg-surface-low px-2.5 py-2">
                  <p className="text-[9.5px] uppercase tracking-wide text-muted">{l}</p>
                  <p className={cx('mt-0.5 text-[11.5px] font-semibold text-ink', l === 'Amount' && 'font-mono tabular-nums')}>{v}</p>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-warning/25 bg-warning-soft/60 px-2.5 py-2 text-[10.5px] leading-4 text-warning">
              <p className="font-semibold">Approval checklist</p>
              <p className="mt-1">✓ Income certificate verified on DigiLocker (Nov 2026)</p>
              <p>✓ Caste certificate validity — 31 Mar 2027</p>
              <p>✓ Domicile certificate (Maharashtra)</p>
              <p className="mt-1 text-warning/90">AI matched this candidate; the decision below is your explicit human approval.</p>
            </div>
            <Field label="Decision">
              <Select value={decision} onChange={(e) => setDecision(e.target.value as ScholarshipStatus)}>
                <option value="Approved">Approve (nodal verified)</option>
                <option value="Pending">Keep pending</option>
                <option value="Incomplete Docs">Incomplete documents</option>
              </Select>
            </Field>
          </div>
        )}
      </Modal>
    </>
  );
}
