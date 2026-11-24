import { useState } from 'react';
import {
  Activity,
  BadgeCheck,
  Check,
  Database,
  Fingerprint,
  KeyRound,
  Laptop,
  Lock,
  Moon,
  Monitor,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Sun,
  Users,
  X,
} from 'lucide-react';
import { Header, PageScroll, PageStack } from '../components/layout/Header';
import { Avatar, Badge, Button, SectionCard } from '../components/ui/primitives';
import { Field, Input, Select, Switch } from '../components/ui/Form';
import { Tabs } from '../components/ui/Tabs';
import { useApp } from '../store/AppStore';
import { fmtDateTime } from '../lib/format';
import { cx } from '../lib/cx';

const ROLES = ['Super Admin', 'Department Admin', 'Examination Admin', 'Support Staff'] as const;
type Role = (typeof ROLES)[number];

const MODULES = [
  'Dashboard & analytics',
  'Student records',
  'Faculty management',
  'Timetable',
  'Assignments',
  'Scholarships',
  'Fees & submissions',
  'Grievances (incl. ICC)',
  'Student support',
  'E-Library',
  'Examination records',
  'Notices & announcements',
  'Course catalogue',
  'Agentic workflow',
];

// scope: 'full' | 'read' | 'none'
const MATRIX: Record<Role, { scope: string; modules: Record<string, 'full' | 'read' | 'none'>; ai: string; aiTone: 'success' | 'warning' | 'info' }> = {
  'Super Admin': {
    scope: 'Institute-wide',
    ai: 'Approve & execute',
    aiTone: 'success',
    modules: Object.fromEntries(MODULES.map((m) => [m, 'full'])) as Record<string, 'full'>,
  },
  'Department Admin': {
    scope: 'Own department only',
    ai: 'Approve within department',
    aiTone: 'info',
    modules: Object.fromEntries(
      MODULES.map((m) => [
        m,
        m === 'Dashboard & analytics' || m === 'Notices & announcements' || m === 'Course catalogue'
          ? 'full'
          : m === 'Grievances (incl. ICC)' || m === 'Fees & submissions' || m === 'Examination records'
            ? 'none'
            : 'read',
      ]),
    ) as Record<string, 'full' | 'read' | 'none'>,
  },
  'Examination Admin': {
    scope: 'Exam data · read-most',
    ai: 'Sign-off required',
    aiTone: 'warning',
    modules: Object.fromEntries(
      MODULES.map((m) => [
        m,
        m === 'Examination records' || m === 'Dashboard & analytics'
          ? 'full'
          : m === 'Grievances (incl. ICC)' || m === 'Fees & submissions' || m === 'Scholarships'
            ? 'none'
            : 'read',
      ]),
    ) as Record<string, 'full' | 'read' | 'none'>,
  },
  'Support Staff': {
    scope: 'Helpdesk scoped',
    ai: 'Draft only',
    aiTone: 'info',
    modules: Object.fromEntries(
      MODULES.map((m) => [
        m,
        m === 'Student support' ? 'full' : m === 'Student records' || m === 'Notices & announcements' || m === 'E-Library' ? 'read' : 'none',
      ]),
    ) as Record<string, 'full' | 'read' | 'none'>,
  },
};

