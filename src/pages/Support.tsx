import { useMemo, useState } from 'react';
import { BadgeCheck, Clock3, FileCheck2, Headphones, Inbox, Plus, Search, TicketCheck, Wallet } from 'lucide-react';
import { Header, PageScroll, PageStack } from '../components/layout/Header';
import { Badge, Button, SectionCard } from '../components/ui/primitives';
import { Field, SearchInput, Select } from '../components/ui/Form';
import { Modal } from '../components/ui/Modal';
import { TableFooterMeta, Td, Th, Tr } from '../components/ui/Table';
import { useApp } from '../store/AppStore';
import { SUPPORT_STATS } from '../data/seed/finance';
import { fmtDate } from '../lib/format';
import { cx } from '../lib/cx';
import { useDebounced } from '../lib/hooks';
import type { SupportTicket, TicketStatus } from '../types';

const STATUS_TONE: Record<TicketStatus, 'success' | 'warning' | 'info'> = {
  Ready: 'success',
  'In Review': 'warning',
  Assigned: 'info',
};

const PRIORITY_TONE = {
  High: 'danger',
  Medium: 'warning',
  Low: 'neutral',
} as const;

export default function Support() {
  const { tickets, updateTicket, pushToast } = useApp();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | TicketStatus>('all');
  const [newOpen, setNewOpen] = useState(false);
  const [detail, setDetail] = useState<SupportTicket | null>(null);
  const debounced = useDebounced(query, 120);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return tickets.filter((t) => {
      if (status !== 'all' && t.status !== status) return false;
      if (!q) return true;
      return t.id.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q) || t.requester.toLowerCase().includes(q);
    });
  }, [tickets, debounced, status]);

  return (
    <>
      <Header
        title="Student Support"
        kicker="Central helpdesk · certificates, fee queries, hostel NOCs & DigiLocker help"
        badge={<Badge tone="info" icon={Headphones}>2.4 h avg response</Badge>}
        actions={
          <>
            <Button size="sm" variant="ghost" icon={BadgeCheck} onClick={() => pushToast({ title: 'SLA report generated', description: 'November helpdesk performance · PDF ready', tone: 'success' })}>
              SLA report
            </Button>
            <Button size="sm" variant="primary" icon={Plus} onClick={() => setNewOpen(true)}>New ticket</Button>
          </>
        }
      />

      <PageScroll>
        <PageStack>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {[
              { label: 'Open Tickets', value: '42', meta: '8 high priority', icon: Inbox, chip: 'bg-primary-tint text-primary-tint-fg', tone: 'text-ink' },
              { label: 'Certificate Requests', value: '17', meta: 'Bonafide · transcript · NOC', icon: FileCheck2, chip: 'bg-info-soft text-info', tone: 'text-info' },
              { label: 'Fee Queries', value: '11', meta: 'Reconciliation & receipts', icon: Wallet, chip: 'bg-warning-soft text-warning', tone: 'text-warning' },
              { label: 'Avg Response', value: SUPPORT_STATS.avgResponse, meta: 'Target ≤ 4 h · 1h off SLA', icon: Clock3, chip: 'bg-success-soft text-success', tone: 'text-success' },
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

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
            <SectionCard className="xl:col-span-8" title="Helpdesk queue" subtitle="Tickets by state · click to triage" icon={TicketCheck} flush>
              <div className="flex flex-wrap items-center gap-2 border-y border-line px-4 py-2.5">
                <SearchInput value={query} onChange={setQuery} placeholder="Search ticket, student or subject…" className="min-w-[220px] flex-1 sm:max-w-[300px]" />
                <Select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Status" className="w-auto min-w-[130px]">
                  <option value="all">All states</option>
                  <option value="Ready">Ready</option>
                  <option value="In Review">In Review</option>
                  <option value="Assigned">Assigned</option>
                </Select>
                <span className="ml-auto text-[10.5px] text-muted">{filtered.length} tickets</span>
              </div>
              <div className="overflow-x-auto scroll-thin">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr>
                      <Th>Ticket</Th>
                      <Th>Requester</Th>
                      <Th>Type</Th>
                      <Th>Opened</Th>
                      <Th>Priority</Th>
                      <Th>State</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t) => (
                      <Tr key={t.id} interactive onClick={() => setDetail(t)}>
                        <Td>
                          <p className="mono text-[10.5px] text-ink">{t.id}</p>
                          <p className="max-w-[230px] truncate text-[11px] text-muted">{t.subject}</p>
                        </Td>
                        <Td>
                          <p className="text-[11.5px] font-medium text-ink">{t.requester}</p>
                          <p className="mono text-[9.5px] text-muted">{t.roll}</p>
                        </Td>
                        <Td><span className="text-[10.5px] text-muted">{t.type}</span></Td>
                        <Td><span className="font-mono text-[10px] tabular-nums text-muted">{fmtDate(t.opened)}</span></Td>
                        <Td><Badge tone={PRIORITY_TONE[t.priority]}>{t.priority}</Badge></Td>
                        <Td><Badge tone={STATUS_TONE[t.status]} dot>{t.status}</Badge></Td>
                      </Tr>
                    ))}
                    {filtered.length === 0 && <tr><Td colSpan={6} align="center" className="py-10 text-sm text-muted">No tickets match.</Td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-line bg-surface-low/60 px-4 py-2 text-[10.5px] text-muted">
                <TableFooterMeta shown={filtered.length} total={tickets.length} unit="tickets" />
                <span className="flex items-center gap-1"><Search size={10} /> Triage SLA · high priority 2 h</span>
              </div>
            </SectionCard>

            <div className="flex flex-col gap-3 xl:col-span-4">
              <SectionCard title="Certificate pipeline" subtitle="Issuance status this week" icon={FileCheck2}>
                <ul className="space-y-1.5">
                  {[['Bonafide', 46, 'bg-primary'], ['Transcripts', 18, 'bg-info'], ['Hostel NOC', 12, 'bg-success'], ['ID cards', 9, 'bg-warning']].map(([l, v, c]) => (
                    <li key={l as string} className="flex items-center gap-2">
                      <span className="w-20 text-[10.5px] text-muted">{l}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-high">
                        <div className={cx('h-full rounded-full', c as string)} style={{ width: `${((v as number) / 46) * 100}%` }} />
                      </div>
                      <span className="w-6 text-right font-mono text-[10px] tabular-nums text-ink">{v}</span>
                    </li>
                  ))}
                </ul>
              </SectionCard>
              <SectionCard title="Support agents" subtitle="Ownership & load" icon={Headphones}>
                <ul className="space-y-1.5">
                  {[['Aarti Kulkarni', 'Front desk · 8 open'], ['Accounts Desk', 'Fee queries · 5 open'], ['Scholarship Cell', 'DigiLocker · 4 open'], ['Hostel Office', 'NOC · 3 open']].map(([n, d]) => (
                    <li key={n} className="flex items-center justify-between rounded-md border border-line px-2 py-1.5">
                      <div>
                        <p className="text-[11px] font-medium text-ink">{n}</p>
                        <p className="text-[9px] text-muted">{d}</p>
                      </div>
                      <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
                    </li>
                  ))}
                </ul>
              </SectionCard>
            </div>
          </div>
        </PageStack>
      </PageScroll>

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? `${detail.id} · ${detail.type}` : ''}
        subtitle={detail ? `${detail.requester} · ${detail.roll} · ${detail.dept}` : ''}
        icon={<TicketCheck size={16} className="text-primary-tint-fg" />}
        footer={
          <>
            <Button size="sm" variant="ghost" onClick={() => setDetail(null)}>Close</Button>
            {detail && detail.status !== 'Ready' && (
              <Button size="sm" variant="secondary" onClick={() => { updateTicket(detail.id, 'Ready'); setDetail(null); }}>Mark ready</Button>
            )}
            {detail && (
              <Button size="sm" variant="primary" icon={BadgeCheck} onClick={() => { updateTicket(detail.id, 'Assigned'); setDetail(null); }}>
                Assign to agent
              </Button>
            )}
          </>
        }
      >
        {detail && (
          <div className="space-y-3">
            <div className="rounded-lg border border-line bg-surface-low px-3 py-2.5">
              <p className="text-[12.5px] font-semibold text-ink">{detail.subject}</p>
              <p className="mt-1 text-[10.5px] text-muted">Opened {fmtDate(detail.opened)} · {detail.agent}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['Department', detail.dept],
                ['Priority', detail.priority],
                ['State', detail.status],
                ['Owner', detail.agent],
              ].map(([l, v]) => (
                <div key={l} className="rounded-lg border border-line px-2.5 py-2">
                  <p className="text-[9px] uppercase tracking-wide text-muted">{l}</p>
                  <p className="text-[11px] font-medium text-ink">{v}</p>
                </div>
              ))}
            </div>
            <div className="rounded-md border border-info/25 bg-info-soft px-2.5 py-2 text-[10.5px] leading-4 text-info">
              Certificates are digitally signed and delivered to the student portal. Fee queries route to the accounts desk with the receipt reference attached.
            </div>
          </div>
        )}
      </Modal>

      <NewTicketModal open={newOpen} onClose={() => setNewOpen(false)} onCreated={() => pushToast({ title: 'Ticket created', description: 'Slot queued for the next agent · SLA 4 h', tone: 'success' })} />
    </>
  );
}

function NewTicketModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New support ticket"
      subtitle="Log a request on behalf of a student"
      icon={<Plus size={16} className="text-primary-tint-fg" />}
      footer={
        <>
          <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button size="sm" variant="primary" icon={Plus} onClick={() => { onCreated(); onClose(); }}>Create ticket</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Requester name" className="sm:col-span-2"><input className="field-input" placeholder="Student full name" /></Field>
        <Field label="Roll number"><input className="field-input mono" placeholder="2023CSEB104" /></Field>
        <Field label="Request type">
          <Select defaultValue="Bonafide Certificate">
            {['Bonafide Certificate', 'Transcript', 'Fee Query', 'Hostel NOC', 'ID Card', 'DigiLocker Help'].map((t) => <option key={t}>{t}</option>)}
          </Select>
        </Field>
        <Field label="Subject" className="sm:col-span-2"><input className="field-input" placeholder="Short description of the request" /></Field>
        <Field label="Priority">
          <Select defaultValue="Medium">
            {['High', 'Medium', 'Low'].map((p) => <option key={p}>{p}</option>)}
          </Select>
        </Field>
        <Field label="Assign to">
          <Select defaultValue="Aarti Kulkarni">
            {['Aarti Kulkarni', 'Accounts Desk', 'Scholarship Cell', 'Hostel Office', 'Registrar Office'].map((a) => <option key={a}>{a}</option>)}
          </Select>
        </Field>
      </div>
    </Modal>
  );
}
