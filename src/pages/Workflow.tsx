import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  BrainCircuit,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCopy,
  Database,
  FileSearch,
  History,
  Lock,
  Radar,
  RotateCcw,
  ScanLine,
  Send,
  ShieldAlert,
  Sparkles,
  ThumbsDown,
  UserRoundCheck,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { Header, PageScroll } from '../components/layout/Header';
import { Badge, Button } from '../components/ui/primitives';
import { useApp } from '../store/AppStore';
import { AGENTS, SUGGESTED_PROMPTS, reportText } from '../lib/workflow';
import { fmtDateTime } from '../lib/format';
import { cx } from '../lib/cx';
import { useCopyToClipboard, useRoute } from '../lib/hooks';
import type { WorkflowRun } from '../types';

const AGENT_ICON: Record<string, LucideIcon> = {
  'Student Data': Database,
  Academic: CalendarDays,
  Scholarship: BadgeCheck,
  Grievance: ShieldAlert,
  Examination: FileSearch,
  Notice: Send,
};

const SUGGESTION_ICON: Record<string, LucideIcon> = {
  radar: Radar,
  sparkles: Sparkles,
  shield: ShieldAlert,
  calendar: CalendarDays,
};

const STEP_ICONS: LucideIcon[] = [BrainCircuit, ScanLine, FileSearch, UserRoundCheck];

type Phase = 'idle' | 'running' | 'ready';