export default function Settings() {
  const { theme, setTheme, pushToast, audit, resetDemo, backendLabel } = useApp();
  const [tab, setTab] = useState('profile');
  const [security, setSecurity] = useState({ twoFa: true, sessionAlerts: true, digilocker: true, aiApproval: true });
  const [reduceMotion, setReduceMotion] = useState(false);
  const [density, setDensity] = useState('comfortable');

  return (
    <>
      <Header
        title="Admin Settings & Security"
        kicker="Profile, role-based access control, appearance and session security"
        badge={<Badge tone="success" icon={BadgeCheck}>2FA Enabled</Badge>}
        actions={<Button size="sm" variant="primary" icon={Check} onClick={() => pushToast({ title: 'Preferences saved', description: 'Applied to your administrator profile', tone: 'success' })}>Save changes</Button>}
      />

      <PageScroll>
        <PageStack>
          <Tabs
            value={tab}
            onChange={setTab}
            size="lg"
            tabs={[
              { id: 'profile', label: 'Profile & security', icon: <Fingerprint size={13} /> },
              { id: 'rbac', label: 'Role-based access', icon: <Users size={13} /> },
              { id: 'appearance', label: 'Appearance', icon: <Monitor size={13} /> },
            ]}
          />

          {tab === 'profile' && (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
              <div className="flex flex-col gap-4 xl:col-span-5">
                <SectionCard title="Administrator profile" icon={Users}>
                  <div className="flex items-center gap-3">
                    <Avatar name="Rajeshwar Rao" size="xl" tone="#3525CD" />
                    <div className="min-w-0">
                      <p className="font-display text-[16px] font-bold text-ink">Dr. Rajeshwar Rao</p>
                      <p className="text-[11px] text-muted">Super Administrator · Principal (Officiating)</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <Badge tone="success" icon={BadgeCheck}>2FA Enabled</Badge>
                        <Badge tone="primary">Super Admin</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Full name"><Input defaultValue="Dr. Rajeshwar Rao" /></Field>
                    <Field label="Employee ID"><Input defaultValue="VIT-ADM-0001" className="mono" readOnly /></Field>
                    <Field label="Email"><Input defaultValue="rajeshwar.rao@vitp.ac.in" /></Field>
                    <Field label="Mobile"><Input defaultValue="+91 98220 11001" /></Field>
                    <Field label="Designation" className="sm:col-span-2">
                      <Select defaultValue="Super Administrator">
                        {['Super Administrator', 'Registrar', 'Deputy Registrar'].map((d) => <option key={d}>{d}</option>)}
                      </Select>
                    </Field>
                  </div>
                  <div className="mt-3 rounded-lg border border-line bg-surface-low px-2.5 py-2 text-[10.5px] leading-4 text-muted">
                    Designation changes require a second Super Administrator to co-sign. All changes are appended to the audit trail.
                  </div>
                </SectionCard>

                <SectionCard title="Data & backend" subtitle="Local BaaS cache · swap for Appwrite / PocketBase / Supabase" icon={Database}>
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-surface-low px-2.5 py-2">
                    <div>
                      <p className="text-[11px] font-semibold text-ink">Active driver</p>
                      <p className="text-[9.5px] text-muted">{backendLabel} · collections persist in this browser</p>
                    </div>
                    <Badge tone="info">local</Badge>
                  </div>
                  <p className="mt-2 text-[10px] leading-4 text-muted">
                    Point <span className="mono">VITE_BAAS_DRIVER</span>, <span className="mono">VITE_BAAS_URL</span> and <span className="mono">VITE_BAAS_PROJECT</span> at your BaaS to switch this seam to a live backend. Pages never talk to storage directly.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Button size="xs" variant="secondary" icon={RotateCcw} onClick={() => { void resetDemo(); }}>Reset demo data</Button>
                    <Button size="xs" variant="ghost" icon={Database} onClick={() => pushToast({ title: 'Collection map', description: '15 collections: students → audit_log', tone: 'info' })}>View schema</Button>
                  </div>
                </SectionCard>

                <SectionCard title="Session" subtitle="Active device & recent auth" icon={Laptop}>
                  <ul className="space-y-2">
                    {[
                      { device: 'MacBook Pro · Chrome 139', meta: 'Pune, IN · 10.24.8.61 · current session', icon: Laptop, current: true },
                      { device: 'iPhone 15 · Safari', meta: 'Pune, IN · 3 h ago', icon: Smartphone, current: false },
                      { device: 'Windows 11 · Edge', meta: 'Mumbai, IN · 2 days ago', icon: Monitor, current: false },
                    ].map((s) => (
                      <li key={s.device} className="flex items-center gap-2.5 rounded-lg border border-line px-2.5 py-2">
                        <s.icon size={14} className="text-muted" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-medium text-ink">{s.device}</p>
                          <p className="truncate text-[9.5px] text-muted">{s.meta}</p>
                        </div>
                        {s.current ? (
                          <Badge tone="success" dot>This device</Badge>
                        ) : (
                          <Button size="xs" variant="ghost" icon={X} onClick={() => pushToast({ title: 'Session revoked', description: s.device, tone: 'warning' })}>Revoke</Button>
                        )}
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              </div>

              <div className="flex flex-col gap-4 xl:col-span-7">
                <SectionCard title="Security controls" subtitle="Two-factor authentication and session policy" icon={ShieldCheck}>
                  <div className="divide-y divide-line">
                    {[
                      { key: 'twoFa' as const, title: 'Two-factor authentication', desc: 'TOTP via authenticator app + SMS fallback. Required for Super Admins.', badge: 'Enabled' },
                      { key: 'sessionAlerts' as const, title: 'New device alerts', desc: 'Email + push notification whenever a new device signs in.', badge: 'Enabled' },
                      { key: 'digilocker' as const, title: 'DigiLocker verification gates', desc: 'Block scholarship approvals without verified income/caste documents.', badge: 'Enabled' },
                      { key: 'aiApproval' as const, title: 'AI approval requirement', desc: 'Never allow the orchestrator to execute write actions without explicit admin approval.', badge: 'Locked on' },
                    ].map((row) => (
                      <div key={row.key} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-1.5 text-[12px] font-semibold text-ink">
                            {row.title}
                            {row.key === 'aiApproval' && <Lock size={10} className="text-muted" />}
                          </p>
                          <p className="mt-0.5 text-[10.5px] leading-4 text-muted">{row.desc}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge tone={row.key === 'aiApproval' ? 'primary' : 'success'}>{row.badge}</Badge>
                          <Switch
                            checked={security[row.key]}
                            onChange={(v) => {
                              if (row.key === 'aiApproval') {
                                pushToast({ title: 'Guardrail is non-negotiable', description: 'AI approval requirement cannot be disabled.', tone: 'warning' });
                                return;
                              }
                              setSecurity((s) => ({ ...s, [row.key]: v }));
                              pushToast(row.key === 'twoFa' && !v ? { title: '2FA disabled', description: 'This would violate the admin security policy in production.', tone: 'warning' } : { title: `${row.title} ${v ? 'enabled' : 'disabled'}`, tone: 'info' });
                            }}
                            label={row.title}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="Password & keys" subtitle="Rotation policy" icon={KeyRound}>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Current password"><Input type="password" defaultValue="demo-password" /></Field>
                    <Field label="New password" hint="Min 12 chars · 1 symbol · 1 number"><Input type="password" placeholder="••••••••••••" /></Field>
                    <div className="sm:col-span-2 rounded-lg border border-line bg-surface-low px-2.5 py-2 text-[10.5px] leading-4 text-muted">
                      Password last rotated 42 days ago. Rotation is enforced every 90 days. FIDO2 hardware keys are supported for the Registrar role.
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Recent security activity" subtitle="Last 5 actions from the audit chain" icon={Activity}>
                  <ol className="divide-y divide-line">
                    {audit.slice(0, 5).map((a) => (
                      <li key={a.id} className="flex items-start gap-2 py-1.5 first:pt-0 last:pb-0">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] leading-4 text-ink">{a.action} — <span className="text-muted">{a.detail}</span></p>
                          <p className="font-mono text-[9px] text-muted">{fmtDateTime(a.ts)} · {a.actor}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </SectionCard>
              </div>
            </div>
          )}

          {tab === 'rbac' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-info/25 bg-info-soft px-3.5 py-2.5">
                <p className="flex items-center gap-1.5 text-[11.5px] font-semibold text-info">
                  <ShieldCheck size={13} /> RBAC matrix · scope, module access and AI approval rights
                </p>
                <Button size="xs" variant="secondary" onClick={() => pushToast({ title: 'RBAC policy exported', description: 'Matrix downloaded as SOC2 evidence PDF', tone: 'success' })}>
                  Export matrix
                </Button>
              </div>

              <div className="card overflow-hidden">
                <div className="overflow-x-auto scroll-thin">
                  <table className="w-full min-w-[860px] border-collapse text-left">
                    <thead>
                      <tr>
                        <th className="sticky left-0 z-10 border-b border-r border-line bg-surface-low px-3 py-2.5 text-[9.5px] font-semibold uppercase tracking-wide text-muted">Module</th>
                        {ROLES.map((r) => (
                          <th key={r} className="border-b border-line bg-surface-low px-3 py-2 text-center">
                            <span className="block text-[11px] font-semibold text-ink">{r}</span>
                            <span className="block text-[9px] font-normal text-muted">{MATRIX[r].scope}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MODULES.map((m) => (
                        <tr key={m} className="hover:bg-surface-low/60">
                          <th scope="row" className="sticky left-0 z-10 border-b border-r border-line bg-surface px-3 py-2 text-left text-[11px] font-medium text-ink">{m}</th>
                          {ROLES.map((r) => {
                            const v = MATRIX[r].modules[m];
                            return (
                              <td key={r} className="border-b border-line px-3 py-2 text-center">
                                {v === 'full' ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[9.5px] font-semibold text-success"><Check size={9} strokeWidth={3} /> Full</span>
                                ) : v === 'read' ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-info-soft px-2 py-0.5 text-[9.5px] font-semibold text-info">Read</span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2 py-0.5 text-[9.5px] font-semibold text-muted"><X size={9} /> None</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      <tr className="bg-primary-tint/60">
                        <th scope="row" className="sticky left-0 z-10 border-r border-line bg-primary-tint px-3 py-2.5 text-left text-[11px] font-semibold text-primary-tint-fg">AI approval rights</th>
                        {ROLES.map((r) => (
                          <td key={r} className="px-3 py-2.5 text-center">
                            <Badge tone={MATRIX[r].aiTone}>{MATRIX[r].ai}</Badge>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line bg-surface-low/60 px-3 py-2 text-[9.5px] text-muted">
                  <span className="flex items-center gap-1"><span className="rounded-full bg-success-soft px-1.5 text-success">Full</span> create, edit, approve</span>
                  <span className="flex items-center gap-1"><span className="rounded-full bg-info-soft px-1.5 text-info">Read</span> view &amp; export with consent</span>
                  <span className="flex items-center gap-1"><span className="rounded-full bg-surface-container px-1.5">None</span> blocked at API + UI</span>
                  <span className="ml-auto">ICC cases excluded from all roles except Super Admin &amp; ICC Chairperson</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                <SectionCard title="Role assignment" subtitle="Active administrators" icon={Users} className="lg:col-span-2">
                  <ul className="divide-y divide-line">
                    {[
                      ['Dr. Rajeshwar Rao', 'Super Admin', 'Institute-wide', 'success'],
                      ['Dr. Sunita Deshpande', 'Department Admin', 'CSE only', 'info'],
                      ['Dr. Kavita Bhosale', 'Department Admin', 'AI & DS only', 'info'],
                      ['Prof. Vivek Chavan', 'Examination Admin', 'Examination records', 'warning'],
                      ['Aarti Kulkarni', 'Support Staff', 'Helpdesk scoped', 'neutral'],
                    ].map(([name, role, scope, tone]) => (
                      <li key={name} className="flex flex-wrap items-center gap-2 py-2 first:pt-0 last:pb-0">
                        <Avatar name={name} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11.5px] font-semibold text-ink">{name}</p>
                          <p className="text-[9.5px] text-muted">{scope}</p>
                        </div>
                        <Badge tone={tone as 'success'}>{role}</Badge>
                        <Button size="xs" variant="ghost" onClick={() => pushToast({ title: 'Role editor', description: `Change role for ${name} · requires co-sign`, tone: 'info' })}>Manage</Button>
                      </li>
                    ))}
                  </ul>
                </SectionCard>
                <SectionCard title="Policy notes" subtitle="Why these boundaries exist" icon={Lock}>
                  <ul className="space-y-2 text-[10.5px] leading-4 text-muted">
                    <li>• Confidential ICC grievances are isolated by a separate ACL; no departmental role can list or export them.</li>
                    <li>• Examination results publication requires the Examination Admin passphrase plus a second reviewer.</li>
                    <li>• AI drafts inherit the requesting user's scope — an agent can never read outside its caller's permissions.</li>
                    <li>• Support staff can draft, but only Super Admin can publish Institute-wide notices.</li>
                  </ul>
                </SectionCard>
              </div>
            </div>
          )}

          {tab === 'appearance' && (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
              <div className="flex flex-col gap-4 xl:col-span-7">
                <SectionCard title="Interface appearance" subtitle="Persisted per browser · applied instantly" icon={theme === 'dark' ? Moon : Sun}>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {(['light', 'dark'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          setTheme(mode);
                          pushToast({ title: `${mode === 'dark' ? 'Dark' : 'Light'} mode applied`, description: 'Preference saved to localStorage.', tone: 'info' });
                        }}
                        aria-pressed={theme === mode}
                        className={cx(
                          'group overflow-hidden rounded-xl border-2 p-1.5 text-left transition-all duration-120',
                          theme === mode ? 'border-primary' : 'border-line hover:border-ink/20',
                        )}
                      >
                        <div
                          className={cx(
                            'flex h-24 gap-1.5 overflow-hidden rounded-lg border p-1.5',
                            mode === 'light' ? 'border-[#E5E7EB] bg-[#F9FAFB]' : 'border-[#2E2E32] bg-[#171717]',
                          )}
                        >
                          <div className={cx('flex w-8 flex-col gap-1 rounded p-1', mode === 'light' ? 'bg-white' : 'bg-[#212121]')}>
                            <span className="h-2 rounded-sm bg-[#4F46E5]" />
                            <span className={cx('h-1 rounded-sm', mode === 'light' ? 'bg-[#EAECEF]' : 'bg-[#2A2A2A]')} />
                            <span className={cx('h-1 rounded-sm', mode === 'light' ? 'bg-[#EAECEF]' : 'bg-[#2A2A2A]')} />
                            <span className={cx('h-1 rounded-sm', mode === 'light' ? 'bg-[#EAECEF]' : 'bg-[#2A2A2A]')} />
                          </div>
                          <div className="flex flex-1 flex-col gap-1">
                            <span className={cx('h-3 rounded', mode === 'light' ? 'bg-white' : 'bg-[#212121]')} />
                            <div className="flex flex-1 gap-1">
                              <span className={cx('flex-1 rounded', mode === 'light' ? 'bg-white' : 'bg-[#1E1E1E]')} />
                              <span className="flex-1 rounded bg-[#4F46E5]/80" />
                            </div>
                            <span className={cx('h-2 w-2/3 rounded', mode === 'light' ? 'bg-[#EAECEF]' : 'bg-[#2A2A2A]')} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between px-1 pb-0.5 pt-1.5">
                          <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ink">
                            {mode === 'light' ? <Sun size={12} /> : <Moon size={12} />} {mode === 'light' ? 'Light mode' : 'Dark mode'}
                          </span>
                          {theme === mode ? <Badge tone="primary" icon={Check}>Active</Badge> : <span className="text-[9.5px] text-muted">Select</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Table density">
                      <Select value={density} onChange={(e) => setDensity(e.target.value)}>
                        <option value="comfortable">Comfortable (default)</option>
                        <option value="compact">Compact</option>
                      </Select>
                    </Field>
                    <div className="flex items-end">
                      <div className="flex w-full items-center justify-between rounded-lg border border-line px-2.5 py-2">
                        <div>
                          <p className="text-[11px] font-semibold text-ink">Reduce motion</p>
                          <p className="text-[9px] text-muted">Respects OS preference</p>
                        </div>
                        <Switch checked={reduceMotion} onChange={setReduceMotion} label="Reduce motion" />
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Typography & density scale" subtitle="Tokens used across the portal" icon={Monitor}>
                  <div className="space-y-2">
                    {[
                      ['Display · Mulish 700', 'font-display text-[22px] font-bold', 'Institute command centre'],
                      ['Heading · Mulish 600', 'font-display text-[15px] font-semibold', 'Department distribution'],
                      ['Body · Instrument Sans 400', 'font-sans text-[12.5px]', 'Records are scoped by RBAC and KYC consent.'],
                      ['Label · Instrument Sans 600', 'font-sans text-[10.5px] font-semibold uppercase tracking-wide', 'Pending approvals'],
                      ['Mono · Source Code Pro 500', 'font-mono text-[11px] tabular-nums', 'VIT/2026-27/04828 · 2023CSEB104'],
                    ].map(([label, cls, sample]) => (
                      <div key={label} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line/70 pb-1.5 last:border-0">
                        <span className="text-[9px] uppercase tracking-wide text-muted">{label}</span>
                        <span className={cx(cls, 'text-ink')}>{sample}</span>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </div>

              <div className="flex flex-col gap-4 xl:col-span-5">
                <SectionCard title="Color tokens" subtitle="Semantic palette · light & dark" icon={Sun}>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ['Primary', '#3525CD'],
                      ['Primary tint', '#EEF2FF'],
                      ['Surface', '#FFFFFF'],
                      ['Surface container', '#F3F4F6'],
                      ['Success', '#15803D'],
                      ['Warning', '#B45309'],
                      ['Info', '#1D4ED8'],
                      ['Error', '#BA1A1A'],
                    ].map(([name, hex]) => (
                      <div key={name} className="flex items-center gap-2 rounded-lg border border-line px-2 py-1.5">
                        <span className="h-5 w-5 shrink-0 rounded border border-line" style={{ backgroundColor: hex }} />
                        <div className="min-w-0">
                          <p className="truncate text-[9.5px] font-medium text-ink">{name}</p>
                          <p className="font-mono text-[8.5px] text-muted">{hex}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2.5 rounded-lg bg-surface-low px-2.5 py-2 text-[10px] leading-4 text-muted">
                    Dark mode uses <span className="mono">#171717</span> surfaces with <span className="mono">#C3C0FF</span> primary and <span className="mono">#2E2E32</span> hairlines. Status chips invert softly for AA contrast.
                  </div>
                </SectionCard>

                <SectionCard title="Keyboard shortcuts" subtitle="Global navigation" icon={KeyRound}>
                  <ul className="space-y-1.5">
                    {[
                      ['Ctrl / ⌘ + K', 'Global search'],
                      ['Ctrl / ⌘ + N', 'New action'],
                      ['Ctrl / ⌘ + B', 'Collapse sidebar'],
                      ['Ctrl / ⌘ + J', 'Toggle theme'],
                      ['Esc', 'Close modal / palette'],
                      ['Enter (composer)', 'Run orchestrator'],
                    ].map(([k, d]) => (
                      <li key={k} className="flex items-center justify-between border-b border-line/70 pb-1 text-[10.5px] last:border-0">
                        <span className="text-muted">{d}</span>
                        <kbd className="rounded border border-line bg-surface-low px-1.5 py-0.5 font-mono text-[9px] text-ink">{k}</kbd>
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              </div>
            </div>
          )}
        </PageStack>
      </PageScroll>
    </>
  );
}
