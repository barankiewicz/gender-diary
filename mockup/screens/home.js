/* Home (F7) — greeting, quick log (F18), pride motif, milestones,
   last 7 days + metric selector, recent entries, stale-backup notice (F21),
   milestone celebration state (F6). */

import { getState, setPref, quickLog, entriesNewestFirst, upcomingMilestones, streakDays, fmtDay, todayEpochDay, activeDimensions } from '../demo/state.js';
import { t } from '../demo/i18n.js';
import { icon } from '../components/icons.js';
import { sectionTitle, toast, sheet, prideAurora, rivePlaceholder, emptyState, button } from '../components/ui.js';
import { moodPicker } from '../components/controls.js';
import { entryCard, entriesByDay, milestoneCard, weekStrip } from '../components/display.js';

export function render(root, { params }, ctx) {
  const state = getState();
  const { prefs } = state;
  const today = todayEpochDay();

  const upcoming = upcomingMilestones();
  const landing = upcoming.find(x => x.s.type === 'today' || x.s.isAnnivToday);
  const celebrate = params.celebrate === '1' || !!landing;
  const celebrateName = landing?.m.name ?? 'HRT start';
  const celebrateYears = landing?.s.years;

  const backupAgeDays = prefs.lastBackupAt ? Math.floor((Date.now() - prefs.lastBackupAt) / 86400000) : null;
  const showBackupNotice = backupAgeDays != null && backupAgeDays > 30 && !prefs.backupNoticeDismissed;

  const metricName = prefs.colorMetric === 'mood' ? t('mood')
    : (state.dimensions.find(d => d.key === prefs.colorMetric)?.name ?? t('mood'));

  const dayGroups = entriesByDay(entriesNewestFirst(), 5);
  const streak = streakDays();

  root.innerHTML = `
    ${prideAurora()}
    <header class="home-header">
      <h1 class="home-hero" translate="no">Gender Diary</h1>
      <p class="home-hello">${prefs.name ? `${t('hello')} ${prefs.name} · ` : ''}${fmtDay(today)}</p>
      ${streak > 1 ? `<p class="home-streak">${icon('sparkle', 14)} ${streak} ${t('streak')}</p>` : ''}
    </header>

    ${celebrate ? `
      <div class="celebration card" role="status">
        ${rivePlaceholder('Celebration: confetti in flag colours', { height: 90, variant: 'confetti' })}
        <p class="celebration-text"><strong>${celebrateName}</strong>${celebrateYears ? ` — ${celebrateYears} year${celebrateYears === 1 ? '' : 's'} ago today.` : ' is today.'} That day mattered. So does this one.</p>
      </div>` : ''}

    ${showBackupNotice ? `
      <div class="notice notice-warn" role="status">
        ${icon('download', 20)}
        <div class="notice-body">
          <span class="notice-title">Your last backup was ${backupAgeDays} days ago</span>
          Your journal lives only on this device. <a href="#/export">Back it up now</a>
        </div>
        <button class="icon-btn" data-dismiss-backup aria-label="Dismiss">${icon('x', 18)}</button>
      </div>` : ''}

    <div class="card quicklog">
      <p class="quicklog-title">${t('how_feeling')}</p>
      <div id="quicklog-mood"></div>
    </div>

    ${upcoming.length ? `
      ${sectionTitle(t('milestones'), `<a href="#/timeline">Timeline ${icon('chevronRight', 14)}</a>`)}
      <div class="milestone-scroller">
        ${upcoming.slice(0, 4).map(x => milestoneCard(x)).join('')}
      </div>` : ''}

    ${sectionTitle(t('last_seven'), `<button class="metric-chip" data-pick-metric>${t('coloured_by')} <strong>${metricName}</strong> ${icon('chevronDown', 14)}</button>`)}
    <div class="card">${weekStrip(prefs.colorMetric)}</div>

    ${sectionTitle(t('recent_entries'), `<a href="#/calendar">${t('nav_calendar')} ${icon('chevronRight', 14)}</a>`)}
    ${dayGroups.length ? dayGroups.map(([day, list]) =>
      list.map(e => entryCard(e, { dayCount: list.length })).join('')
    ).join('') : emptyState({
      riveLabel: 'Empty home: a small sprout in flag colours',
      title: 'Your story starts with one entry',
      text: 'Log how today felt — a mood is enough. You can always add more later.',
      action: button(t('new_entry'), { attrs: 'data-new-entry' }),
    })}
  `;

  /* quick log (F18): one tap = mood-only entry */
  moodPicker(root.querySelector('#quicklog-mood'), {
    value: null, compact: true,
    onPick: (v) => {
      if (v == null) return;
      const id = quickLog(v);
      toast(ctx.appEl, t('quick_saved'), {
        actionLabel: t('add_details'),
        onAction: () => ctx.navigate(`#/entry/${id}`),
      });
    },
  });

  root.querySelector('[data-dismiss-backup]')?.addEventListener('click', () => setPref('backupNoticeDismissed', true));
  root.querySelector('[data-new-entry]')?.addEventListener('click', () => ctx.openNewEntryChooser());

  /* metric selector: mood or any active dimension (drives strip + calendar) */
  root.querySelector('[data-pick-metric]')?.addEventListener('click', () => {
    const dims = activeDimensions();
    const { close } = sheet(ctx.appEl, `
      <h3>Colour days by</h3>
      <div class="list-group" style="box-shadow:none">
        ${[{ key: 'mood', name: 'Mood' }, ...dims].map(d => `
          <button class="list-row" data-metric="${d.key}">
            <span class="row-text"><span class="row-title">${d.name}</span></span>
            ${prefs.colorMetric === d.key ? icon('check', 20) : ''}
          </button>`).join('')}
      </div>
      <p class="muted small" style="margin-top:var(--space-3)">The same colour metric drives the calendar heat-map.</p>`);
    ctx.appEl.querySelectorAll('[data-metric]').forEach(b =>
      b.addEventListener('click', () => { close(); setPref('colorMetric', b.dataset.metric); }));
  });
}
