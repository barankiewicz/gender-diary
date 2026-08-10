/* App shell: hash router, app chrome (tab bar / rail), demo control bar.
   Architecture note: one page, screens as ES modules, state in sessionStorage —
   the same component boundaries the SvelteKit app will use (routes ↔ screens/,
   lib/components ↔ components/, lib/theme ↔ tokens/). */

import { getState, onChange, resetDemo, markFirstRun, setPref, todayEpochDay } from './demo/state.js';
import { t } from './demo/i18n.js';
import { icon } from './components/icons.js';
import { el, sheet, button } from './components/ui.js';

import * as onboarding from './screens/onboarding.js';
import * as home from './screens/home.js';
import * as entryEditor from './screens/entryEditor.js';
import * as calendar from './screens/calendar.js';
import * as dayDetail from './screens/dayDetail.js';
import * as search from './screens/search.js';
import * as stats from './screens/stats.js';
import * as recap from './screens/recap.js';
import * as settings from './screens/settings.js';
import * as manageTags from './screens/manageTags.js';
import * as reminders from './screens/reminders.js';
import * as reminderEditor from './screens/reminderEditor.js';
import * as milestoneNew from './screens/milestoneNew.js';
import * as customDimension from './screens/customDimension.js';
import * as exportImport from './screens/exportImport.js';
import * as applock from './screens/applock.js';
import * as progressPhotos from './screens/progressPhotos.js';
import * as labResults from './screens/labResults.js';
import * as timeline from './screens/timeline.js';

const routes = {
  onboarding, home, entry: entryEditor, calendar, day: dayDetail, search, stats, recap,
  settings, 'manage-tags': manageTags, reminders, 'reminder-edit': reminderEditor,
  'milestone-new': milestoneNew, 'custom-dimension': customDimension,
  export: exportImport, applock, photos: progressPhotos, labs: labResults, timeline,
};

/* Screens where the app chrome (tab bar / rail) is hidden */
const CHROMELESS = new Set(['onboarding', 'applock']);

const appEl = document.getElementById('app');
const mainEl = document.getElementById('app-main');

export const ctx = {
  navigate: (hash) => { location.hash = hash; },
  isDesktop: () => document.body.classList.contains('mode-desktop'),
  isAndroid: () => !document.body.classList.contains('mode-desktop'),
  appEl,
  openNewEntryChooser,
};

