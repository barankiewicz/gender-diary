/* Reminders (F11, Android only) — pinned daily check-in (F23) first, then each
   reminder with type, name, schedule and an enable control. On web this screen
   explains that reminders need the Android app. */

import { getState, setPref, setReminderEnabled, upsertReminder } from '../demo/state.js';
import { icon } from '../components/icons.js';
import { header, toggle, button, emptyState, esc } from '../components/ui.js';

const TYPE_ICON = { med: 'heart', injection: 'zap', appointment: 'calendar', other: 'bell' };

export function scheduleLabel(r) {
  const rec = { DAILY: 'Every day', EVERY_3_DAYS: 'Every 3 days', EVERY_7_DAYS: 'Every 7 days', WEEKLY: 'Weekly' }[r.recurrence];
  return rec ? `${rec} · ${r.time}` : `Once · in ${r.onceInDays ?? '?'} days · ${r.time}`;
}

export function render(root, params, ctx) {
  const state = getState();
  const { prefs } = state;

  if (ctx.isDesktop()) {
    root.innerHTML = `
      ${header('Reminders', { back: '#/settings' })}
      ${emptyState({
        riveLabel: 'Web reminders: a bell with a gentle z-z-z',
        title: 'Reminders need the Android app',
        text: 'Browsers cannot fire scheduled notifications reliably while the app is closed. Install the Android app to get medication and check-in reminders.',
      })}
      <p class="muted small" style="text-align:center">Your data syncs nowhere — but an encrypted export moves it to the Android app safely.</p>`;
    return;
  }

  root.innerHTML = `
    ${header('Reminders', {
      back: '#/settings',
      action: `<a class="icon-btn" href="#/reminder-edit/new" aria-label="Add reminder">${icon('plus', 22)}</a>`,
    })}

    <div class="card checkin-card">
      <div class="spread">
        <span class="row-text">
          <span class="row-title">${icon('sparkle', 16)} Daily check-in</span>
          <span class="row-subtitle">“How are you today?” · skipped on days you already logged</span>
        </span>
        ${toggle('checkin', prefs.checkIn.enabled, 'Daily check-in')}
      </div>
      ${prefs.checkIn.enabled ? `
        <div class="spread" style="margin-top:var(--space-3)">
          <label class="small muted" for="checkin-time">Time</label>
          <input class="input" style="width:110px" type="time" id="checkin-time" name="checkin-time" value="${prefs.checkIn.time}">
        </div>` : ''}
    </div>

    <div class="list-group" style="margin-top:var(--space-4)">
      ${state.reminders.map(r => `
        <div class="list-row">
          <span class="row-icon">${icon(TYPE_ICON[r.type] || 'bell', 22)}</span>
          <a class="row-text" href="#/reminder-edit/${r.id}" style="text-decoration:none;color:inherit">
            <span class="row-title">${esc(r.title)}</span>
            <span class="row-subtitle">${r.type} · ${scheduleLabel(r)}</span>
          </a>
          ${toggle('rem-' + r.id, r.enabled, 'Enable ' + r.title)}
        </div>`).join('')}
    </div>

    <div class="notice notice-info" style="margin-top:var(--space-5)">
      ${icon('info', 20)}
      <div class="notice-body">
        <span class="notice-title">Reminders and battery savers</span>
        Some phones (Xiaomi, Samsung, Huawei, OnePlus) kill background apps and silence alarms.
        If reminders stop arriving, allow the app to run in the background.
        <a href="#/reminders">Open battery settings</a>
      </div>
    </div>`;

  root.querySelector('[data-toggle="checkin"]').addEventListener('change', (e) =>
    setPref('checkIn', { ...prefs.checkIn, enabled: e.target.checked }));
  root.querySelector('#checkin-time')?.addEventListener('change', (e) =>
    setPref('checkIn', { ...prefs.checkIn, time: e.target.value }));
  state.reminders.forEach(r => {
    root.querySelector(`[data-toggle="rem-${r.id}"]`)?.addEventListener('change', (e) =>
      setReminderEnabled(r.id, e.target.checked));
  });
}
