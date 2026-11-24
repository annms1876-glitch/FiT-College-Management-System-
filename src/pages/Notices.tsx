import { useEffect, useMemo, useState } from 'react';
import {
  CalendarX2,
  Megaphone,
  Pin,
  PinOff,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';
import { Header, PageScroll, PageStack } from '../components/layout/Header';
import { Badge, Button, IconButton, SectionCard, type BadgeTone } from '../components/ui/primitives';
import { Checkbox, Field, Input, SearchInput, Select, Textarea } from '../components/ui/Form';
import { ConfirmDialog, Modal } from '../components/ui/Modal';
import { useApp } from '../store/AppStore';
import { NOTICE_CATEGORIES } from '../data/seed/academics';
import { fmtDate, todayISO } from '../lib/format';
import { cx } from '../lib/cx';
import { navigate, useDebounced, useRoute } from '../lib/hooks';
import type { Notice, NoticeCategory } from '../types';

const CATEGORY_TONE: Record<NoticeCategory, BadgeTone> = {
  Academic: 'info',
  Examination: 'warning',
  Events: 'primary',
  Holidays: 'success',
  Administration: 'neutral',
  'Emergency Announcements': 'danger',
};

export default function Notices() {
  const { notices, togglePin, deleteNotice, pushToast } = useApp();
  const route = useRoute();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [composeOpen, setComposeOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Notice | null>(null);
  const [view, setView] = useState<'grid' | 'pinned'>('grid');
  const debounced = useDebounced(query, 120);

  useEffect(() => {
    if (route.query.get('new') === '1') {
      setComposeOpen(true);
      navigate('/notices', { replace: true });
    }
  }, [route]);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return notices
      .filter((n) => {
        if (category !== 'all' && n.category !== category) return false;
        if (view === 'pinned' && !n.pinned) return false;
        if (!q) return true;
        return n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q) || n.audience.toLowerCase().includes(q);
      })
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.date.localeCompare(a.date));
  }, [notices, debounced, category, view]);

  const pinnedCount = notices.filter((n) => n.pinned).length;

  return (
    <>
      <Header
        title="Notices & Announcements"
        kicker={`${notices.length} notices · ${pinnedCount} pinned · 6 categories`}
        badge={<Badge tone="primary" icon={Megaphone}>Broadcast</Badge>}
        actions={
          <>
            <Button size="sm" variant="ghost" icon={Sparkles} onClick={() => navigate('/workflow')}>Draft with AI</Button>
            <Button size="sm" variant="primary" icon={Plus} onClick={() => setComposeOpen(true)}>Create Notice</Button>
          </>
        }
      />

      <PageScroll>
        <PageStack>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: 'Active notices', value: String(notices.length), meta: 'Across all departments', icon: Megaphone, chip: 'bg-primary-tint text-primary-tint-fg' },
              { label: 'Pinned', value: String(pinnedCount), meta: 'Always shown to students', icon: Pin, chip: 'bg-warning-soft text-warning' },
              { label: 'Expiring this week', value: String(notices.filter((n) => n.expiry <= '2026-11-30' && n.expiry >= todayISO()).length), meta: 'Auto-archive on expiry', icon: CalendarX2, chip: 'bg-danger-soft text-danger' },
              { label: 'Reach', value: '5,104', meta: 'Students + faculty', icon: Users, chip: 'bg-info-soft text-info' },
            ].map((k) => (
              <div key={k.label} className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3.5 py-3">
                <span className={cx('flex h-8 w-8 items-center justify-center rounded-lg', k.chip)}><k.icon size={14} /></span>
                <div>
                  <p className="font-display text-[17px] font-bold tabular-nums leading-5 text-ink">{k.value}</p>
                  <p className="text-[9.5px] text-muted">{k.label} · {k.meta}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface p-3">
            <SearchInput value={query} onChange={setQuery} placeholder="Search notice title, body or audience…" className="min-w-[250px] flex-1 sm:max-w-[360px]" />
            <Select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category" className="w-auto min-w-[190px]">
              <option value="all">All categories</option>
              {NOTICE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </Select>
            <div className="flex items-center gap-0.5 rounded-md border border-line bg-surface-low p-0.5">
              {(['grid', 'pinned'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={cx('h-7 rounded-[5px] px-2.5 text-[11px] font-semibold transition-all duration-120', view === v ? 'bg-surface text-ink shadow-sm ring-1 ring-line' : 'text-muted hover:text-ink')}
                >
                  {v === 'grid' ? 'All notices' : 'Pinned only'}
                </button>
              ))}
            </div>
            <span className="ml-auto text-[10.5px] text-muted">{filtered.length} shown</span>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {filtered.map((n) => (
              <article key={n.id} className={cx('card relative flex flex-col p-4 transition-all duration-120 hover:border-primary/25', n.pinned && 'border-primary/25 bg-gradient-to-b from-primary-tint/40 to-transparent')}>
                <div className="flex items-start justify-between gap-2">
                  <Badge tone={CATEGORY_TONE[n.category]} dot>{n.category}</Badge>
                  <div className="flex items-center gap-0.5">
                    {n.pinned && <Pin size={12} className="mr-1 text-primary" aria-label="Pinned" />}
                    <IconButton icon={n.pinned ? PinOff : Pin} label={n.pinned ? 'Unpin notice' : 'Pin notice'} onClick={() => { togglePin(n.id); pushToast(n.pinned ? 'Notice unpinned' : 'Notice pinned', 'info'); }} />
                    <IconButton icon={Trash2} label="Withdraw notice" variant="danger" onClick={() => setDeleteTarget(n)} />
                  </div>
                </div>
                <h3 className="mt-2 line-clamp-2 font-display text-[13.5px] font-bold leading-5 text-ink">{n.title}</h3>
                <p className="mt-1 line-clamp-3 text-[11px] leading-4 text-muted">{n.body}</p>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[9.5px] text-muted">
                  <span className="rounded bg-surface-container px-1.5 py-0.5">{n.audience}</span>
                  <span className="text-line">·</span>
                  <span className="font-mono">{fmtDate(n.date)}</span>
                  <span className="text-line">·</span>
                  <span>expires {fmtDate(n.expiry)}</span>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-line pt-2.5">
                  <span className="truncate text-[9.5px] text-muted">{n.author}</span>
                  <Button size="xs" variant="ghost" icon={Send} onClick={() => pushToast({ title: 'Notice re-broadcast', description: `${n.title} · email + portal + LMS`, tone: 'success' })}>
                    Resend
                  </Button>
                </div>
              </article>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="rounded-xl border border-line bg-surface py-14 text-center">
              <Search size={20} className="mx-auto mb-2 text-muted/60" />
              <p className="text-sm font-semibold text-ink">No notices match</p>
              <p className="mt-1 text-xs text-muted">Try another category, or clear the search.</p>
              <Button size="xs" variant="secondary" className="mx-auto mt-3" onClick={() => { setQuery(''); setCategory('all'); setView('grid'); }}>Reset</Button>
            </div>
          )}

          <SectionCard title="Delivery channels" subtitle="How notices reach the community" icon={Send}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[['Student portal', '100%'], ['Email digest', '94% delivered'], ['Mobile app push', '4,610 devices'], ['LMS / Moodle', 'Synced']].map(([l, v]) => (
                <div key={l} className="rounded-lg border border-line px-2.5 py-2">
                  <p className="text-[9.5px] text-muted">{l}</p>
                  <p className="text-[11.5px] font-semibold text-ink">{v}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </PageStack>
      </PageScroll>

      <ComposeNoticeModal open={composeOpen} onClose={() => setComposeOpen(false)} />
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteNotice(deleteTarget.id)}
        title="Withdraw this notice?"
        description={`“${deleteTarget?.title}” will be removed from the portal and mobile app. Students who already received the email digest keep their copy.`}
        confirmLabel="Withdraw notice"
      />
    </>
  );
}

function ComposeNoticeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addNotice } = useApp();
  const blank = {
    title: '',
    body: '',
    category: 'Academic' as NoticeCategory,
    audience: 'All Students (Sem 1–7)',
    date: todayISO(),
    expiry: '2026-12-31',
    pinned: false,
  };
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (form.body.trim().length < 20) errs.body = 'Add at least 20 characters of body copy';
    if (form.expiry < form.date) errs.expiry = 'Expiry must be after the publish date';
    if (Object.keys(errs).length) return setErrors(errs);
    addNotice({
      title: form.title.trim(),
      body: form.body.trim(),
      category: form.category,
      audience: form.audience,
      date: form.date,
      expiry: form.expiry,
      pinned: form.pinned,
      author: 'Dr. Rajeshwar Rao',
    });
    setForm(blank);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create notice"
      subtitle="Broadcast to portal, email digest and mobile push · 6 permitted categories"
      icon={<Megaphone size={16} className="text-primary-tint-fg" />}
      size="lg"
      footer={
        <>
          <label className="mr-auto flex items-center gap-1.5 text-[11px] font-medium text-ink">
            <input type="checkbox" checked={form.pinned} onChange={(e) => setForm((f) => ({ ...f, pinned: e.target.checked }))} className="h-3.5 w-3.5 rounded border-line accent-primary" />
            Pin to dashboard
          </label>
          <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button size="sm" variant="primary" icon={Send} onClick={submit}>Publish notice</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <Field label="Title" required error={errors.title} className="sm:col-span-2">
          <Input value={form.title} onChange={(e) => { setForm((f) => ({ ...f, title: e.target.value })); setErrors({}); }} placeholder="e.g. Winter examination guidelines released" autoFocus />
        </Field>
        <Field label="Category" required>
          <Select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as NoticeCategory }))}>
            {NOTICE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Target audience" required>
          <Select value={form.audience} onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value }))}>
            {['All Students (Sem 1–7)', 'All UG Students', 'All Departments', 'Final Year B.Tech / MBA', 'Scholarship Applicants', 'Faculty & Research Scholars', 'Hostel Residents', 'Cultural Committee'].map((a) => <option key={a}>{a}</option>)}
          </Select>
        </Field>
        <Field label="Body" required error={errors.body} className="sm:col-span-2">
          <Textarea value={form.body} onChange={(e) => { setForm((f) => ({ ...f, body: e.target.value })); setErrors({}); }} placeholder="Key details students should know — dates, actions, office to contact…" className="min-h-[110px]" />
        </Field>
        <Field label="Publish date" required>
          <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
        </Field>
        <Field label="Expiry date" required error={errors.expiry}>
          <Input type="date" value={form.expiry} onChange={(e) => { setForm((f) => ({ ...f, expiry: e.target.value })); setErrors({}); }} />
        </Field>
        {form.category === 'Emergency Announcements' && (
          <div className="sm:col-span-2 rounded-md border border-danger/25 bg-danger-soft px-2.5 py-2 text-[10.5px] leading-4 text-danger">
            Emergency announcements immediately push to all devices and cannot be withdrawn in the first 30 minutes.
          </div>
        )}
        <div className="sm:col-span-2">
          <Checkbox checked={form.pinned} onChange={(v) => setForm((f) => ({ ...f, pinned: v }))} label="Pin to dashboard" description="Appears in the dashboard pinned-notices feed and at the top of student portal" />
        </div>
      </div>
    </Modal>
  );
}
