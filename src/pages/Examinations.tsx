import { useMemo, useState } from 'react';
import { BadgeCheck, CalendarClock, ClipboardCheck, FileCheck2, Landmark, Lock, ShieldCheck, Sparkles, TriangleAlert } from 'lucide-react';
import { Header, PageScroll, PageStack } from '../components/layout/Header';
import { Badge, Button, SectionCard } from '../components/ui/primitives';
import { SearchInput, Select } from '../components/ui/Form';
import { ConfirmDialog, Modal } from '../components/ui/Modal';
import { TableFooterMeta, TableShell, Td, Th, Tr } from '../components/ui/Table';
import { useApp } from '../store/AppStore';
import { DEPARTMENTS } from '../data/departments';
import { daysBetween, fmtDate, fmtDateTime } from '../lib/format';
import { cx } from '../lib/cx';
import { navigate, useDebounced } from '../lib/hooks';
import type { ExamStatus } from '../types';

export default function Examinations() {
  const { exams, publishResults, lastResultsPublish, pushToast } = useApp();
  const [query, setQuery] = useState('');
  const [dept, setDept] = useState('all');
  const [status, setStatus] = useState<'all' | ExamStatus>('all');
  const [signOpen, setSignOpen] = useState(false);
  const [signoff, setSignoff] = useState('');
  const [ack, setAck] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const debounced = useDebounced(query, 120);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return exams.filter((e) => {
      if (dept !== 'all' && e.dept !== dept) return false;
      if (status !== 'all' && e.status !== status) return false;
      if (!q) return true;
      return e.code.toLowerCase().includes(q) || e.subject.toLowerCase().includes(q) || e.invigilator.toLowerCase().includes(q);
    });
  }, [exams, debounced, dept, status]);

  const verified = exams.filter((e) => e.status === 'Marks Verified').length;
  const pending = exams.length - verified;
  const firstExam = [...exams].sort((a, b) => a.date.localeCompare(b.date))[0];

  return (
    <>
      <Header
        title="Examination Management"
        kicker="Odd semester end examinations · Dec 2026 · Controller of Examinations"
        badge={<Badge tone="warning" icon={Lock}>Audit Protected</Badge>}
        actions={
          <>
            <Button size="sm" variant="ghost" icon={ShieldCheck} onClick={() => pushToast({ title: 'Audit pack exported', description: 'All exam actions signed · SHA-256 manifest', tone: 'success' })}>
              Audit pack
            </Button>
            <Button size="sm" variant="primary" icon={FileCheck2} onClick={() => setSignOpen(true)}>
              Publish Results
            </Button>
          </>
        }
      />

      <PageScroll>
        <PageStack>
          <div className="rounded-xl border border-warning/25 bg-warning-soft/50 px-3.5 py-2.5">
            <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-warning">
              <Lock size={12} /> Examination records are audit protected.
            </p>
            <p className="mt-0.5 text-[10.5px] leading-4 text-warning/90">
              Every edit is appended to an immutable audit chain with user, timestamp and diff. Publishing results requires Examination Admin sign-off, and no bulk edit can bypass verification.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[
              { label: 'Scheduled papers', value: '28', meta: `Starts ${fmtDate(firstExam.date)}`, icon: CalendarClock, tone: 'text-ink', chip: 'bg-primary-tint text-primary-tint-fg' },
              { label: 'Marks verified', value: String(verified), meta: `${Math.round((verified / exams.length) * 100)}% of this view`, icon: ClipboardCheck, tone: 'text-success', chip: 'bg-success-soft text-success' },
              { label: 'Awaiting verification', value: String(pending), meta: 'Blocking result publish', icon: TriangleAlert, tone: 'text-warning', chip: 'bg-warning-soft text-warning' },
              { label: 'Halls allocated', value: '14', meta: '2 seat-layout revisions', icon: Landmark, tone: 'text-ink', chip: 'bg-info-soft text-info' },
            ].map((k) => (
              <div key={k.label} className="rounded-xl border border-line bg-surface p-4">
                <div className="flex items-start justify-between">
                  <p className="text-xs font-medium text-muted">{k.label}</p>
                  <span className={cx('flex h-6 w-6 items-center justify-center rounded-md', k.chip)}><k.icon size={13} /></span>
                </div>
                <p className={cx('mt-1.5 font-display text-[24px] font-bold leading-none tabular-nums', k.tone)}>{k.value}</p>
                <p className="mt-2 text-[10px] text-muted">{k.meta}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface p-3">
            <SearchInput value={query} onChange={setQuery} placeholder="Search subject code, name or invigilator…" className="min-w-[250px] flex-1 sm:max-w-[360px]" />
            <Select value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Department" className="w-auto min-w-[150px]">
              <option value="all">All departments</option>
              {DEPARTMENTS.map((d) => <option key={d.code} value={d.code}>{d.code} · {d.short}</option>)}
            </Select>
            <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Status" className="w-auto min-w-[150px]">
              <option value="all">All statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Marks Verified">Marks Verified</option>
            </Select>
            <span className="ml-auto text-[10.5px] text-muted">{filtered.length} papers</span>
          </div>

          <TableShell footer={<TableFooterMeta shown={filtered.length} total={exams.length} unit="papers" />}>
            <thead>
              <tr>
                <Th>Code</Th>
                <Th>Subject &amp; Type</Th>
                <Th>Date / Session</Th>
                <Th>Hall &amp; Invigilator</Th>
                <Th align="right">Seats</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const daysAway = -daysBetween(e.date, e.date);
                void daysAway;
                return (
                  <Tr key={e.id} className="row-hover">
                    <Td><span className="mono text-[11.5px] font-medium text-ink">{e.code}</span></Td>
                    <Td>
                      <p className="text-[12px] font-medium text-ink">{e.subject}</p>
                      <span className="text-[10px] text-muted">{e.type} · {e.dept} Sem {e.semester}</span>
                    </Td>
                    <Td>
                      <p className="font-mono text-[10.5px] tabular-nums text-ink">{fmtDate(e.date)}</p>
                      <span className="text-[10px] text-muted">{e.session} · 10:00–13:00</span>
                    </Td>
                    <Td>
                      <p className="text-[11px] text-ink">{e.hall}</p>
                      <span className="text-[10px] text-muted">{e.invigilator}</span>
                    </Td>
                    <Td align="right"><span className="font-mono text-[11px] tabular-nums text-muted">{180 + (e.semester * 6)}</span></Td>
                    <Td>
                      <Badge tone={e.status === 'Marks Verified' ? 'success' : 'info'} dot>
                        {e.status}
                      </Badge>
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </TableShell>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <SectionCard title="Verification progress" subtitle="Marks verified by department" icon={ClipboardCheck} className="lg:col-span-2">
              <ul className="space-y-2">
                {DEPARTMENTS.filter((d) => exams.some((e) => e.dept === d.code)).map((d) => {
                  const deptExams = exams.filter((e) => e.dept === d.code);
                  const done = deptExams.filter((e) => e.status === 'Marks Verified').length;
                  return (
                    <li key={d.code} className="flex items-center gap-2.5">
                      <span className="mono w-10 shrink-0 text-[10px] text-muted">{d.code}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-high">
                        <div className={cx('h-full rounded-full', done === deptExams.length ? 'bg-success' : 'bg-primary')} style={{ width: `${(done / deptExams.length) * 100}%` }} />
                      </div>
                      <span className="w-10 text-right font-mono text-[10px] tabular-nums text-muted">{done}/{deptExams.length}</span>
                    </li>
                  );
                })}
              </ul>
            </SectionCard>
            <SectionCard title="Result publication" subtitle="Examination Admin gate" icon={Lock}>
              <div className="rounded-lg border border-line bg-surface-low px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-wide text-muted">Last publish</p>
                <p className="font-mono text-[11px] text-ink">{lastResultsPublish ? fmtDateTime(lastResultsPublish) : 'Not published this cycle'}</p>
              </div>
              <p className="mt-2 text-[10.5px] leading-4 text-muted">
                Publishing requires the Examination Admin passphrase. Results become visible to students and transcripts are locked for 72 h.
              </p>
              <Button size="sm" variant="primary" full className="mt-2.5" icon={FileCheck2} onClick={() => setSignOpen(true)}>
                Publish results
              </Button>
              <Button size="sm" variant="ghost" full className="mt-1" icon={Sparkles} onClick={() => navigate('/workflow?prompt=exam')}>
                AI readiness audit
              </Button>
            </SectionCard>
          </div>
          <p className="text-[10.5px] leading-4 text-muted">
            Examination data is retained for 10 years under UGC (Marks &amp; Records) regulations. Invigilator substitution must be logged at least 24 h before the paper.
          </p>
        </PageStack>
      </PageScroll>

      <Modal
        open={signOpen}
        onClose={() => setSignOpen(false)}
        title="Publish examination results"
        subtitle="Audit-protected action · requires Examination Admin sign-off"
        icon={<Lock size={16} className="text-warning" />}
        footer={
          <>
            <Button size="sm" variant="ghost" onClick={() => setSignOpen(false)}>Cancel</Button>
            <Button
              size="sm"
              variant="primary"
              icon={BadgeCheck}
              disabled={!ack || signoff.trim().length < 4}
              onClick={() => { setSignOpen(false); setConfirmOpen(true); }}
            >
              Sign &amp; publish
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="rounded-lg border border-warning/25 bg-warning-soft/60 px-3 py-2.5 text-[10.5px] leading-4 text-warning">
            <p className="font-semibold">This action is irreversible for 72 hours.</p>
            <p className="mt-0.5">Publishing releases marks to 4,820 students and freezes the grade ledger. Re-evaluation windows open automatically 24 h later.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10.5px]">
            {[
              ['Papers to publish', String(exams.length)],
              ['Marks verified', `${verified}`],
              ['Pending verification', `${pending}`],
              ['Controller', 'Dr. Rajeshwar Rao'],
            ].map(([l, v]) => (
              <div key={l} className="rounded-lg border border-line px-2.5 py-2">
                <p className="text-[9px] uppercase tracking-wide text-muted">{l}</p>
                <p className="font-medium text-ink">{v}</p>
              </div>
            ))}
          </div>
          <div>
            <label htmlFor="signoff" className="mb-1.5 block text-xs font-medium text-muted">Examination Admin passphrase</label>
            <input
              id="signoff"
              type="password"
              value={signoff}
              onChange={(e) => setSignoff(e.target.value)}
              placeholder="Enter passphrase (demo: any 4+ chars)"
              className="field-input mono"
              autoComplete="off"
            />
          </div>
          <label className="flex cursor-pointer items-start gap-2 rounded-md border border-line p-2.5 text-[10.5px] leading-4">
            <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-0.5 h-3.5 w-3.5 rounded border-line accent-primary" />
            <span className="text-ink">I confirm that all published papers have a completed moderation record and that release is approved by the Controller of Examinations.</span>
          </label>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          publishResults();
          setSignoff('');
          setAck(false);
        }}
        title="Publish results to all students?"
        description="Marks for 28 papers will be released to the student portal and email. This action is logged and audit protected."
        confirmLabel="Publish now"
        tone="primary"
      />
    </>
  );
}
