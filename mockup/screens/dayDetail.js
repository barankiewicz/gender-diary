/* Day detail (F9) — full date, day average with entry count, the day’s
   entries as time-stamped rows, and "add another entry for this day". */

import { getState, entriesForDay, dayMetricValue, fmtDay, fmtTime, todayEpochDay } from '../demo/state.js';
import { t } from '../demo/i18n.js';
import { icon } from '../components/icons.js';
import { header, button, emptyState } from '../components/ui.js';
import { entryCard } from '../components/display.js';

export function render(root, { args }, ctx) {
  const epochDay = Number(args[0]);
  const state = getState();
  const entries = entriesForDay(epochDay);
  const metric = state.prefs.colorMetric;
  const metricName = metric === 'mood' ? t('mood')
    : (state.dimensions.find(d => d.key === metric)?.name ?? t('mood'));
  const avg = dayMetricValue(epochDay, metric);
  const isToday = epochDay === todayEpochDay();

  root.innerHTML = `
    ${header(isToday ? t('today') : fmtDay(epochDay, { weekday: 'long' }), { back: '#/calendar' })}
    <p class="editor-date">${fmtDay(epochDay, { day: 'numeric', month: 'long', year: 'numeric' })}</p>

    ${entries.length ? `
      <div class="card day-avg">
        <div>
          <span class="chip-value">${avg == null ? '—' : Math.round(metric === 'mood' ? avg / 20 * 10 : avg * 10) / 10}</span>
          <span class="muted small">avg ${metricName}${metric === 'mood' ? ' (1–5)' : ''}</span>
        </div>
        <span class="muted small">${entries.length} entr${entries.length === 1 ? 'y' : 'ies'} this day</span>
      </div>
      <div class="stack-3" style="margin-top:var(--space-4)">
        ${entries.map(e => `
          <div class="day-entry-row">
            <span class="day-entry-time">${fmtTime(e.timestamp)}</span>
            ${entryCard(e, { showDay: false })}
          </div>`).join('')}
      </div>` : emptyState({
        riveLabel: 'Quiet day illustration',
        title: 'Nothing logged this day',
        text: 'You can still add an entry for it — memory counts.',
      })}

    <div style="margin-top:var(--space-6)">
      ${button('Add another entry for this day', { kind: 'soft', iconName: 'plus', attrs: 'data-add' })}
    </div>`;

  root.querySelector('[data-add]').addEventListener('click', () => ctx.navigate(`#/entry/new/${epochDay}`));
}
