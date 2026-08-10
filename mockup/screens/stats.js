/* Stats (F10) — range selector 7/14/30/90/180/365 (updates the title),
   streak, a chart per active dimension + mood with range averages, dated
   value lists, tag insights (F20), and the recap entry point (F29). */

import { getState, activeDimensions, seriesForRange, streakDays, tagInsights, fmtDay, locale } from '../demo/state.js';
import { t } from '../demo/i18n.js';
import { icon } from '../components/icons.js';
import { header, sectionTitle, sheet, emptyState, esc } from '../components/ui.js';
import { lineChart } from '../components/display.js';
import { MOODS } from '../components/controls.js';

const RANGES = [7, 14, 30, 90, 180, 365];
let range = 30;

export function render(root, params, ctx) {
  const state = getState();
  const dims = activeDimensions();
  const streak = streakDays();

  const metrics = [
    { key: 'mood', name: 'Mood', min: 1, max: 5, unit: '' },
    ...dims.map(d => ({ key: d.key, name: d.name, min: d.min, max: d.max, unit: '' })),
  ];

  const insights = tagInsights(range, state.prefs.colorMetric);
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthName = new Intl.DateTimeFormat(locale(), { month: 'long' }).format(lastMonth);

  root.innerHTML = `
    ${header(`${t('nav_stats')} · last ${range} days`)}
    <div class="segmented" role="radiogroup" aria-label="Range" style="margin-bottom:var(--space-4)">
      ${RANGES.map(r => `
        <button class="segment ${r === range ? 'is-active' : ''}" role="radio" aria-checked="${r === range}"
          data-range="${r}">${r}d</button>`).join('')}
    </div>

    ${streak > 0 ? `
      <div class="card spread" style="margin-bottom:var(--space-4)">
        <span class="row-text">
          <span class="row-title">${icon('sparkle', 16)} ${streak} day${streak === 1 ? '' : 's'} in a row with an entry</span>
          <span class="row-subtitle">quiet consistency beats perfection</span>
        </span>
      </div>` : ''}

    <div id="charts"></div>

    ${sectionTitle('Tag insights', `avg ${state.prefs.colorMetric === 'mood' ? 'mood' : 'metric'} with vs without`)}
    ${insights.length ? `
      <div class="list-group">
        ${insights.slice(0, 6).map(i => `
          <button class="list-row" data-insight="${i.id}">
            <span class="row-text">
              <span class="row-title">${esc(i.label)}</span>
              <span class="row-subtitle">${i.count} entries · avg ${fmtMetric(i.withAvg, state)} with · ${fmtMetric(i.withoutAvg, state)} without</span>
            </span>
            <span class="insight-delta ${i.withAvg >= i.withoutAvg ? '' : 'is-neg'}">${i.withAvg >= i.withoutAvg ? '+' : '−'}${fmtMetric(Math.abs(i.withAvg - i.withoutAvg), state)}</span>
          </button>`).join('')}
      </div>
      <p class="muted small" style="margin-top:var(--space-2)">Observations, not conclusions — tags with fewer than 3 entries in range are hidden.</p>`
      : `<p class="muted small">Not enough tagged entries in this range yet.</p>`}

    ${sectionTitle('Recap')}
    <a class="card spread recap-cta" href="#/recap">
      <span class="row-text">
        <span class="row-title">Your ${lastMonthName}</span>
        <span class="row-subtitle">a look back at last month</span>
      </span>
      ${icon('chevronRight', 20)}
    </a>`;

  /* charts */
  const chartsEl = root.querySelector('#charts');
  metrics.forEach((m, mi) => {
    const series = seriesForRange(range, m.key);
    const avg = series.length ? series.reduce((a, p) => a + p.value, 0) / series.length : null;
    const card = document.createElement('button');
    card.className = 'card chart-card';
    // alternate the two palette accents across charts
    if (mi % 2 === 1) card.style.cssText = '--chart-line:var(--chart-line-2);--chart-fill:var(--chart-fill-2)';
    card.setAttribute('data-metric', m.key);
    card.innerHTML = `
      <div class="spread">
        <span class="chart-title">${esc(m.name)}</span>
        <span class="chart-avg">${avg == null ? '—' : `avg ${m.key === 'mood' ? avg.toFixed(1) : Math.round(avg)}`}</span>
      </div>
      ${series.length >= 2 ? lineChart(series, { min: m.min, max: m.max }) :
        `<div class="chart-too-little">Not enough data in this range yet.</div>`}`;
    card.addEventListener('click', () => openValueList(m, ctx));
    chartsEl.appendChild(card);
  });

  root.querySelectorAll('[data-range]').forEach(b => b.addEventListener('click', () => {
    range = Number(b.dataset.range);
    render(root, params, ctx);
  }));

  root.querySelectorAll('[data-insight]').forEach(b => b.addEventListener('click', () => {
    openInsightList(b.dataset.insight, ctx);
  }));

  function openValueList(m, ctx) {
    const series = seriesForRange(range, m.key);
    sheet(ctx.appEl, `
      <h3>${esc(m.name)} — values</h3>
      <div class="value-list">
        ${[...series].reverse().map(p => `
          <div class="value-row">
            <span>${fmtDay(p.day, { day: 'numeric', month: 'short' })}</span>
            <span class="muted small">${p.count > 1 ? `avg of ${p.count}` : ''}</span>
            <strong>${m.key === 'mood' ? p.value.toFixed(1) : Math.round(p.value)}</strong>
          </div>`).join('') || '<p class="muted small">No values in this range.</p>'}
      </div>`);
  }

  function openInsightList(tagId, ctx) {
    const stateNow = getState();
    const entries = stateNow.entries
      .filter(e => e.tags.includes(tagId))
      .sort((a, b) => b.epochDay - a.epochDay).slice(0, 20);
    const label = insights.find(i => i.id === tagId)?.label ?? 'tag';
    sheet(ctx.appEl, `
      <h3>${esc(label)} — entries</h3>
      <div class="value-list">
        ${entries.map(e => `
          <a class="value-row" href="#/entry/${e.id}">
            <span>${fmtDay(e.epochDay, { day: 'numeric', month: 'short', year: '2-digit' })}</span>
            <span class="muted small" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(e.note || '')}</span>
            <strong>${e.mood ? MOODS.find(m => m.value === e.mood).label : ''}</strong>
          </a>`).join('')}
      </div>`);
  }
}

function fmtMetric(v, state) {
  return state.prefs.colorMetric === 'mood' ? (v / 20).toFixed(1) : String(Math.round(v));
}
