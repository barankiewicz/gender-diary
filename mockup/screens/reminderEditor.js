/* Reminder editor (F11) — type, name, time, recurrence with a live
   "Next: …" preview, plus the OEM battery note. */

import { getState, upsertReminder, locale } from '../demo/state.js';
import { header, button, segmented, esc } from '../components/ui.js';
import { icon } from '../components/icons.js';

const TYPES = [
  { value: 'med', label: 'Medication' }, { value: 'injection', label: 'Injection' },
  { value: 'appointment', label: 'Appointment' }, { value: 'other', label: 'Other' },
];
const RECURRENCES = [
  { value: 'ONCE', label: 'Once' }, { value: 'DAILY', label: 'Daily' },
  { value: 'EVERY_3_DAYS', label: 'Every 3 days' }, { value: 'EVERY_7_DAYS', label: 'Every 7 days' },
  { value: 'WEEKLY', label: 'Weekly' },
];

let draft = null, draftKey = null;

export function render(root, { args }, ctx) {
  const isNew = args[0] === 'new' || !args[0];
  const existing = isNew ? null : getState().reminders.find(r => r.id === args[0]);
  const key = args[0] || 'new';
  if (draftKey !== key) {
    draft = existing
      ? { ...existing, recurrence: existing.recurrence ?? 'ONCE' }
      : { title: '', type: 'med', time: '20:00', recurrence: 'DAILY', enabled: true };
    draftKey = key;
  }

  root.innerHTML = `
    ${header(isNew ? 'New reminder' : 'Edit reminder', { back: '#/reminders' })}

    <div class="card editor-section">
      <div class="field">
        <label class="field-label">Type</label>
        ${segmented('rtype', TYPES, draft.type)}
      </div>
      <div class="field">
        <label class="field-label" for="r-name">Name</label>
        <input class="input" id="r-name" name="r-name" placeholder="e.g. Estradiol patch" value="${esc(draft.title)}">
      </div>
      <div class="field">
        <label class="field-label" for="r-time">Time</label>
        <input class="input" id="r-time" name="r-time" type="time" value="${draft.time}" style="max-width:160px">
      </div>
      <div class="field">
        <label class="field-label">Repeats</label>
        ${segmented('rrec', RECURRENCES, draft.recurrence)}
      </div>
      <p class="next-preview" id="next-preview"></p>
    </div>

    <div class="notice notice-info">
      ${icon('info', 20)}
      <div class="notice-body">
        Exact alarms survive reboots, but aggressive battery savers can silence them.
        <a href="#/reminders">Check your phone’s battery settings</a> if a reminder ever goes quiet.
      </div>
    </div>

    <div class="editor-savebar">
      ${button('Save reminder', { attrs: 'data-save', iconName: 'check' })}
    </div>`;

  const paintPreview = () => {
    const [h, m] = draft.time.split(':').map(Number);
    const now = new Date();
    let next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
    if (next <= now) next.setDate(next.getDate() + (draft.recurrence === 'DAILY' || draft.recurrence === 'ONCE' ? 1 : 0));
    if (draft.recurrence === 'EVERY_3_DAYS' && next <= now) next.setDate(next.getDate() + 3);
    if ((draft.recurrence === 'EVERY_7_DAYS' || draft.recurrence === 'WEEKLY') && next <= now) next.setDate(next.getDate() + 7);
    root.querySelector('#next-preview').innerHTML =
      `${icon('clock', 14)} Next: <strong>${new Intl.DateTimeFormat(locale(), { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(next)}</strong>`;
  };
  paintPreview();

  root.querySelectorAll('[data-segment="rtype"]').forEach(b => b.addEventListener('click', () => {
    draft.type = b.dataset.value; render(root, { args }, ctx);
  }));
  root.querySelectorAll('[data-segment="rrec"]').forEach(b => b.addEventListener('click', () => {
    draft.recurrence = b.dataset.value; render(root, { args }, ctx);
  }));
  root.querySelector('#r-name').addEventListener('input', (e) => { draft.title = e.target.value; });
  root.querySelector('#r-time').addEventListener('change', (e) => { draft.time = e.target.value; paintPreview(); });

  root.querySelector('[data-save]').addEventListener('click', () => {
    const d = { ...draft, recurrence: draft.recurrence === 'ONCE' ? null : draft.recurrence, title: draft.title || 'Reminder' };
    draft = null; draftKey = null;
    upsertReminder(d);
    ctx.navigate('#/reminders');
  });
}
