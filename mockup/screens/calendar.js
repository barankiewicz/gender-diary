/* Calendar (F9) — monthly heat-map, month navigation, visible colour metric,
   legend, route to Search. Day colour = same metric as the home strip. */

import { getState, fmtDay, locale } from '../demo/state.js';
import { t } from '../demo/i18n.js';
import { icon } from '../components/icons.js';
import { header } from '../components/ui.js';
import { heatmapMonth, heatLegend } from '../components/display.js';

let view = null; // {year, month} — persists while walking months

export function render(root, { args }, ctx) {
  const now = new Date();
  if (args.length === 2) view = { year: Number(args[0]), month: Number(args[1]) };
  if (!view) view = { year: now.getFullYear(), month: now.getMonth() };

  const state = getState();
  const metricName = state.prefs.colorMetric === 'mood' ? t('mood')
    : (state.dimensions.find(d => d.key === state.prefs.colorMetric)?.name ?? t('mood'));
  const monthLabel = new Intl.DateTimeFormat(locale(), { month: 'long', year: 'numeric' })
    .format(new Date(view.year, view.month, 1));

  root.innerHTML = `
    ${header(t('nav_calendar'), {
      action: `<a class="icon-btn" href="#/search" aria-label="Search">${icon('search', 22)}</a>`,
    })}
    <div class="cal-monthbar">
      <button class="icon-btn" data-month="-1" aria-label="Previous month">${icon('chevronLeft', 22)}</button>
      <h2 class="cal-month">${monthLabel}</h2>
      <button class="icon-btn" data-month="1" aria-label="Next month">${icon('chevronRight', 22)}</button>
    </div>
    <p class="muted small" style="text-align:center;margin-bottom:var(--space-4)">
      ${t('coloured_by')} <strong>${metricName}</strong> — change it on Home
    </p>
    <div class="card">
      ${heatmapMonth(view.year, view.month, { onDayHref: (d) => `#/day/${d}` })}
      ${heatLegend()}
    </div>
    <p class="muted small" style="margin-top:var(--space-4)">Days with entries are filled — deeper colour, higher ${metricName}. Multi-entry days use the day’s average. Tap a filled day to see its entries.</p>`;

  root.querySelectorAll('[data-month]').forEach(b => b.addEventListener('click', () => {
    let m = view.month + Number(b.dataset.month), y = view.year;
    if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    view = { year: y, month: m };
    render(root, { args: [] }, ctx);
  }));
}
