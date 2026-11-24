import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Eye,
  FileWarning,
  Lock,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  Search,
  TriangleAlert,
  UserCheck,
} from 'lucide-react';
import { Header, PageScroll, PageStack } from '../components/layout/Header';
import { Badge, Button, Progress, SectionCard } from '../components/ui/primitives';
import { Field, SearchInput, Select, Textarea } from '../components/ui/Form';
import { Modal } from '../components/ui/Modal';
import { TableFooterMeta, TableShell, Td, Th, Tr } from '../components/ui/Table';
import { useApp } from '../store/AppStore';
import { GRIEVANCE_CATEGORIES_LIST, GRIEVANCE_STATS } from '../data/seed/finance';
import { fmtDate } from '../lib/format';
import { cx } from '../lib/cx';
import { navigate, useDebounced } from '../lib/hooks';
import type { Grievance, GrievanceStatus } from '../types';

const STATUS_TONE: Record<GrievanceStatus, 'info' | 'warning' | 'danger' | 'success' | 'neutral'> = {
  New: 'info',
  'In Review': 'warning',
  Escalated: 'danger',
  Resolved: 'success',
  Closed: 'neutral',
};

export default function Grievances() {
  const { grievances, updateGrievance } = useApp();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState<'all' | GrievanceStatus>('all');
  const [slaOnly, setSlaOnly] = useState(false);
  const [selected, setSelected] = useState<Grievance | null>(null);
  const [draftStatus, setDraftStatus] = useState<GrievanceStatus>('In Review');
  const [note, setNote] = useState('');
  const debounced = useDebounced(query, 120);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return grievances.filter((g) => {
      if (category !== 'all' && g.category !== category) return false;
      if (status !== 'all' && g.status !== status) return false;
      if (slaOnly && !g.slaBreached) return false;
      if (!q) return true;
      return (
        g.id.toLowerCase().includes(q) ||
        g.subject.toLowerCase().includes(q) ||
        g.student.toLowerCase().includes(q) ||
        g.assignedTo.toLowerCase().includes(q)
      );
    });
  }, [grievances, debounced, category, status, slaOnly]);

  const open = grievances.filter((g) => g.status !== 'Closed' && g.status !== 'Resolved').length;
  const breached = grievances.filter((g) => g.slaBreached).length;
  const confidential = grievances.filter((g) => g.confidential).length;

  const handleOpen = (g: Grievance) => {
    setSelected(g);
    setDraftStatus(g.status);
    setNote('');
  };

  const save = () => {
    if (!selected) return;
    updateGrievance(selected.id, draftStatus);
    setSelected(null);
  };

  return (
    <>
      <Header
        title="Grievance Management"
        kicker={`${open} open · ${breached} SLA breached · ${confidential} confidential ICC case`}
        badge={<Badge tone="danger" icon={TriangleAlert}>SLA watch</Badge>}
        actions={
          <>
            <Button size="sm" variant="ghost" icon={MessageSquare} onClick={() => navigate('/support')}>Helpdesk</Button>
            <Button size="sm" variant="secondary" icon={ShieldAlert} onClick={() => { setSlaOnly(true); setStatus('all'); }}>SLA breached</Button>
          </>
        }
      />

      <PageScroll>
        <PageStack>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: 'Open cases', value: String(open), meta: 'Across 14 categories', tone: 'text-ink', icon: FileWarning },
              { label: 'SLA breached', value: `${breached}`, meta: 'Resolution window 7 days', tone: 'text-danger', icon: TriangleAlert },
              { label: 'SLA met', value: `${GRIEVANCE_STATS.slaMet}%`, meta: '195 of 214 closed', tone: 'text-success', icon: ShieldCheck },
              { label: 'Confidential ICC', value: String(confidential), meta: 'Restricted to ICC + Super Admin', tone: 'text-warning', icon: Lock },
            ].map((k) => (
              <div key={k.label} className="rounded-xl border border-line bg-surface p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-[10.5px] font-medium text-muted">{k.label}</p>
                  <k.icon size={13} className="text-muted" />
                </div>
                <p className={cx('mt-1 font-display text-[22px] font-bold tabular-nums leading-none', k.tone)}>{k.value}</p>
                <p className="mt-1.5 text-[9.5px] text-muted">{k.meta}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-warning/25 bg-warning-soft/50 px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-warning">
              <Lock size={12} /> Confidential ICC cases are excluded from exports and are visible only to ICC members and Super Administrator.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-surface p-3">
            <div className="flex flex-wrap items-center gap-2">
              <SearchInput value={query} onChange={setQuery} placeholder="Search grievance ID, subject, student or owner…" className="min-w-[250px] flex-1 sm:max-w-[360px]" />
              <Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category" className="w-auto min-w-[200px]">
                <option value="all">All categories</option>
                {GRIEVANCE_CATEGORIES_LIST.map((c) => <option key={c} value={c}>{c.replace(' (Confidential)', ' · ICC')}</option>)}
              </Select>
              <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Status" className="w-auto min-w-[130px]">
                <option value="all">All statuses</option>
                {(['New', 'In Review', 'Escalated', 'Resolved', 'Closed'] as GrievanceStatus[]).map((s) => <option key={s}>{s}</option>)}
              </Select>
              <label className="flex cursor-pointer items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-[11px] font-medium text-ink">
                <input type="checkbox" checked={slaOnly} onChange={(e) => setSlaOnly(e.target.checked)} className="h-3 w-3 rounded border-line accent-danger" />
                SLA breached only
              </label>
              <span className="ml-auto text-[10.5px] text-muted">{filtered.length} cases</span>
            </div>
          </div>

          <TableShell footer={<TableFooterMeta shown={filtered.length} total={grievances.length} unit="grievances" />}>
            <thead>
              <tr>
                <Th>Grievance ID</Th>
                <Th>Category</Th>
                <Th>Subject</Th>
                <Th>Raised by</Th>
                <Th>SLA</Th>
                <Th>Status</Th>
                <Th align="right">Owner</Th>
                <Th align="right" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => (
                <Tr key={g.id} interactive onClick={() => handleOpen(g)}>
                  <Td>
                    <span className="mono flex items-center gap-1 text-[10.5px] text-ink">
                      {g.confidential && <Lock size={10} className="text-warning" aria-label="Confidential" />}
                      {g.id}
                    </span>
                  </Td>
                  <Td><span className="text-[10.5px] text-muted">{g.category.replace(' (Confidential)', '')}</span></Td>
                  <Td>
                    <p className="max-w-[280px] truncate text-[12px] font-medium text-ink">
                      {g.confidential ? <em className="text-muted">Details restricted to ICC</em> : g.subject}
                    </p>
                    <p className="text-[9.5px] text-muted">Opened {fmtDate(g.opened)}</p>
                  </Td>
                  <Td><span className="max-w-[140px] truncate text-[11px] text-muted">{g.student}</span></Td>
                  <Td>
                    {g.slaBreached ? (
                      <span className="flex flex-col">
                        <span className="flex items-center gap-1 text-[10.5px] font-semibold text-danger"><TriangleAlert size={10} /> Open {g.daysOpen} days</span>
                        <span className="text-[9px] text-danger/80">SLA breached</span>
                      </span>
                    ) : (
                      <span className="flex flex-col">
                        <span className="text-[10.5px] text-ink">Open {g.daysOpen} days</span>
                        <span className="text-[9px] text-muted">Within SLA</span>
                      </span>
                    )}
                  </Td>
                  <Td><Badge tone={STATUS_TONE[g.status]} dot>{g.status}</Badge></Td>
                  <Td align="right"><span className="text-[10.5px] text-muted">{g.assignedTo}</span></Td>
                  <Td align="right">
                    <Button size="xs" variant="ghost" icon={g.confidential ? Lock : ArrowRight} onClick={(e) => { e.stopPropagation(); handleOpen(g); }}>
                      {g.confidential ? 'ICC' : 'Open'}
                    </Button>
                  </Td>
                </Tr>
              ))}
              {filtered.length === 0 && (
                <tr><Td colSpan={8} align="center" className="py-10 text-sm text-muted">No grievances match those filters.</Td></tr>
              )}
            </tbody>
          </TableShell>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <SectionCard title="SLA performance" subtitle="Rolling 30-day resolution" icon={ShieldCheck}>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-[28px] font-bold tabular-nums text-success">{GRIEVANCE_STATS.slaMet}%</span>
                <Badge tone="success">met</Badge>
              </div>
              <Progress value={GRIEVANCE_STATS.slaMet} className="mt-2" height="h-2" tone="rgb(var(--success))" />
              <div className="mt-2.5 grid grid-cols-2 gap-2 text-[10.5px]">
                <div className="rounded-md bg-surface-low px-2 py-1.5">
                  <p className="text-muted">Avg resolution</p>
                  <p className="font-display text-[14px] font-bold tabular-nums text-ink">{GRIEVANCE_STATS.avgResolution} days</p>
                </div>
                <div className="rounded-md bg-surface-low px-2 py-1.5">
                  <p className="text-muted">Escalated</p>
                  <p className="font-display text-[14px] font-bold tabular-nums text-danger">{GRIEVANCE_STATS.escalated}</p>
                </div>
              </div>
            </SectionCard>
            <SectionCard title="By category" subtitle="Open volume" icon={FileWarning} className="lg:col-span-2">
              <ul className="space-y-1.5">
                {GRIEVANCE_CATEGORIES_LIST.slice(0, 7).map((cat) => {
                  const count = grievances.filter((g) => g.category === cat && g.status !== 'Closed').length;
                  return (
                    <li key={cat} className="flex items-center gap-2">
                      <span className="w-[150px] shrink-0 truncate text-[10.5px] text-muted">{cat.replace(' (Confidential)', '')}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-high">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, count * 25)}%` }} />
                      </div>
                      <span className="w-6 text-right font-mono text-[10px] tabular-nums text-ink">{count}</span>
                    </li>
                  );
                })}
              </ul>
            </SectionCard>
          </div>
        </PageStack>
      </PageScroll>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.id ?? ''}
        subtitle={selected ? `${selected.category} · ${selected.assignedTo} · opened ${fmtDate(selected.opened)}` : ''}
        icon={selected?.confidential ? <Lock size={16} className="text-warning" /> : <ShieldAlert size={16} className="text-primary-tint-fg" />}
        size="lg"
        footer={
          <>
            <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>Cancel</Button>
            <Button size="sm" variant="primary" icon={UserCheck} onClick={save}>Save decision</Button>
          </>
        }
      >
        {selected && (
          <div className="space-y-3">
            <div className="rounded-lg border border-line bg-surface-low px-3 py-2.5">
              <p className="text-[12px] font-semibold text-ink">{selected.confidential ? 'Restricted case — details withheld' : selected.subject}</p>
              <p className="mt-1 text-[11px] leading-4 text-muted">
                {selected.confidential
                  ? 'Only ICC members and the Super Administrator can view this record. Access here is logged.'
                  : selected.body}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10.5px] sm:grid-cols-4">
              {[
                ['Raised by', selected.student],
                ['Roll', selected.roll],
                ['Dept', selected.dept],
                ['Days open', `${selected.daysOpen}`],
              ].map(([l, v]) => (
                <div key={l} className="rounded-lg border border-line px-2 py-1.5">
                  <p className="text-[9px] uppercase tracking-wide text-muted">{l}</p>
                  <p className="truncate font-medium text-ink">{v}</p>
                </div>
              ))}
            </div>
            {selected.slaBreached && (
              <div className="flex items-start gap-2 rounded-lg border border-danger/25 bg-danger-soft px-2.5 py-2">
                <TriangleAlert size={13} className="mt-0.5 shrink-0 text-danger" />
                <p className="text-[10.5px] leading-4 text-danger">SLA breached — {selected.daysOpen} days open against a 7-day window. Escalate to {selected.confidential ? 'ICC Chairperson' : 'Principal'} with the resolution plan.</p>
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Update status">
                <Select value={draftStatus} onChange={(e) => setDraftStatus(e.target.value as GrievanceStatus)}>
                  {(['New', 'In Review', 'Escalated', 'Resolved', 'Closed'] as GrievanceStatus[]).map((s) => <option key={s}>{s}</option>)}
                </Select>
              </Field>
              <div className="rounded-lg border border-line bg-surface-low px-2.5 py-2">
                <p className="text-[9px] uppercase tracking-wide text-muted">Confidentiality</p>
                <p className="mt-0.5 flex items-center gap-1 text-[11px] text-ink">
                  {selected.confidential ? <><Lock size={10} className="text-warning" /> ICC &amp; Super Admin only</> : <><Eye size={10} className="text-muted" /> Department admins can view</>}
                </p>
              </div>
              <Field label="Resolution note" className="sm:col-span-2">
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="What action was taken? Visible to the complainant." />
              </Field>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
