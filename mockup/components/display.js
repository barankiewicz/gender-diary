/* Presentation components: entry rows, milestone cards, the heat-map month grid,
   and the hand-rolled SVG line chart. Map onto EntryRow.svelte, MilestoneCard.svelte,
   HeatMap.svelte, LineChart.svelte. */

import { icon } from './icons.js';
import { esc, photoThumb } from './ui.js';
import { tagById, fmtDay, fmtTime, todayEpochDay, milestoneStatus, dayMetricValue, getState } from '../demo/state.js';
import { MOODS } from './controls.js';

export function moodDot(mood, size = 26) {
  if (mood == null) return `<span class="mood-dot is-empty" style="--dot:${size}px" title="no mood"></span>`;
  const label = MOODS.find(m => m.value === mood)?.label ?? '';
  return `<span class="mood-dot" style="--dot:${size}px;background:var(--mood-${mood})" role="img" aria-label="mood: ${label}"></span>`;
}

/* The standard entry presentation (Home recent entries, day detail, search results). */
export function entryCard(e, { showDay = true, dayCount = 1, href } = {}) {
  const tags = e.tags.map(id => tagById(id)).filter(Boolean).slice(0, 4);
  const more = e.tags.length - tags.length;
  return `
    <a class="entry-card" href="${href ?? `#/entry/${e.id}`}">
      <div class="entry-side">${moodDot(e.mood)}</div>
      <div class="entry-main">
        <div class="entry-meta">
          ${showDay ? `<span class="entry-day">${fmtDay(e.epochDay, { weekday: 'short', day: 'numeric', month: 'short' })}</span>` : ''}
          <span class="entry-time">${fmtTime(e.timestamp)}</span>
          ${dayCount > 1 ? `<span class="entry-multi">${icon('dots', 13)} ${dayCount} that day</span>` : ''}
          ${e.photos?.length ? `<span class="entry-has-photo">${icon('image', 13)}</span>` : ''}
        </div>
        ${e.note ? `<p class="entry-note">${esc(e.note)}</p>` : ''}
        ${tags.length ? `<div class="entry-tags">
          ${tags.map(t => `<span class="tag-chip is-mini">${esc(t.label)}</span>`).join('')}
          ${more > 0 ? `<span class="tag-chip is-mini is-more">+${more}</span>` : ''}
        </div>` : ''}
      </div>
    </a>`;
}

/* Entries grouped by day, newest day first — used by Home and lists. */
export function entriesByDay(entries, limitDays = Infinity) {
  const byDay = new Map();
  for (const e of entries) {
    if (!byDay.has(e.epochDay)) byDay.set(e.epochDay, []);
    byDay.get(e.epochDay).push(e);
  }
  return [...byDay.entries()].sort((a, b) => b[0] - a[0]).slice(0, limitDays);
}

export function milestoneCard({ m, s }, { href = `#/timeline` } = {}) {
  let status, badge = '';
  if (s.type === 'countdown') status = `in ${s.days} day${s.days === 1 ? '' : 's'}`;
  else if (s.type === 'today') { status = 'today'; badge = `<span class="milestone-today">${icon('sparkle', 14)} today</span>`; }
  else {
    status = `${s.years} year${s.years === 1 ? '' : 's'} ago`;
    if (s.isAnnivToday) badge = `<span class="milestone-today">${icon('sparkle', 14)} anniversary</span>`;
    else status += ` · next in ${s.inDays} d`;
  }
  return `
    <a class="milestone-card" href="${href}">
      ${m.photo ? photoThumb(m.photo, { size: 44 }) : `<span class="milestone-icon">${icon('flag', 20)}</span>`}
      <span class="milestone-text">
        <span class="milestone-name">${esc(m.name)}</span>
        <span class="milestone-status">${fmtDay(m.epochDay, { day: 'numeric', month: 'short', year: 'numeric' })} · ${status}</span>
        ${badge}
      </span>
    </a>`;
}

