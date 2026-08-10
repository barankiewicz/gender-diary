/* Demo state store. Lives in sessionStorage so every walkable flow survives
   navigation; "Reset demo state" restores the pristine sample data.
   The app replaces this module with SQLite repositories + preference stores —
   screens only ever talk to the exported functions below. */

import { initialState, todayEpochDay, milestoneTemplates, dimensions as builtInDims } from './sampleData.js';

const KEY = 'transition-tracker-demo';
let state = load();
let listeners = [];

function load() {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) { const s = JSON.parse(raw); if (s.version === 1) return s; }
  } catch (e) { /* corrupted or unavailable → reseed */ }
  return initialState();
}

function save() {
  try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode etc. */ }
  listeners.forEach(fn => fn(state));
}

export const getState = () => state;
export const onChange = (fn) => { listeners.push(fn); return () => { listeners = listeners.filter(f => f !== fn); }; };

export function resetDemo() {
  sessionStorage.removeItem(KEY);
  state = initialState();
  save();
}

export function markFirstRun() {
  resetDemo();
  state.prefs.onboarded = false;
  state.prefs.name = '';
  state.entries = [];
  state.milestones = [];
  state.labResults = [];
  state.prefs.lastBackupAt = null;
  save();
}

/* ---------- prefs ---------- */
export function setPref(key, value) {
  state.prefs[key] = value;
  save();
}

/* ---------- entries ---------- */
let nextId = 100000;
export function upsertEntry(entry) {
  if (entry.id) {
    const i = state.entries.findIndex(e => e.id === entry.id);
    if (i >= 0) state.entries[i] = { ...state.entries[i], ...entry };
  } else {
    entry.id = nextId++;
    entry.timestamp = entry.timestamp ?? Date.now();
    state.entries.push(entry);
  }
  save();
  return entry.id;
}
export function deleteEntry(id) {
  state.entries = state.entries.filter(e => e.id !== id);
  save();
}
export const getEntry = (id) => state.entries.find(e => e.id === Number(id));
export const entriesForDay = (epochDay) =>
  state.entries.filter(e => e.epochDay === epochDay).sort((a, b) => a.timestamp - b.timestamp);
export const entriesNewestFirst = () =>
  [...state.entries].sort((a, b) => b.epochDay - a.epochDay || b.timestamp - a.timestamp);

export function quickLog(mood) {
  return upsertEntry({ epochDay: todayEpochDay(), mood, note: '', dims: {}, tags: [], photos: [] });
}