function parseHash() {
  const raw = (location.hash || '#/home').replace(/^#\/?/, '');
  const [path, query = ''] = raw.split('?');
  const segments = path.split('/').filter(Boolean);
  const params = Object.fromEntries(new URLSearchParams(query));
  return { name: segments[0] || 'home', args: segments.slice(1), params };
}

function applyChrome() {
  const { prefs } = getState();
  const root = document.documentElement;
  root.dataset.palette = prefs.palette;
  const sysDark = matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = prefs.theme === 'system' ? (sysDark ? 'dark' : 'light') : prefs.theme;
  root.dataset.theme = theme;
  document.title = prefs.disguise ? 'Notes' : 'Transition Tracker';
  appEl.classList.toggle('disguised', prefs.disguise);
  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', getComputedStyle(appEl).backgroundColor || '#F4F8FB');
  renderDemoBar();
}

function renderNav(active) {
  const navEl = document.getElementById('app-nav');
  const railEl = document.getElementById('app-rail');
  const items = [
    { key: 'home', label: t('nav_home'), icon: 'home' },
    { key: 'calendar', label: t('nav_calendar'), icon: 'calendar' },
    { key: 'stats', label: t('nav_stats'), icon: 'stats' },
    { key: 'settings', label: t('nav_settings'), icon: 'settings' },
  ];
  const link = (it) => `
    <a class="nav-item ${active === it.key ? 'is-active' : ''}" href="#/${it.key}"
      ${active === it.key ? 'aria-current="page"' : ''}>
      ${icon(it.icon, 24)}<span>${it.label}</span>
    </a>`;
  navEl.innerHTML = `
    ${link(items[0])}${link(items[1])}
    <div class="nav-fab-slot">
      <button class="nav-fab" id="fab" aria-label="${t('new_entry')}">${icon('plus', 26)}</button>
    </div>
    ${link(items[2])}${link(items[3])}`;
  const { prefs } = getState();
  railEl.innerHTML = `
    <div class="rail-brand"><span class="brand-mark"></span><span translate="no">${prefs.disguise ? 'Notes' : 'Gender Diary'}</span></div>
    <div class="rail-new">${button(t('new_entry'), { iconName: 'plus', attrs: 'id="rail-fab" style="width:100%"' })}</div>
    ${items.map(it => `
      <a class="rail-item ${active === it.key ? 'is-active' : ''}" href="#/${it.key}"
        ${active === it.key ? 'aria-current="page"' : ''}>${icon(it.icon, 22)}<span>${it.label}</span></a>`).join('')}`;
  navEl.querySelector('#fab')?.addEventListener('click', openNewEntryChooser);
  railEl.querySelector('#rail-fab')?.addEventListener('click', openNewEntryChooser);
}

/* New-entry chooser: today or another day (F1) */
export function openNewEntryChooser() {
  const today = todayEpochDay();
  const iso = (d) => new Date(d * 86400000).toISOString().slice(0, 10);
  const { close } = sheet(appEl, `
    <h3>${t('new_entry')}</h3>
    <p class="muted small" style="margin-bottom:var(--space-4)">When is this entry for? A day can hold more than one entry.</p>
    <div class="stack-3">
      ${button(t('today'), { attrs: 'data-choose="today"', iconName: 'sun' })}
      <div class="card" style="box-shadow:none;background:var(--surface-2)">
        <label class="field-label" for="backdate">${t('another_day')}</label>
        <div class="spread" style="margin-top:var(--space-2)">
          <input class="input" type="date" id="backdate" name="backdate" max="${iso(today)}" value="${iso(today - 1)}">
          ${button('Go', { kind: 'soft', attrs: 'data-choose="date"' })}
        </div>
      </div>
    </div>`, { title: t('new_entry') });
  appEl.querySelector('[data-choose="today"]').addEventListener('click', () => {
    close(); ctx.navigate(`#/entry/new/${today}`);
  });
  appEl.querySelector('[data-choose="date"]').addEventListener('click', () => {
    const v = appEl.querySelector('#backdate').value;
    if (!v) return;
    close(); ctx.navigate(`#/entry/new/${Math.floor(Date.parse(v + 'T00:00Z') / 86400000)}`);
  });
}

/* ---------- demo control bar ---------- */
const SCREEN_JUMPS = [
  ['#/onboarding?firstrun=1', 'Onboarding (first run)'],
  ['#/home', 'Home'],
  ['#/home?celebrate=1', 'Home · milestone celebration'],
  ['#/entry/new/today', 'New-entry chooser → editor'],
  ['#/calendar', 'Calendar'],
  ['#/day/today', 'Day detail (today)'],
  ['#/search', 'Search'],
  ['#/stats', 'Stats'],
  ['#/recap', 'Recap'],
  ['#/settings', 'Settings'],
  ['#/manage-tags', 'Manage tags'],
  ['#/reminders', 'Reminders'],
  ['#/reminder-edit/new', 'Reminder editor'],
  ['#/milestone-new', 'New milestone'],
  ['#/custom-dimension', 'Custom dimension'],
  ['#/export', 'Export & import'],
  ['#/applock', 'App lock'],
  ['#/photos', 'Progress photos'],
  ['#/labs', 'Lab results'],
  ['#/timeline', 'Transition timeline'],
];

function renderDemoBar() {
  const bar = document.getElementById('demo-bar');
  const theme = document.documentElement.dataset.theme;
  const mode = document.body.classList.contains('mode-desktop') ? 'desktop' : 'phone';
  bar.innerHTML = `
    <span class="demo-title">Mockup demo controls</span>
    <div class="demo-group" role="group" aria-label="Theme">
      <button class="demo-btn ${theme === 'light' ? 'is-active' : ''}" data-demo-theme="light">${icon('sun', 15)} Light</button>
      <button class="demo-btn ${theme === 'dark' ? 'is-active' : ''}" data-demo-theme="dark">${icon('moon', 15)} Dark</button>
    </div>
    <div class="demo-group" role="group" aria-label="Viewport">
      <button class="demo-btn ${mode === 'phone' ? 'is-active' : ''}" data-demo-mode="phone">Phone</button>
      <button class="demo-btn ${mode === 'desktop' ? 'is-active' : ''}" data-demo-mode="desktop">Web</button>
    </div>
    <button class="demo-btn" data-demo-reset>Reset demo state</button>
    <div class="demo-jump">
      <label class="visually-hidden" for="jump">Jump to screen</label>
      <select id="jump">
        <option value="">Jump to screen…</option>
        ${SCREEN_JUMPS.map(([h, l]) => `<option value="${h}">${l}</option>`).join('')}
      </select>
    </div>`;
  bar.querySelectorAll('[data-demo-theme]').forEach(b =>
    b.addEventListener('click', () => { setPref('theme', b.dataset.demoTheme); }));
  bar.querySelectorAll('[data-demo-mode]').forEach(b =>
    b.addEventListener('click', () => {
      document.body.classList.toggle('mode-desktop', b.dataset.demoMode === 'desktop');
      document.body.classList.toggle('mode-phone', b.dataset.demoMode === 'phone');
      render();
    }));
  bar.querySelector('[data-demo-reset]').addEventListener('click', () => {
    resetDemo(); location.hash = '#/home';
  });
  bar.querySelector('#jump').addEventListener('change', (e) => {
    if (!e.target.value) return;
    if (e.target.value.startsWith('#/onboarding')) markFirstRun();
    location.hash = e.target.value;
    e.target.value = '';
  });
}

/* ---------- render loop ---------- */
function render() {
  const { name, args, params } = parseHash();
  const route = routes[name] || routes.home;
  const resolvedArgs = args.map(a => a === 'today' ? String(todayEpochDay()) : a);

  // First-run gate: never show the app before onboarding is done.
  const { prefs } = getState();
  if (!prefs.onboarded && name !== 'onboarding') { location.hash = '#/onboarding'; return; }

  applyChrome();
  // A sheet left open must not survive navigation (it would block the screen).
  appEl.querySelectorAll('.sheet-scrim').forEach(n => n.remove());
  const chromeless = CHROMELESS.has(name);
  document.getElementById('app-nav').style.display = chromeless ? 'none' : '';
  document.getElementById('app-rail').style.display = chromeless ? 'none' : '';
  renderNav(name);

  mainEl.innerHTML = '';
  const screenEl = el('<div class="screen"></div>');
  mainEl.appendChild(screenEl);
  route.render(screenEl, { args: resolvedArgs, params }, ctx);

  // Staggered entrance for list content — only when arriving at a screen,
  // not on in-place re-renders (toggles, mood picks) where it would flicker.
  const hashNow = location.hash;
  if (hashNow !== render._lastHash) {
    screenEl.querySelectorAll(':scope > .entry-card, :scope > .card, :scope > .list-group, .milestone-scroller > *, :scope > .stack-3 > *')
      .forEach((n, i) => {
        n.style.setProperty('--stagger-i', Math.min(i, 8));
        n.classList.add('stagger-in');
      });
  }
  render._lastHash = hashNow;
  mainEl.scrollTop = 0;
}

window.addEventListener('hashchange', render);
onChange(() => {
  // Editors keep local drafts, so a store change always means "re-render is safe".
  render();
});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (getState().prefs.theme === 'system') render();
});

/* Optional deep-link params for reviewers: ?mode=desktop&theme=dark */
const boot = new URLSearchParams(location.search);
if (boot.get('mode') === 'desktop') { document.body.classList.replace('mode-phone', 'mode-desktop'); }
if (boot.get('theme') === 'dark' || boot.get('theme') === 'light') setPref('theme', boot.get('theme'));
if (boot.get('palette')) setPref('palette', boot.get('palette'));

if (!location.hash) location.hash = '#/home';
render();