/* Month heat-map grid. metric colours come from the shared ramp. */
export function heatmapMonth(year, month /* 0-based */, { onDayHref } = {}) {
  const state = getState();
  const metric = state.prefs.colorMetric;
  const first = new Date(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const startDow = (first.getUTCDay() + 6) % 7; // Monday-first
  const today = todayEpochDay();
  const dows = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  let cells = dows.map(d => `<span class="hm-dow" aria-hidden="true">${d}</span>`).join('');
  cells += '<span class="hm-cell is-blank"></span>'.repeat(startDow);
  for (let d = 1; d <= daysInMonth; d++) {
    const epochDay = Math.floor(Date.UTC(year, month, d) / 86400000);
    const v = dayMetricValue(epochDay, metric);
    const level = v == null ? 0 : Math.min(4, Math.max(1, Math.ceil((v / 100) * 4)));
    const entryCount = state.entries.filter(e => e.epochDay === epochDay).length;
    const isToday = epochDay === today;
    const label = `${fmtDay(epochDay, { day: 'numeric', month: 'long' })}${entryCount ? `, ${entryCount} entr${entryCount === 1 ? 'y' : 'ies'}` : ', no entries'}`;
    cells += entryCount
      ? `<a class="hm-cell has-entries ${isToday ? 'is-today' : ''}" style="background:var(--heat-${level})"
           href="${onDayHref(epochDay)}" aria-label="${label}"><span class="hm-num">${d}</span></a>`
      : `<span class="hm-cell ${isToday ? 'is-today' : ''}" aria-label="${label}"><span class="hm-num">${d}</span></span>`;
  }
  return `<div class="heatmap" role="grid">${cells}</div>`;
}

export function heatLegend() {
  return `
    <div class="heat-legend" aria-label="Colour scale from lowest to highest">
      <span class="legend-end">low</span>
      ${[1, 2, 3, 4].map(i => `<span class="legend-swatch" style="background:var(--heat-${i})"></span>`).join('')}
      <span class="legend-end">high</span>
      <span class="legend-none"><span class="legend-swatch" style="background:var(--heat-0)"></span> no entry</span>
    </div>`;
}

/* Hand-rolled SVG line chart (the app adds d3-scale/d3-shape; the mockup keeps
   zero dependencies). points: [{day, value}], domain [min,max]. */
export function lineChart(points, { min = 0, max = 100, height = 120, width = 320, showDots = false } = {}) {
  if (points.length < 2) {
    return `<div class="chart-too-little">Not enough data in this range yet.</div>`;
  }
  const P = 8;
  const x0 = points[0].day, x1 = points[points.length - 1].day;
  const sx = (d) => P + ((d - x0) / Math.max(1, x1 - x0)) * (width - 2 * P);
  const sy = (v) => height - P - ((v - min) / (max - min)) * (height - 2 * P);
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${sx(p.day).toFixed(1)},${sy(p.value).toFixed(1)}`).join('');
  const area = `${line}L${sx(x1).toFixed(1)},${height - P}L${sx(x0).toFixed(1)},${height - P}Z`;
  const grid = [0.25, 0.5, 0.75].map(f =>
    `<line x1="${P}" x2="${width - P}" y1="${(P + f * (height - 2 * P)).toFixed(1)}" y2="${(P + f * (height - 2 * P)).toFixed(1)}" class="chart-gridline"/>`).join('');
  return `
    <svg class="line-chart" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img"
      aria-label="Line chart, ${points.length} points from ${fmtDay(x0, { day: 'numeric', month: 'short' })} to ${fmtDay(x1, { day: 'numeric', month: 'short' })}">
      ${grid}
      <path d="${area}" class="chart-area"/>
      <path d="${line}" class="chart-line"/>
      ${showDots ? points.map(p => `<circle cx="${sx(p.day).toFixed(1)}" cy="${sy(p.value).toFixed(1)}" r="3" class="chart-dot"/>`).join('') : ''}
    </svg>`;
}

/* Seven-day strip on Home. */
export function weekStrip(metric, { onPick } = {}) {
  const today = todayEpochDay();
  let html = '<div class="week-strip">';
  for (let i = 6; i >= 0; i--) {
    const day = today - i;
    const v = dayMetricValue(day, metric);
    const level = v == null ? 0 : Math.min(4, Math.max(1, Math.ceil((v / 100) * 4)));
    const name = fmtDay(day, { weekday: 'narrow' });
    html += `
      <span class="week-day ${day === today ? 'is-today' : ''}">
        <span class="week-cell" style="background:var(--heat-${level})" role="img"
          aria-label="${fmtDay(day, { weekday: 'long' })}: ${v == null ? 'no entry' : 'level ' + level + ' of 4'}"></span>
        <span class="week-name">${name}</span>
      </span>`;
  }
  return html + '</div>';
}
