import { createServer } from 'vite';
import { JSDOM } from 'jsdom';
import { createElement, StrictMode } from 'react';
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' });
const { AppProvider } = await server.ssrLoadModule('/src/store/AppStore.tsx');
const App = (await server.ssrLoadModule('/src/App.tsx')).default;

const dom = new JSDOM('<!doctype html><html class="light"><body><div id="root"></div></body></html>', { url: 'http://localhost/#/dashboard', pretendToBeVisual: true });
const { window } = dom;
global.window = window; global.document = window.document;
Object.defineProperty(global, 'navigator', { value: window.navigator, configurable: true, writable: true });
for (const k of ['HTMLElement','Node','localStorage','KeyboardEvent','Event','MouseEvent','Blob','URL','HTMLInputElement','HTMLTextAreaElement','HTMLSelectElement']) global[k] = window[k];
window.scrollTo = () => {};
window.matchMedia = window.matchMedia ?? (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
global.IS_REACT_ACT_ENVIRONMENT = true;
const ReactDOM = await import('react-dom/client');
const { flushSync } = await import('react-dom');
const errors = [];
const origErr = console.error;
console.error = (...a) => { const m = a.map(String).join(' '); if (/not wrapped in act|Not implemented/.test(m)) return; errors.push('console.error: ' + m.slice(0, 400)); origErr(...a); };
window.addEventListener('error', (e) => errors.push('windowerror: ' + e.message));
const root = ReactDOM.createRoot(document.getElementById('root'));
flushSync(() => root.render(createElement(StrictMode, null, createElement(AppProvider, null, createElement(App)))));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await wait(2200);

const click = async (text, ms = 500) => {
  const btn = [...document.querySelectorAll('button')].find((b) => (b.textContent ?? '').trim().toLowerCase().includes(text.toLowerCase()));
  if (!btn) { errors.push(`button not found: ${text}`); return false; }
  btn.click(); await wait(ms); return true;
};
const setField = (el, v) => {
  const proto = el.tagName === 'SELECT' ? window.HTMLSelectElement.prototype : el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value')?.set?.call(el, v);
  el.dispatchEvent(new window.Event('input', { bubbles: true }));
  el.dispatchEvent(new window.Event('change', { bubbles: true }));
};
const route = async (r) => { window.location.hash = '#' + r; await wait(1200); };
const assertText = (needle, where) => { if (!(document.body.textContent ?? '').includes(needle)) errors.push(`${where}: missing "${needle}"`); };

/* Dashboard customise modal */
await route('/dashboard');
await click('Customize'); assertText('Customize dashboard', 'dashboard customize');
await click('Apply changes'); await wait(400);
assertText('Dashboard updated', 'dashboard toast');

/* Students: filters + profile modal */
await route('/students');
const search = document.querySelector('input[type="search"]');
if (search) { setField(search, 'aarav'); await wait(500); }
const row = [...document.querySelectorAll('tr[tabindex="0"]')][0];
if (row) { row.click(); await wait(500); assertText('Overview & Guardian', 'student profile'); }
else errors.push('students: no clickable rows');
const tab = [...document.querySelectorAll('[role="tab"]')].find((t) => (t.textContent ?? '').includes('Fees, Scholarship'));
if (tab) { tab.click(); await wait(300); assertText('DigiLocker', 'student fee tab'); } else errors.push('student profile tabs missing');
document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await wait(300);

/* CSV import */
await route('/students');
if (await click('CSV Import', 400)) { assertText('Drop CSV here', 'csv modal'); document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await wait(250); }

/* Faculty */
await route('/faculty');
const loadSelect = [...document.querySelectorAll('select')].find((s) => [...s.options].some((o) => o.value === 'over'));
if (loadSelect) { setField(loadSelect, 'over'); await wait(400); } else errors.push('faculty workload filter missing');
const facRow = document.querySelector('tr[tabindex="0"]');
if (facRow) { facRow.click(); await wait(400); assertText('Teaching allocation', 'faculty detail'); }
await click('Add Faculty', 500); assertText('Add faculty member', 'faculty modal add');
document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await wait(250);

/* Timetable */
await route('/timetable');
await click('Detect Conflicts', 1300); assertText('Conflict scan complete', 'timetable toast');
await click('Publish Updates', 500); assertText('Publish timetable updates', 'timetable publish modal');
document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await wait(250);

/* Assignments */
await route('/assignments');
await click('Create Assignment', 500); assertText('Create assignment', 'assignment modal');
document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await wait(250);

/* Scholarships review */
await route('/scholarships');
const review = [...document.querySelectorAll('button')].find((b) => (b.textContent ?? '').trim() === 'Review');
if (review) { review.click(); await wait(400); assertText('Approval checklist', 'scholarship modal'); }
else errors.push('scholarship Review button missing');
const nod = [...document.querySelectorAll('button')].find((b) => (b.textContent ?? '').includes('Record nodal approval'));
if (nod) { nod.click(); await wait(400); assertText('Scholarship status updated', 'scholarship toast'); }

/* Fees: structure + payment + receipt */
await route('/fees');
await click('Add Fee Structure', 500); assertText('Add fee structure', 'fee structure modal');
document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await wait(250);
await route('/fees?tab=submissions');
await click('Record payment', 600); assertText('Record fee payment', 'payment modal');
const utrInput = [...document.querySelectorAll('[role="dialog"] input')].find((i) => (i.placeholder ?? '').includes('UTR'));
if (utrInput) setField(utrInput, 'UTR202699887766');
await wait(200);
{
  const dlg = [...document.querySelectorAll('[role="dialog"]')].pop();
  const btn = [...dlg.querySelectorAll('button')].find((b) => (b.textContent ?? '').includes('Record & generate receipt'));
  if (btn) { btn.click(); await wait(900); } else errors.push('receipt submit button missing');
}
assertText('Official fee receipt', 'receipt modal');
document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await wait(250);

/* Grievances detail */
await route('/grievances');
const g = document.querySelector('tr[tabindex="0"]');
if (g) { g.click(); await wait(400); assertText('Update status', 'grievance modal'); }
document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await wait(250);

/* Support */
await route('/support');
const t = document.querySelector('tr[tabindex="0"]');
if (t) { t.click(); await wait(400); assertText('Assign to agent', 'support modal'); }
document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await wait(250);

/* Library upload + download */
await route('/library');
await click('Upload Resource', 500); assertText('Upload library resource', 'library modal');
document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await wait(250);
const dl = [...document.querySelectorAll('button')].find((b) => (b.textContent ?? '').trim() === 'Download');
if (dl) { dl.click(); await wait(400); assertText('Download started', 'library toast'); }

/* Exams sign-off */
await route('/examinations');
await click('Publish Results', 500); assertText('Audit-protected action', 'exam modal');
const pass = document.querySelector('#signoff');
if (pass) setField(pass, 'demo-pass');
const ack = [...document.querySelectorAll('[role="dialog"] input[type="checkbox"]')].find(() => true);
if (ack) ack.click();
await wait(200);
const signBtn = [...document.querySelectorAll('[role="dialog"] button')].find((b) => (b.textContent ?? '').includes('Sign & publish'));
if (signBtn) { signBtn.click(); await wait(400); assertText('Publish results to all students?', 'exam confirm'); await click('Publish now', 700); assertText('Results published', 'exam toast'); }
else errors.push('exam sign button not found or disabled');

/* Notices create + withdraw */
await route('/notices');
await click('Create Notice', 500); assertText('Create notice', 'notice modal');
document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await wait(250);

/* Courses */
await route('/courses');
await click('Add Course', 500); assertText('Add course', 'course modal');
document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await wait(250);

/* Workflow reject path */
await route('/workflow');
const sug = [...document.querySelectorAll('button')].find((b) => (b.textContent ?? '').includes('Grievance Escalation Report'));
if (sug) { sug.click(); await wait(3300); const rej = [...document.querySelectorAll('button')].find((b) => (b.textContent ?? '').trim() === 'Reject'); if (rej) { rej.click(); await wait(400); assertText('Rejected', 'workflow reject'); } else errors.push('reject button missing'); }
else errors.push('workflow suggestion missing');

/* Settings: RBAC + theme cards + reset control */
await route('/settings');
await click('Role-based access', 400); assertText('RBAC matrix', 'settings rbac');
await click('Appearance', 400); assertText('Interface appearance', 'settings appearance');
await click('Light mode', 400);
if (!document.documentElement.classList.contains('light')) errors.push('appearance light toggle failed');
await click('Profile & security', 400); assertText('Reset demo data', 'settings data');

await server.close();
if (errors.length) { console.log(`\n❌ ${errors.length} issues:\n` + errors.map((e,i)=>`${i+1}. ${e}`).join('\n')); process.exit(1); }
console.log('\n✅ interaction sweep clean');
process.exit(0);