export default function Workflow() {
  const { workflows, runWorkflow, decideWorkflow, audit, pushToast } = useApp();
  const route = useRoute();
  const [prompt, setPrompt] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [activeRun, setActiveRun] = useState<WorkflowRun | null>(null);
  const [lastPrompt, setLastPrompt] = useState('');
  const [completedSteps, setCompletedSteps] = useState(0);
  const [tab, setTab] = useState<'history' | 'audit'>('audit');
  const threadRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const { copied, copy } = useCopyToClipboard();

  // Deep link: /workflow?prompt=attendance
  useEffect(() => {
    const key = route.query.get('prompt');
    if (!key) return;
    const s = SUGGESTED_PROMPTS.find((p) => p.id === key);
    if (s) setPrompt(s.prompt);
    window.setTimeout(() => composerRef.current?.focus(), 120);
  }, [route]);

  const execute = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || phase === 'running') return;
    setPhase('running');
    setLastPrompt(trimmed);
    setActiveRun(null);
    setCompletedSteps(0);
    setPrompt('');

    const run = runWorkflow(trimmed);
    let step = 0;
    const tick = window.setInterval(() => {
      step += 1;
      setCompletedSteps(step);
      if (step >= 4) {
        window.clearInterval(tick);
        setActiveRun(run);
        setPhase('ready');
        window.setTimeout(() => {
          if (typeof threadRef.current?.scrollIntoView === 'function') {
            threadRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 60);
      }
    }, 620);
  };

  const decide = (run: WorkflowRun, status: 'Completed' | 'Rejected') => {
    decideWorkflow(run.id, status);
    setActiveRun((r) => (r && r.id === run.id ? { ...r, status } : r));
  };

  const latest = activeRun ?? null;
  const pendingCount = useMemo(() => workflows.filter((w) => w.status === 'Awaiting Approval').length, [workflows]);
  const approvedCount = useMemo(() => workflows.filter((w) => w.status === 'Completed').length, [workflows]);

  return (
    <>
      <Header
        title="Agentic Workflow"
        kicker="AI orchestrator · 6 agents · human-in-the-loop by default"
        badge={<Badge tone="primary" icon={Sparkles}>AI</Badge>}
        actions={
          <>
            <Button size="sm" variant="ghost" icon={Lock} onClick={() => pushToast({ title: 'RBAC scope', description: 'Super Administrator · read access to 9 modules', tone: 'info' })}>
              RBAC scope
            </Button>
            <Button size="sm" variant="secondary" icon={RotateCcw} onClick={() => { setPhase('idle'); setActiveRun(null); setCompletedSteps(0); setPrompt(''); }}>
              New session
            </Button>
          </>
        }
      />

      <PageScroll className="pb-0">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Orchestrator column */}
          <div className="flex min-w-0 flex-col lg:col-span-8">
            {/* Active agents strip */}
            <div className="mb-3 rounded-xl border border-line bg-surface p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
                  <Bot size={12} /> Active agents
                </p>
                <span className="flex items-center gap-1 text-[10px] text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-soft" /> 6 online · RBAC verified
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-6">
                {AGENTS.map((a) => {
                  const Icon = AGENT_ICON[a.name] ?? Bot;
                  const engaged = latest ? latest.agents.includes(a.name) : false;
                  return (
                    <div
                      key={a.id}
                      className={cx(
                        'flex items-center gap-1.5 rounded-md border px-2 py-1.5 transition-all duration-120',
                        engaged ? 'border-primary/30 bg-primary-tint' : 'border-line bg-surface-low',
                      )}
                      title={a.description}
                    >
                      <Icon size={12} className={engaged ? 'text-primary-tint-fg' : 'text-muted'} />
                      <div className="min-w-0">
                        <p className={cx('truncate text-[10px] font-semibold leading-3', engaged ? 'text-primary-tint-fg' : 'text-ink')}>{a.name}</p>
                        <p className="truncate text-[8.5px] leading-3 text-muted">{engaged ? 'Engaged' : a.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Thread */}
            <div ref={threadRef} className="flex min-h-[320px] flex-col gap-3">
              {phase === 'idle' && !latest && (
                <div className="card flex flex-col items-center px-5 py-8 text-center">
                  <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-tint text-primary-tint-fg">
                    <Sparkles size={20} />
                  </span>
                  <h2 className="font-display text-[18px] font-bold text-ink">What should I prepare for you?</h2>
                  <p className="mt-1 max-w-md text-sm leading-5 text-muted">
                    Ask in plain language. Agents read scoped records, draft an approval-ready output, and wait for you before anything changes.
                  </p>
                  <div className="mt-5 grid w-full max-w-[640px] grid-cols-1 gap-2 sm:grid-cols-2">
                    {SUGGESTED_PROMPTS.map((s) => {
                      const Icon = SUGGESTION_ICON[s.icon] ?? Sparkles;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => execute(s.prompt)}
                          className="group flex items-start gap-2.5 rounded-lg border border-line bg-surface-low p-3 text-left transition-all duration-120 hover:-translate-y-px hover:border-primary/30 hover:bg-primary-tint/40"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-line bg-surface text-muted transition-colors duration-120 group-hover:border-primary/25 group-hover:text-primary">
                            <Icon size={14} />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[12px] font-semibold leading-4 text-ink">{s.title}</span>
                            <span className="mt-0.5 line-clamp-2 block text-[10px] leading-3.5 text-muted">{s.prompt}</span>
                          </span>
                          <ArrowRight size={12} className="ml-auto mt-1 shrink-0 text-muted opacity-0 transition-opacity duration-120 group-hover:opacity-100" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {(phase === 'running' || latest) && (
                <>
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="max-w-[86%] rounded-xl rounded-br-sm bg-primary px-3.5 py-2.5 shadow-sm">
                      <p className="text-[11.5px] leading-4 text-primary-fg/70">You</p>
                      <p className="mt-0.5 whitespace-pre-wrap text-[12.5px] leading-5 text-primary-fg">
                        {latest?.prompt ?? lastPrompt}
                      </p>
                    </div>
                  </div>

                  {/* Execution card */}
                  <div className={cx('card overflow-hidden', latest ? 'animate-fade-in' : '')}>
                    <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface-low/70 px-4 py-2.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-tint text-primary-tint-fg">
                        <BrainCircuit size={13} />
                      </span>
                      <p className="text-[12px] font-semibold text-ink">Orchestrator execution</p>
                      <span className="mono text-[10px] text-muted">{latest?.id ?? 'WF-2026-…'}</span>
                      <span className="ml-auto flex items-center gap-1.5">
                        {latest ? (
                          <StatusBadge status={latest.status} />
                        ) : (
                          <Badge tone="primary" dot>Running</Badge>
                        )}
                      </span>
                    </div>

                    <div className="divide-y divide-line">
                      {([
                        {
                          title: 'Analyzed request',
                          detail: latest
                            ? `Intent classified · routed to ${latest.agents.join(', ')}`
                            : 'Classifying intent and selecting the minimum agent set…',
                          meta: latest ? `${latest.agents.length} agents` : '…',
                        },
                        {
                          title: 'Retrieved authorized records',
                          detail: latest
                            ? `RBAC scope verified for Super Administrator · ${latest.records} records in ${latest.scope}`
                            : 'Verifying RBAC scope and fetching scoped records…',
                          meta: latest ? `${latest.records} records` : '…',
                        },
                        {
                          title: 'Generated draft output',
                          detail: latest ? 'Contextual summary and structured preview table prepared — no records modified.' : 'Composing summary and structured preview…',
                          meta: latest ? 'Draft only' : '…',
                        },
                        {
                          title: 'Administrator approval required',
                          detail: latest
                            ? latest.status === 'Awaiting Approval'
                              ? 'Draft is staged. Nothing is published, deleted or disbursed until you approve.'
                              : latest.status === 'Completed'
                                ? `Approved by ${latest.decidedBy ?? 'Dr. Rajeshwar Rao'} — execution recorded in the audit log.`
                                : 'Rejected — the draft was discarded and no records were changed.'
                            : 'Awaiting your approval before any write action…',
                          meta: latest ? (latest.status === 'Awaiting Approval' ? 'Awaiting approval' : latest.status) : '…',
                        },
                      ] as const).map((step, i) => {
                        const Icon = STEP_ICONS[i];
                        const done = latest ? true : completedSteps > i;
                        const current = !latest && completedSteps === i;
                        return (
                          <div key={step.title} className="flex gap-3 px-4 py-2.5">
                            <div className="relative flex flex-col items-center">
                              <span
                                className={cx(
                                  'flex h-6 w-6 items-center justify-center rounded-full border transition-colors duration-150',
                                  done
                                    ? latest?.status === 'Rejected' && i === 3
                                      ? 'border-danger/30 bg-danger-soft text-danger'
                                      : 'border-success/30 bg-success-soft text-success'
                                    : current
                                      ? 'border-primary/40 bg-primary-tint text-primary-tint-fg'
                                      : 'border-line bg-surface-low text-muted/50',
                                )}
                              >
                                {done ? (
                                  latest?.status === 'Rejected' && i === 3 ? <XCircle size={12} /> : <Check size={12} strokeWidth={3} />
                                ) : (
                                  <Icon size={12} />
                                )}
                              </span>
                              {i < 3 && <span className="mt-1 h-full w-px flex-1 bg-line" aria-hidden />}
                            </div>
                            <div className="min-w-0 flex-1 pb-0.5">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <p className={cx('text-[12px] font-semibold', done || current ? 'text-ink' : 'text-muted')}>
                                  {i + 1}. {step.title}
                                </p>
                                {current && !latest && <span className="text-[9px] font-medium text-primary animate-pulse-soft">in progress</span>}
                              </div>
                              <p className="mt-0.5 text-[10.5px] leading-4 text-muted">{step.detail}</p>
                            </div>
                            {latest && <span className="shrink-0 self-start pt-0.5 font-mono text-[9px] text-muted">{step.meta}</span>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Draft output */}
                    {latest && (
                      <div className="border-t border-line bg-surface-low/40 px-4 py-3.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[12.5px] font-bold text-ink">{latest.title}</p>
                            <p className="mt-1 max-w-[620px] text-[11px] leading-4 text-muted">{latest.summary}</p>
                          </div>
                          <Badge tone="outline">{latest.scope}</Badge>
                        </div>
                        <div className="mt-2.5 overflow-x-auto rounded-lg border border-line bg-surface scroll-thin">
                          <table className="w-full min-w-[420px] text-left">
                            <thead>
                              <tr>
                                {latest.previewHeaders.map((h) => (
                                  <th key={h} className="border-b border-line bg-surface-low px-2.5 py-1.5 text-[9.5px] font-semibold uppercase tracking-wide text-muted">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {latest.previewRows.map((row, ri) => (
                                <tr key={ri} className="border-b border-line/60 last:border-0">
                                  {row.map((cell, ci) => (
                                    <td key={ci} className={cx('px-2.5 py-1.5 text-[10.5px] text-ink', ci === 0 && 'font-medium')}>{cell}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Approval bar */}
                        <div
                          className={cx(
                            'mt-3 flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2',
                            latest.status === 'Awaiting Approval' && 'border-primary/25 bg-primary-tint',
                            latest.status === 'Completed' && 'border-success/25 bg-success-soft',
                            latest.status === 'Rejected' && 'border-danger/25 bg-danger-soft',
                          )}
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            {latest.status === 'Awaiting Approval' ? (
                              <Lock size={13} className="shrink-0 text-primary-tint-fg" />
                            ) : latest.status === 'Completed' ? (
                              <CheckCircle2 size={13} className="shrink-0 text-success" />
                            ) : (
                              <XCircle size={13} className="shrink-0 text-danger" />
                            )}
                            <div className="min-w-0">
                              <p className={cx('text-[11px] font-semibold', latest.status === 'Awaiting Approval' ? 'text-primary-tint-fg' : latest.status === 'Completed' ? 'text-success' : 'text-danger')}>
                                {latest.status === 'Awaiting Approval'
                                  ? 'Awaiting your approval — no records modified'
                                  : latest.status === 'Completed'
                                    ? `Executed · approved by ${latest.decidedBy ?? 'Dr. Rajeshwar Rao'}`
                                    : 'Rejected · draft discarded, nothing changed'}
                              </p>
                              {latest.decidedAt && <p className="text-[9.5px] opacity-80">{fmtDateTime(latest.decidedAt)}</p>}
                            </div>
                          </div>
                          <div className="ml-auto flex flex-wrap items-center gap-1.5">
                            <Button
                              size="xs"
                              variant="ghost"
                              icon={copied ? Check : ClipboardCopy}
                              onClick={async () => {
                                await copy(reportText(latest));
                                pushToast({ title: 'Report data copied', description: 'Summary + preview table on your clipboard', tone: 'info' });
                              }}
                            >
                              {copied ? 'Copied' : 'Copy Report Data'}
                            </Button>
                            {latest.status === 'Awaiting Approval' ? (
                              <>
                                <Button size="xs" variant="danger" icon={ThumbsDown} onClick={() => decide(latest, 'Rejected')}>Reject</Button>
                                <Button size="xs" variant="primary" icon={BadgeCheck} onClick={() => decide(latest, 'Completed')}>Approve &amp; Execute</Button>
                              </>
                            ) : (
                              <Button size="xs" variant="secondary" icon={Sparkles} onClick={() => { setPhase('idle'); setActiveRun(null); setCompletedSteps(0); }}>
                                New request
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Composer */}
            <div className="sticky bottom-0 z-20 mt-3 -mx-6 border-t border-line bg-surface-low/95 px-6 py-3 backdrop-blur-md">
              <div className="mx-auto max-w-full">
                <div className="rounded-xl border border-line bg-surface p-2 shadow-sm transition-colors duration-150 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10">
                  <label htmlFor="orchestrator-input" className="sr-only">Describe the task</label>
                  <textarea
                    id="orchestrator-input"
                    ref={composerRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        execute(prompt);
                      }
                    }}
                    rows={2}
                    placeholder="Ask the orchestrator, e.g. “List students below 75% attendance in CSE and draft guardian outreach…”"
                    className="w-full resize-none bg-transparent px-1.5 py-1 text-[12.5px] leading-5 text-ink placeholder:text-muted/60 focus:outline-none"
                  />
                  <div className="flex flex-wrap items-center gap-2 px-0.5 pt-1">
                    <span className="flex items-center gap-1 text-[9.5px] text-muted">
                      <Lock size={9} /> AI never deletes records or publishes notices without approval
                    </span>
                    <span className="ml-auto flex items-center gap-1.5">
                      <span className="hidden font-mono text-[9px] text-muted sm:inline">Ctrl+Enter</span>
                      <Button size="xs" variant="primary" icon={Send} onClick={() => execute(prompt)} disabled={phase === 'running' || !prompt.trim()}>
                        {phase === 'running' ? 'Running…' : 'Run agents'}
                      </Button>
                    </span>
                  </div>
                </div>
                <p className="mt-1 px-1 text-center text-[9px] text-muted">
                  Orchestrator can read scoped records and draft actions. All write, publish and delete operations require your explicit approval.
                </p>
              </div>
            </div>
          </div>

          {/* Audit column */}
          <aside className="flex min-w-0 flex-col gap-3 lg:col-span-4">
            <div className="flex items-center gap-0.5 rounded-lg border border-line bg-surface p-0.5">
              <button
                type="button"
                onClick={() => setTab('audit')}
                className={cx('flex-1 rounded-md px-2 py-1.5 text-[11px] font-semibold transition-colors duration-120', tab === 'audit' ? 'bg-surface-container text-ink' : 'text-muted hover:text-ink')}
              >
                <History size={11} className="mr-1 inline" /> Audit log
              </button>
              <button
                type="button"
                onClick={() => setTab('history')}
                className={cx('flex-1 rounded-md px-2 py-1.5 text-[11px] font-semibold transition-colors duration-120', tab === 'history' ? 'bg-surface-container text-ink' : 'text-muted hover:text-ink')}
              >
                <ClipboardCopy size={11} className="mr-1 inline" /> Workflow history
              </button>
            </div>

            <div className="card flex flex-1 flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-line px-3.5 py-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
                  {tab === 'audit' ? 'Audit trail' : 'Workflow runs'}
                </p>
                <span className="mono text-[9.5px] text-muted">{tab === 'audit' ? `${audit.length} entries` : `${workflows.length} runs`}</span>
              </div>

              <div className="max-h-[calc(100vh-260px)] min-h-[300px] overflow-y-auto scroll-thin">
                {tab === 'audit' ? (
                  <ol className="divide-y divide-line">
                    {audit.map((entry) => (
                      <li key={entry.id} className="px-3.5 py-2.5 transition-colors duration-120 hover:bg-surface-low">
                        <div className="flex items-start gap-2">
                          <span
                            className={cx(
                              'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border',
                              entry.badge === 'Approved' ? 'border-success/25 bg-success-soft text-success'
                                : entry.badge === 'Rejected' ? 'border-danger/25 bg-danger-soft text-danger'
                                  : entry.badge === 'AI' ? 'border-primary/25 bg-primary-tint text-primary-tint-fg'
                                    : 'border-line bg-surface-low text-muted',
                            )}
                          >
                            {entry.badge === 'Approved' ? <Check size={10} /> : entry.badge === 'Rejected' ? <XCircle size={10} /> : entry.badge === 'AI' ? <Sparkles size={10} /> : <ShieldAlert size={10} />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold leading-4 text-ink">{entry.action}</p>
                            <p className="line-clamp-2 text-[9.5px] leading-3.5 text-muted">{entry.detail}</p>
                            <p className="mt-0.5 flex items-center gap-1 font-mono text-[8.5px] text-muted/80">
                              {fmtDateTime(entry.ts)} · {entry.actor}
                            </p>
                          </div>
                          {entry.badge && <Badge tone={entry.badge === 'Approved' ? 'success' : entry.badge === 'Rejected' ? 'danger' : 'outline'}>{entry.badge}</Badge>}
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <ol className="divide-y divide-line">
                    {workflows.map((w) => (
                      <li key={w.id}>
                        <button
                          type="button"
                          onClick={() => { setActiveRun(w); setPhase('ready'); }}
                          className="w-full px-3.5 py-2.5 text-left transition-colors duration-120 hover:bg-surface-low"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="mono text-[9.5px] text-muted">{w.id}</span>
                            <StatusBadge status={w.status} />
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-4 text-ink">{w.title}</p>
                          <p className="mt-0.5 text-[9px] text-muted">{w.agents.join(' · ')} · {fmtDateTime(w.ts)}</p>
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              <div className="mt-auto border-t border-line bg-surface-low/60 px-3.5 py-2.5">
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    ['Pending', pendingCount, 'text-warning'],
                    ['Approved', approvedCount, 'text-success'],
                    ['Agents', AGENTS.length, 'text-ink'],
                  ].map(([l, v, t]) => (
                    <div key={l as string}>
                      <p className={cx('font-display text-[15px] font-bold tabular-nums', t as string)}>{v}</p>
                      <p className="text-[9px] text-muted">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-surface p-3">
              <p className="flex items-center gap-1.5 text-[10.5px] font-semibold text-ink"><Lock size={11} className="text-success" /> Guardrails</p>
              <ul className="mt-1.5 space-y-1 text-[9.5px] leading-3.5 text-muted">
                <li>• Read-only until explicit approval</li>
                <li>• Confidential ICC data never surfaced</li>
                <li>• Every run appended to the audit chain</li>
                <li>• No autonomous deletes, publishes or payments</li>
              </ul>
            </div>
          </aside>
        </div>
      </PageScroll>
    </>
  );
}

function StatusBadge({ status }: { status: WorkflowRun['status'] }) {
  if (status === 'Awaiting Approval') return <Badge tone="warning" dot>Awaiting Approval</Badge>;
  if (status === 'Completed') return <Badge tone="success" icon={Check}>Completed</Badge>;
  return <Badge tone="danger" icon={XCircle}>Rejected</Badge>;
}
