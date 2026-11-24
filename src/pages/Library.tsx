import { useMemo, useState } from 'react';
import {
  BookOpen,
  Bookmark,
  Download,
  ExternalLink,
  FileText,
  HardDriveDownload,
  Library as LibraryIcon,
  Plus,
  ScrollText,
  Search,
  Star,
  Upload,
} from 'lucide-react';
import { Header, PageScroll, PageStack } from '../components/layout/Header';
import { Badge, Button, Progress, SectionCard } from '../components/ui/primitives';
import { Field, Input, SearchInput, Select } from '../components/ui/Form';
import { Modal } from '../components/ui/Modal';
import { useApp } from '../store/AppStore';
import { DEPARTMENTS, DEPT_MAP } from '../data/departments';
import { num } from '../lib/format';
import { cx } from '../lib/cx';
import { useDebounced } from '../lib/hooks';
import type { LibraryResource } from '../types';

const TYPE_ICON = { 'Digital Textbook': BookOpen, 'Lecture Notes': ScrollText, 'IEEE Journal': FileText };
const TYPE_TONE = { 'Digital Textbook': 'primary', 'Lecture Notes': 'info', 'IEEE Journal': 'warning' } as const;

export default function Library() {
  const { resources, trackDownload, pushToast } = useApp();
  const [query, setQuery] = useState('');
  const [dept, setDept] = useState('all');
  const [type, setType] = useState<'all' | LibraryResource['type']>('all');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const debounced = useDebounced(query, 120);

  const filtered = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    return resources.filter((r) => {
      if (dept !== 'all' && r.dept !== dept) return false;
      if (type !== 'all' && r.type !== type) return false;
      if (!q) return true;
      return r.title.toLowerCase().includes(q) || r.author.toLowerCase().includes(q) || r.dept.toLowerCase().includes(q);
    });
  }, [resources, debounced, dept, type]);

  const totalDownloads = resources.reduce((a, r) => a + r.downloads, 0);

  return (
    <>
      <Header
        title="E-Library"
        kicker={`${resources.length} digital resources · ${num(totalDownloads)} downloads · IEEE Xplore enabled`}
        badge={<Badge tone="outline" icon={LibraryIcon}>Digital collection</Badge>}
        actions={
          <>
            <Button size="sm" variant="ghost" icon={HardDriveDownload} onClick={() => pushToast({ title: 'Offline bundle requested', description: 'Top 20 CSE resources queued · 340 MB', tone: 'info' })}>
              Offline pack
            </Button>
            <Button size="sm" variant="primary" icon={Upload} onClick={() => setUploadOpen(true)}>Upload Resource</Button>
          </>
        }
      />

      <PageScroll>
        <PageStack>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: 'Digital textbooks', value: resources.filter((r) => r.type === 'Digital Textbook').length, icon: BookOpen },
              { label: 'Lecture notes', value: resources.filter((r) => r.type === 'Lecture Notes').length, icon: ScrollText },
              { label: 'IEEE journals', value: resources.filter((r) => r.type === 'IEEE Journal').length, icon: FileText },
              { label: 'Total downloads', value: num(totalDownloads), icon: Download },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3.5 py-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-low text-muted"><s.icon size={15} /></span>
                <div>
                  <p className="font-display text-[17px] font-bold tabular-nums leading-5 text-ink">{s.value}</p>
                  <p className="text-[10px] text-muted">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface p-3">
            <SearchInput value={query} onChange={setQuery} placeholder="Search title, author or department…" className="min-w-[250px] flex-1 sm:max-w-[380px]" />
            <Select value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Department" className="w-auto min-w-[150px]">
              <option value="all">All departments</option>
              {DEPARTMENTS.map((d) => <option key={d.code} value={d.code}>{d.code} · {d.short}</option>)}
            </Select>
            <div className="flex items-center gap-0.5 rounded-md border border-line bg-surface-low p-0.5">
              {(['all', 'Digital Textbook', 'Lecture Notes', 'IEEE Journal'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cx(
                    'h-7 rounded-[5px] px-2.5 text-[11px] font-semibold transition-all duration-120',
                    type === t ? 'bg-surface text-ink shadow-sm ring-1 ring-line' : 'text-muted hover:text-ink',
                  )}
                >
                  {t === 'all' ? 'All types' : t === 'Digital Textbook' ? 'Textbooks' : t === 'Lecture Notes' ? 'Notes' : 'IEEE'}
                </button>
              ))}
            </div>
            <span className="ml-auto text-[10.5px] text-muted">{filtered.length} resources</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filtered.map((r) => {
              const Icon = TYPE_ICON[r.type];
              const saved = bookmarked.has(r.id);
              return (
                <article key={r.id} className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition-all duration-150 hover:-translate-y-px hover:border-primary/25 hover:shadow-sm">
                  <div className="relative flex h-[92px] items-center justify-center overflow-hidden border-b border-line" style={{ background: `linear-gradient(140deg, ${r.accent}18, ${r.accent}05)` }}>
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg shadow-sm" style={{ backgroundColor: r.accent, color: '#fff' }}>
                      <Icon size={20} strokeWidth={1.8} />
                    </span>
                    <span className="absolute left-2 top-2">
                      <Badge tone={TYPE_TONE[r.type]}>{r.format}</Badge>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setBookmarked((prev) => {
                          const next = new Set(prev);
                          if (next.has(r.id)) next.delete(r.id);
                          else next.add(r.id);
                          return next;
                        });
                      }}
                      aria-label={saved ? 'Remove bookmark' : 'Bookmark resource'}
                      aria-pressed={saved}
                      className={cx(
                        'absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-md border border-line bg-surface/90 backdrop-blur transition-colors duration-120',
                        saved ? 'text-primary' : 'text-muted hover:text-ink',
                      )}
                    >
                      <Star size={12} fill={saved ? 'currentColor' : 'none'} />
                    </button>
                    <span className="absolute bottom-1.5 right-2 font-mono text-[9px] font-medium" style={{ color: r.accent }}>{r.dept}</span>
                  </div>
                  <div className="flex flex-1 flex-col p-3">
                    <h3 className="line-clamp-2 text-[12.5px] font-semibold leading-4 text-ink">{r.title}</h3>
                    <p className="mt-0.5 truncate text-[10.5px] text-muted">{r.author}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[9.5px] text-muted">
                      <span className="rounded bg-surface-container px-1.5 py-0.5">
                        {r.semester ? `Semester ${r.semester}` : 'All semesters'}
                      </span>
                      <span>{r.year}</span>
                      <span className="text-line">·</span>
                      <span>{r.size}</span>
                    </div>
                    <div className="mt-auto flex items-center justify-between border-t border-line pt-2 pt-2.5">
                      <span className="flex items-center gap-1 font-mono text-[10px] tabular-nums text-muted">
                        <Download size={10} /> {num(r.downloads)}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          size="xs"
                          variant="ghost"
                          icon={ExternalLink}
                          onClick={() => pushToast({ title: 'Opening reader', description: `${r.title} · ${r.format}`, tone: 'info' })}
                          aria-label="Open"
                        />
                        <Button
                          size="xs"
                          variant="secondary"
                          icon={Download}
                          onClick={() => {
                            trackDownload(r.id);
                            pushToast({ title: 'Download started', description: `${r.title} (${r.size})`, tone: 'success' });
                          }}
                        >
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="rounded-xl border border-line bg-surface py-14 text-center">
              <Search size={20} className="mx-auto mb-2 text-muted/60" />
              <p className="text-sm font-semibold text-ink">No resources match those filters</p>
              <Button size="xs" variant="secondary" className="mx-auto mt-3" onClick={() => { setQuery(''); setDept('all'); setType('all'); }}>Reset filters</Button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <SectionCard title="Most downloaded" subtitle="This semester" icon={Star} className="lg:col-span-2">
              <ul className="space-y-2">
                {[...resources].sort((a, b) => b.downloads - a.downloads).slice(0, 5).map((r, i) => (
                  <li key={r.id} className="flex items-center gap-2.5">
                    <span className="mono w-4 text-[10px] text-muted">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-[11.5px] text-ink">{r.title}</span>
                    <div className="w-24"><Progress value={(r.downloads / 2014) * 100} height="h-1" tone={r.accent} /></div>
                    <span className="w-10 text-right font-mono text-[10px] tabular-nums text-muted">{num(r.downloads)}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
            <SectionCard title="Collection policy" subtitle="Library standards" icon={Bookmark}>
              <ul className="space-y-1.5 text-[10.5px] leading-4 text-muted">
                <li>• Only NEP-2020 mapped titles are surfaced for first-year students.</li>
                <li>• IEEE Xplore access is IP-restricted to the campus network and VPN.</li>
                <li>• Uploads require Library Committee approval; copyrighted PDFs are rejected.</li>
                <li>• Downloads are counted for faculty procurement decisions.</li>
              </ul>
            </SectionCard>
          </div>
        </PageStack>
      </PageScroll>

      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </>
  );
}

function UploadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addResource } = useApp();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [dept, setDept] = useState('CSE');
  const [semester, setSemester] = useState('5');
  const [type, setType] = useState<LibraryResource['type']>('Lecture Notes');
  const [format, setFormat] = useState<'PDF' | 'EPUB'>('PDF');

  const submit = () => {
    if (!title.trim()) return;
    addResource({
      title: title.trim(),
      author: author.trim() || 'Vanguard Faculty',
      type,
      dept: dept as LibraryResource['dept'],
      semester: Number(semester),
      size: `${(2 + Math.random() * 12).toFixed(1)} MB`,
      format,
      year: 2026,
      accent: DEPT_MAP[dept as LibraryResource['dept']].tone,
    });
    setTitle('');
    setAuthor('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Upload library resource"
      subtitle="Faculty-contributed notes and journals · reviewed by the Library Committee"
      icon={<Upload size={16} className="text-primary-tint-fg" />}
      footer={
        <>
          <Button size="sm" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button size="sm" variant="primary" icon={Plus} onClick={submit}>Upload resource</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <Field label="Resource title" required className="sm:col-span-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Compiler Design — Lab Companion" autoFocus />
        </Field>
        <Field label="Author / contributor" className="sm:col-span-2">
          <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Dr. Farida Merchant" />
        </Field>
        <Field label="Department">
          <Select value={dept} onChange={(e) => setDept(e.target.value)}>
            {DEPARTMENTS.map((d) => <option key={d.code} value={d.code}>{d.code} — {d.name}</option>)}
          </Select>
        </Field>
        <Field label="Semester">
          <Select value={semester} onChange={(e) => setSemester(e.target.value)}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => <option key={s} value={s}>Semester {s}</option>)}
          </Select>
        </Field>
        <Field label="Resource type">
          <Select value={type} onChange={(e) => setType(e.target.value as LibraryResource['type'])}>
            {['Digital Textbook', 'Lecture Notes', 'IEEE Journal'].map((t) => <option key={t}>{t}</option>)}
          </Select>
        </Field>
        <Field label="File format">
          <Select value={format} onChange={(e) => setFormat(e.target.value as 'PDF' | 'EPUB')}>
            <option>PDF</option>
            <option>EPUB</option>
          </Select>
        </Field>
        <div className="sm:col-span-2 flex items-center justify-center rounded-lg border border-dashed border-line bg-surface-low px-4 py-6 text-[11px] text-muted">
          <Upload size={14} className="mr-2" /> Drop file here · PDF/EPUB up to 50 MB · DMCA-checked on upload
        </div>
      </div>
    </Modal>
  );
}
