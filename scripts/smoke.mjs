/**
 * Headless smoke test.
 * 1. SSR each page component into static markup (catches render-time crashes).
 * 2. Hydrate the full app inside jsdom and drive key interactions.
 */
import { createServer } from 'vite';
import { JSDOM } from 'jsdom';
import { StrictMode, createElement } from 'react';
import { renderToString } from 'react-dom/server';

const server = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: 'custom',
  logLevel: 'error',
});

const errors = [];
const warn = [];

try {
  /* --------------------------- 1. SSR every page --------------------------- */
  const { AppProvider } = await server.ssrLoadModule('/src/store/AppStore.tsx');
  const pages = [
    'Dashboard', 'Students', 'Faculty', 'Timetable', 'Assignments', 'Scholarships',
    'Fees', 'Grievances', 'Support', 'Library', 'Examinations', 'Notices', 'Courses',
    'Workflow', 'Settings',
  ];
  for (const name of pages) {
    const mod = await server.ssrLoadModule(`/src/pages/${name}.tsx`);
    const Comp = mod.default;
    try {
      const html = renderToString(
        createElement(AppProvider, null, createElement(Comp)),
      );
      if (!html || html.length < 500) errors.push(`${name}: suspiciously small SSR output (${html.length})`);
      else console.log(`  ✓ SSR ${name} (${html.length} chars)`);
    } catch (err) {
      errors.push(`${name}: ${err.stack?.split('\n').slice(0, 6).join('\n')}`);
    }
  }

  /* ----------------------- 2. Hydrate full app in jsdom -------------------- */
  const dom = new JSDOM('<!doctype html><html class="light"><body><div id="root"></div></body></html>', {
    url: 'http://localhost/#/dashboard',
    pretendToBeVisual: true,
  });
  const { window } = dom;
  global.window = window;
  global.document = window.document;
  Object.defineProperty(global, 'navigator', { value: window.navigator, configurable: true, writable: true });
  global.HTMLElement = window.HTMLElement;
  global.Node = window.Node;
  global.localStorage = window.localStorage;
  window.scrollTo = () => {};
  global.KeyboardEvent = window.KeyboardEvent;
  global.Event = window.Event;
  global.Blob = window.Blob;
  global.URL = window.URL;
  global.matchMedia = window.matchMedia ?? (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  window.matchMedia = global.matchMedia;
  global.IS_REACT_ACT_ENVIRONMENT = true;

  const ReactDOM = await import('react-dom/client');
  const App = (await server.ssrLoadModule('/src/App.tsx')).default;

  window.addEventListener('error', (e) => errors.push(`window error: ${e.message}`));
  const originalError = console.error;
  console.error = (...args) => {
    const msg = args.map(String).join(' ');
    if (/not wrapped in act|Warning: ReactDOM.render/i.test(msg)) return;
    errors.push(`console.error: ${msg.slice(0, 600)}`);
    originalError(...args);
  };

  const root = ReactDOM.createRoot(document.getElementById('root'));
  const { flushSync } = await import('react-dom');

  flushSync(() => {
    root.render(createElement(StrictMode, null, createElement(AppProvider, null, createElement(App))));
  });
  await new Promise((r) => setTimeout(r, 2600));

  const text = document.body.textContent ?? '';
  console.log(`\n  Hydrated DOM: ${text.length} chars`);
  const mustContain = ['Vanguard', 'Administration', 'Total Students', '4,820', 'Agentic Workflow'];
  for (const token of mustContain) {
    if (!text.includes(token)) errors.push(`Dashboard missing expected text: "${token}"`);
  }

  /* Route navigation through hash */
  const routes = ['/students', '/faculty', '/timetable', '/assignments', '/scholarships', '/fees', '/grievances', '/support', '/library', '/examinations', '/notices', '/courses', '/workflow', '/settings'];
  for (const r of routes) {
    window.location.hash = `#${r}`;
    await new Promise((res) => setTimeout(res, 900));
    const t = document.body.textContent ?? '';
    if (t.length < 1200) errors.push(`Route ${r} rendered suspiciously little (${t.length} chars)`);
    else console.log(`  ✓ route ${r} (${t.length} chars)`);
  }

  /* Dark mode toggle persistence */
  window.location.hash = '#/dashboard';
  await new Promise((res) => setTimeout(res, 1200));
  const themeBtn = [...document.querySelectorAll('button')].find((b) => (b.getAttribute('aria-label') ?? '').startsWith('Switch to'));
  if (themeBtn) {
    themeBtn.click();
    await new Promise((res) => setTimeout(res, 120));
    if (!document.documentElement.classList.contains('dark')) errors.push('Theme toggle did not apply .dark class');
    if (localStorage.getItem('vanguard-theme') !== '"dark"') errors.push(`Theme not persisted (got ${localStorage.getItem('vanguard-theme')})`);
    console.log('  ✓ dark mode toggles + persists');
  } else {
    errors.push('Theme toggle button not found');
  }

  /* Command palette (Ctrl+K) */
  window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
  await new Promise((res) => setTimeout(res, 250));
  const palette = document.querySelector('[role="dialog"][aria-label="Global search"]');
  if (!palette) errors.push('Ctrl+K did not open command palette');
  else {
    const input = palette.querySelector('input');
    if (!input) throw new Error('palette input missing');
    input.focus();
    const ok = document.execCommand && document.execCommand('insertText', false, 'aarav');
    if (!ok) {
      const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value')?.set;
      setter?.call(input, 'aarav');
    }
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
    await new Promise((res) => setTimeout(res, 220));
    const listText = palette.textContent ?? '';
    if (!/Aarav/i.test(listText)) errors.push('Command palette filtering did not match "aarav"');
    else console.log('  ✓ Ctrl+K palette opens + filters');
    window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await new Promise((res) => setTimeout(res, 120));
    if (document.querySelector('[role="dialog"][aria-label="Global search"]')) errors.push('Escape did not close palette');
  }

  /* Sidebar collapse */
  const collapseBtn = document.querySelector('[aria-label="Collapse sidebar"]');
  if (collapseBtn) {
    collapseBtn.click();
    await new Promise((res) => setTimeout(res, 120));
    if (document.querySelector('aside')?.className.includes('w-[256px]')) errors.push('Sidebar collapse did not apply');
    else console.log('  ✓ sidebar collapse');
  }

  /* Student add modal */
  window.location.hash = '#/students?new=1';
  await new Promise((res) => setTimeout(res, 1600));
  const dialog = document.querySelector('[role="dialog"]');
  if (!dialog) errors.push('Add student modal did not open from deep link');
  else console.log('  ✓ add student modal opens from ?new=1');

  /* Student creation end-to-end */
  window.location.hash = '#/students?new=1';
  await new Promise((res) => setTimeout(res, 1400));
  const dlg = document.querySelector('[role="dialog"]');
  if (!dlg) errors.push('student dialog missing for creation test');
  else {
    const setVal = (el, v) => {
      const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value')?.set;
      setter?.call(el, v);
      el.dispatchEvent(new window.Event('input', { bubbles: true }));
      el.dispatchEvent(new window.Event('change', { bubbles: true }));
    };
    const inputs = [...dlg.querySelectorAll('input')];
    const selects = [...dlg.querySelectorAll('select')];
    setVal(inputs[0], 'Test Student Rao');
    setVal(inputs[1], '2026CSEB999');
    setVal(inputs[2], 'test.rao@vitp.ac.in');
    setVal(inputs[3], '9876543210');
    if (selects[0]) setVal(selects[0], 'CSE');
    await new Promise((res) => setTimeout(res, 120));
    const createBtn = [...dlg.querySelectorAll('button')].find((b) => (b.textContent ?? '').includes('Create student'));
    if (!createBtn) errors.push('Create student button missing');
    else {
      createBtn.click();
      await new Promise((res) => setTimeout(res, 500));
      const body = document.body.textContent ?? '';
      if (!body.includes('Test Student Rao')) errors.push('Created student did not appear in the table');
      else console.log('  ✓ add student appends row + toast');
      if (!body.includes('Student record created')) errors.push('Success toast missing after creation');
    }
  }

  /* Fee payment ledger */
  window.location.hash = '#/fees?tab=submissions';
  await new Promise((res) => setTimeout(res, 1500));
  const before = document.body.textContent ?? '';
  if (!before.includes('Record payment')) errors.push('Fees submissions tab did not render ledger CTA');
  else console.log('  ✓ fees submissions ledger renders');

  /* Helper functions must format Indian currency + dates */
  const fmt = await server.ssrLoadModule('/src/lib/format.ts');
  if (fmt.inr(164500) !== '₹1,64,500') errors.push(`inr() grouping wrong: ${fmt.inr(164500)}`);
  if (fmt.compactInr(184200000) !== '₹18.42 Cr') errors.push(`compactInr() wrong: ${fmt.compactInr(184200000)}`);
  if (fmt.fmtDate('2026-12-02') !== '02 Dec 2026') errors.push(`fmtDate() wrong: ${fmt.fmtDate('2026-12-02')}`);
  console.log('  ✓ Indian currency + date formatting');

  /* Workflow approval flow */
  window.location.hash = '#/workflow';
  await new Promise((res) => setTimeout(res, 1600));
  const suggestion = [...document.querySelectorAll('button')].find((b) => (b.textContent ?? '').includes('Attendance < 75% Audit'));
  if (!suggestion) errors.push('Workflow suggestion card missing');
  else {
    suggestion.click();
    await new Promise((res) => setTimeout(res, 3200));
    const wfText = document.body.textContent ?? '';
    if (!wfText.includes('Awaiting Approval')) errors.push('Workflow did not reach Awaiting Approval state');
    else console.log('  ✓ orchestrator executes 4-step timeline');
    const approve = [...document.querySelectorAll('button')].find((b) => (b.textContent ?? '').includes('Approve & Execute'));
    if (approve) {
      approve.click();
      await new Promise((res) => setTimeout(res, 250));
      const after = document.body.textContent ?? '';
      if (!after.includes('Completed')) errors.push('Approve did not set Completed');
      else console.log('  ✓ approve locks bar + writes audit entry');
    } else errors.push('Approve button not found');
  }
} catch (err) {
  errors.push(`fatal: ${err.stack}`);
}

await server.close();

if (warn.length) console.log('\nWarnings:\n', warn.join('\n'));
if (errors.length) {
  console.log(`\n❌ ${errors.length} problem(s):\n`);
  errors.forEach((e, i) => console.log(`${i + 1}. ${e}\n`));
  process.exit(1);
}
console.log('\n✅ all smoke checks passed');
process.exit(0);
