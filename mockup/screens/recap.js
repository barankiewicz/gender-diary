/* Recap (F29) — last month's story as a short sequence the user steps
   through, ending in a celebration. Computed locally; view-only. */

import { getState, tagById, streakDays, locale } from '../demo/state.js';
import { header, button, rivePlaceholder, prideAurora } from '../components/ui.js';
import { icon } from '../components/icons.js';

let step = 0;

export function render(root, params, ctx) {
  const state = getState();
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthName = new Intl.DateTimeFormat(locale(), { month: 'long' }).format(first);
  const y = first.getFullYear(), m = first.getMonth();
  const start = Math.floor(Date.UTC(y, m, 1) / 86400000);
  const end = Math.floor(Date.UTC(y, m + 1, 0) / 86400000);

  const entries = state.entries.filter(e => e.epochDay >= start && e.epochDay <= end);
  const moods = entries.filter(e => e.mood != null).map(e => e.mood);
  const avgMood = moods.length ? (moods.reduce((a, b) => a + b, 0) / moods.length) : null;
  const tagCounts = {};
  entries.forEach(e => e.tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
  const topTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 3)
    .map(([id, n]) => ({ label: tagById(id)?.label ?? id, n }));
  const milestonesReached = state.milestones.filter(mi => mi.epochDay >= start && mi.epochDay <= end);
  const dimVals = entries.map(e => e.dims?.euphoria_dysphoria).filter(v => v != null);
  const dimChange = dimVals.length > 1 ? Math.round(dimVals[dimVals.length - 1] - dimVals[0]) : null;

  const steps = [
    { title: `Your ${monthName}`, body: `One month, held in your own words.`, rive: 'Recap opener: calendar pages turning' },
    { title: `${entries.length} entries`, body: entries.length ? `You showed up ${entries.length} times. Some days were two-entry days — gender moves, and you caught it moving.` : 'A quiet month. Quiet counts too.', rive: null },
    { title: avgMood ? `Mood: ${avgMood.toFixed(1)} of 5` : 'Mood', body: avgMood ? `Averaged across the month. Not a grade — just where you were.` : 'No moods logged this month.', rive: null },
    { title: `Best streak: ${Math.min(streakDays(), 28)} days`, body: 'Consecutive days with an entry. Consistency is a kindness to your future self.', rive: null },
    { title: 'Top tags', body: topTags.length ? topTags.map(t => `${t.label} (${t.n})`).join(' · ') : 'No tags this month.', rive: null },
    { title: milestonesReached.length ? `${milestonesReached.length} milestone${milestonesReached.length === 1 ? '' : 's'}` : 'Milestones', body: milestonesReached.length ? milestonesReached.map(mi => mi.name).join(' · ') : 'No milestones landed this month — some are on their way.', rive: null },
    { title: dimChange != null ? `Gender feeling: ${dimChange >= 0 ? '+' : ''}${dimChange}` : 'Gender feeling', body: 'The biggest shift across your scales this month. Whatever direction — it is yours.', rive: null },
    { title: `That was ${monthName}`, body: 'Thank you for keeping your own record. See you tomorrow.', rive: 'Recap finale: celebration in flag colours', confetti: true },
  ];
  if (step >= steps.length) step = 0;
  const s = steps[step];

  root.innerHTML = `
    ${prideAurora()}
    ${header('Recap', { back: '#/stats' })}
    <div class="recap-stage">
      ${s.rive ? rivePlaceholder(s.rive, { height: 150, variant: s.confetti ? 'confetti' : 'bloom' }) : ''}
      <h2 class="recap-title">${s.title}</h2>
      <p class="recap-body">${s.body}</p>
      <div class="recap-progress">
        ${steps.map((_, i) => `<span class="ob-dot ${i <= step ? 'is-done' : ''}"></span>`).join('')}
      </div>
      <div class="ob-actions">
        ${step < steps.length - 1
          ? button('Next', { attrs: 'data-next' }) + (step > 0 ? button('Back', { kind: 'ghost', attrs: 'data-back' }) : '')
          : button('Done', { attrs: 'data-done' })}
      </div>
    </div>`;

  root.querySelector('[data-next]')?.addEventListener('click', () => { step++; render(root, params, ctx); });
  root.querySelector('[data-back]')?.addEventListener('click', () => { step--; render(root, params, ctx); });
  root.querySelector('[data-done]')?.addEventListener('click', () => { step = 0; ctx.navigate('#/stats'); });
}