/* ---------- derived: metric value for a day (averaged over entries) ---------- */
export function dayMetricValue(epochDay, metric) {
  const list = entriesForDay(epochDay);
  const vals = list.map(e => metric === 'mood' ? (e.mood != null ? e.mood * 20 : null) : e.dims?.[metric] ?? null)
    .filter(v => v != null);
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function streakDays() {
  const days = new Set(state.entries.map(e => e.epochDay));
  let n = 0, d = todayEpochDay();
  if (!days.has(d)) d--;                 // a streak survives until today is over
  while (days.has(d)) { n++; d--; }
  return n;
}

/* ---------- dimensions & presets ---------- */
export function activeDimensions() {
  const presets = [...getPresets()];
  const p = presets.find(x => x.id === state.prefs.activePreset) || presets[0];
  return p.dims.map(k => state.dimensions.find(d => d.key === k)).filter(Boolean);
}
export function getPresets() {
  return [
    { id: 'p-btw', name: 'Binary trans woman', builtIn: true, dims: ['euphoria_dysphoria', 'femininity'] },
    { id: 'p-nb', name: 'Nonbinary — bigender', builtIn: true, dims: ['euphoria_dysphoria', 'femininity', 'masculinity', 'binary_nonbinary', 'agender_gendered'] },
    ...state.customPresets,
  ];
}
export function addCustomDimension(dim) {
  state.dimensions.push({ ...dim, builtIn: false });
  // A custom dimension immediately joins a custom preset based on the active one.
  const active = getPresets().find(p => p.id === state.prefs.activePreset);
  const custom = { id: 'p-custom-' + Date.now(), name: 'Custom', builtIn: false, dims: [...active.dims, dim.key] };
  state.customPresets.push(custom);
  state.prefs.activePreset = custom.id;
  save();
}

/* ---------- tags ---------- */
export function visibleTagGroups() {
  return state.tagGroups.filter(g => g.enabled)
    .map(g => ({ ...g, tags: g.tags.filter(t => !t.hidden) }))
    .filter(g => g.tags.length);
}
export function tagById(id) {
  for (const g of state.tagGroups) { const t = g.tags.find(t => t.id === id); if (t) return t; }
  return null;
}
export function mutateTags(fn) { fn(state.tagGroups); save(); }

/* ---------- milestones ---------- */
export function upsertMilestone(m) {
  if (m.id) {
    const i = state.milestones.findIndex(x => x.id === m.id);
    if (i >= 0) state.milestones[i] = { ...state.milestones[i], ...m };
  } else {
    m.id = 'm' + (nextId++);
    state.milestones.push(m);
  }
  save();
}
export function deleteMilestone(id) { state.milestones = state.milestones.filter(m => m.id !== id); save(); }

export function milestoneStatus(m) {
  const today = todayEpochDay();
  if (m.epochDay > today) return { type: 'countdown', days: m.epochDay - today };
  if (m.epochDay === today) return { type: 'today', days: 0 };
  const years = Math.floor((today - m.epochDay) / 365.25);
  const nextAnniv = Math.round(m.epochDay + (years + 1) * 365.25);
  const isAnnivToday = nextAnniv - Math.round(365.25) === today || (today - m.epochDay) % 365 === 0 && years > 0;
  return { type: 'anniversary', years, inDays: Math.max(0, nextAnniv - today), isAnnivToday };
}
export function upcomingMilestones() {
  return [...state.milestones]
    .map(m => ({ m, s: milestoneStatus(m) }))
    .sort((a, b) => {
      const ka = a.s.type === 'countdown' || a.s.type === 'today' ? a.s.days : a.s.inDays;
      const kb = b.s.type === 'countdown' || b.s.type === 'today' ? b.s.days : b.s.inDays;
      return ka - kb;
    });
}
export function randomTemplates(n = 3) {
  const pool = [...milestoneTemplates];
  const out = [];
  while (out.length < n && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  return out;
}

/* ---------- reminders ---------- */
export function upsertReminder(r) {
  if (r.id) {
    const i = state.reminders.findIndex(x => x.id === r.id);
    if (i >= 0) state.reminders[i] = { ...state.reminders[i], ...r };
  } else { r.id = 'r' + (nextId++); state.reminders.push(r); }
  save();
}
export function setReminderEnabled(id, enabled) {
  const r = state.reminders.find(x => x.id === id); if (r) { r.enabled = enabled; save(); }
}

/* ---------- lab results ---------- */
export function upsertLabResult(l) {
  if (l.id) {
    const i = state.labResults.findIndex(x => x.id === l.id);
    if (i >= 0) state.labResults[i] = { ...state.labResults[i], ...l };
  } else { l.id = 'l' + (nextId++); state.labResults.push(l); }
  save();
}
export function labAnalytes() {
  return [...new Set(state.labResults.map(l => l.analyte))];
}

/* ---------- search ---------- */
const fold = (s) => s.toLowerCase()
  .replace(/[ąàáâä]/g, 'a').replace(/[ćç]/g, 'c').replace(/[ęèéêë]/g, 'e')
  .replace(/[łl]/g, 'l').replace(/[ńñ]/g, 'n').replace(/[óòôö]/g, 'o')
  .replace(/[śš]/g, 's').replace(/[żźž]/g, 'z');
export function searchEntries(query) {
  const q = fold(query.trim());
  if (!q) return [];
  return entriesNewestFirst().filter(e => {
    if (fold(e.note || '').includes(q)) return true;
    return e.tags.some(id => { const t = tagById(id); return t && fold(t.label).includes(q); });
  });
}

/* ---------- stats ---------- */
export function seriesForRange(rangeDays, metric) {
  const today = todayEpochDay();
  const byDay = new Map();
  for (const e of state.entries) {
    if (e.epochDay < today - rangeDays + 1 || e.epochDay > today) continue;
    const v = metric === 'mood' ? (e.mood != null ? e.mood : null) : e.dims?.[metric] ?? null;
    if (v == null) continue;
    if (!byDay.has(e.epochDay)) byDay.set(e.epochDay, []);
    byDay.get(e.epochDay).push(v);
  }
  return [...byDay.entries()]
    .map(([day, vals]) => ({ day, value: vals.reduce((a, b) => a + b, 0) / vals.length, count: vals.length }))
    .sort((a, b) => a.day - b.day);
}

export function tagInsights(rangeDays, metric) {
  const today = todayEpochDay();
  const inRange = state.entries.filter(e => e.epochDay >= today - rangeDays + 1);
  const val = (e) => metric === 'mood' ? (e.mood != null ? e.mood * 20 : null) : e.dims?.[metric] ?? null;
  const allTagIds = new Set(inRange.flatMap(e => e.tags));
  const rows = [];
  for (const id of allTagIds) {
    const t = tagById(id);
    if (!t || t.hidden) continue;
    const withT = inRange.filter(e => e.tags.includes(id)).map(val).filter(v => v != null);
    const without = inRange.filter(e => !e.tags.includes(id)).map(val).filter(v => v != null);
    if (withT.length < 3 || !without.length) continue;   // <3 entries → too noisy
    const avg = a => a.reduce((x, y) => x + y, 0) / a.length;
    rows.push({ id, label: t.label, count: withT.length, withAvg: avg(withT), withoutAvg: avg(without) });
  }
  return rows.sort((a, b) => Math.abs(b.withAvg - b.withoutAvg) - Math.abs(a.withAvg - a.withoutAvg));
}

/* ---------- formatting helpers (locale-aware) ---------- */
export function locale() { return state.prefs.language === 'pl' ? 'pl-PL' : 'en-GB'; }
export function fmtDay(epochDay, opts = { weekday: 'long', day: 'numeric', month: 'long' }) {
  return new Intl.DateTimeFormat(locale(), opts).format(new Date(epochDay * 86400000));
}
export function fmtTime(ts) {
  return new Intl.DateTimeFormat(locale(), { hour: 'numeric', minute: '2-digit' }).format(new Date(ts));
}
export { todayEpochDay, milestoneTemplates };
