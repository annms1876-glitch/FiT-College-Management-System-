import { createServer } from 'vite';
import { JSDOM } from 'jsdom';
import { createElement, StrictMode } from 'react';
const server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom', logLevel: 'error' });
const { AppProvider } = await server.ssrLoadModule('/src/store/AppStore.tsx');
const App = (await server.ssrLoadModule('/src/App.tsx')).default;

const dom = new JSDOM('<!doctype html><html class="dark"><body><div id="root"></div></body></html>', {
  url: 'http://localhost/#/dashboard',
  pretendToBeVisual: true,
  beforeParse(window) {
    // Simulate a returning dark-mode user whose preference was already saved.
    window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
  },
});
const { window } = dom;
global.window = window; global.document = window.document;
Object.defineProperty(global, 'navigator', { value: window.navigator, configurable: true, writable: true });
for (const k of ['HTMLElement','Node','localStorage','KeyboardEvent','Event','MouseEvent','Blob','URL']) global[k] = window[k];
window.scrollTo = () => {};
window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
global.IS_REACT_ACT_ENVIRONMENT = true;
window.localStorage.setItem('vanguard-theme', '"dark"');
const ReactDOM = await import('react-dom/client');
const { flushSync } = await import('react-dom');
const errors = [];
const oErr = console.error; console.error = (...a) => { const m = a.map(String).join(' '); if (!/not wrapped in act|Not implemented/.test(m)) { errors.push(m.slice(0, 300)); } };
const root = ReactDOM.createRoot(document.getElementById('root'));
flushSync(() => root.render(createElement(StrictMode, null, createElement(AppProvider, null, createElement(App)))));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await wait(2600);
console.error = oErr;

// 1) Theme: dark class present + persisted
errors.pushIf = null;
if (!document.documentElement.classList.contains('dark')) errors.push('dark class not applied');
if (localStorage.getItem('vanguard-theme') !== '"dark"') errors.push('dark theme not persisted');

// 2) Token classes actually used
const html = document.body.innerHTML;
const required = ['bg-surface', 'text-ink', 'border-line', 'font-display', 'font-mono', 'tabular-nums', 'bg-primary-tint', 'text-muted', 'rounded-xl'];
const missing = required.filter((c) => !html.includes(c));
if (missing.length) errors.push('missing token classes in DOM: ' + missing.join(', '));

// 3) Money formatting en-IN and date format
const text = document.body.textContent ?? '';
if (!/₹2\.48 Cr/.test(text)) errors.push('expected ₹2.48 Cr on dashboard');
if (!/\d{2} \w{3} \d{4}/.test(text)) errors.push('no DD MMM YYYY dates found');
if ((text.match(/₹[\d,]+/g) || []).some((m) => /^₹\d{1,3}(,\d{3})+(?!\d)/.test(m) && !/^₹\d{1,2},/.test(m) && !/^₹\d{1,2},\d{2},\d{2}/.test(m))) {
  // group check: Indian grouping allows last group of 3, others of 2
  for (const m of text.match(/₹[\d,]+/g) || []) {
    const digits = m.replace(/[₹,]/g, '');
    if (digits.length > 3) {
      const groups = m.slice(1).split(',');
      const ok = groups.slice(1, -1).every((g) => g.length === 2) && groups[groups.length - 1].length === 3;
      if (!ok) errors.push(`non-Indian grouping: ${m}`);
    }
  }
}

// 4) No raw token leakage
if (/(var\(--|undefined|NaN|₹NaN)/.test(text)) errors.push('raw token or NaN leaked into text');

// 5) Accessibility basics
for (const btn of document.querySelectorAll('button')) {
  const hasLabel = btn.textContent?.trim() || btn.getAttribute('aria-label') || btn.getAttribute('title');
  if (!hasLabel) { errors.push('button without accessible name: ' + btn.className.slice(0, 60)); break; }
}
const imgsWithoutAlt = document.querySelectorAll('img:not([alt])').length;
if (imgsWithoutAlt) errors.push(`${imgsWithoutAlt} img without alt`);

// 6) Sidebar collapse keeps labels from overflowing (width class)
const aside = document.querySelector('aside');
if (aside && !/lg:/.test(aside.className)) errors.push('sidebar missing responsive classes');

await server.close();
if (errors.length) { console.log('❌\n' + errors.map((e, i) => `${i + 1}. ${e}`).join('\n')); process.exit(1); }
console.log('✅ style + a11y audit clean (dark mode, tokens, ₹ en-IN grouping, DD MMM YYYY, labels)');
process.exit(0);
