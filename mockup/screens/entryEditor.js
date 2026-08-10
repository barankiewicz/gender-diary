/* Entry editor (F1–F5): mood, gender dimensions of the active preset,
   quick tags, note, photos — saved as one action. Handles new (today or
   backdated) and existing entries; deleting is here too. */

import { getState, getEntry, upsertEntry, deleteEntry, activeDimensions, visibleTagGroups, fmtDay, fmtTime, todayEpochDay, getPresets } from '../demo/state.js';
import { t } from '../demo/i18n.js';
import { icon } from '../components/icons.js';
import { header, button, sheet, toast, photoThumb, esc } from '../components/ui.js';
import { moodPicker, dimensionSlider, tagPicker } from '../components/controls.js';

let draft = null;
let draftKey = null;

export function render(root, { args }, ctx) {
  const state = getState();
  const isNew = args[0] === 'new';
  const key = args.join('/');
  const existing = isNew ? null : getEntry(args[0]);
  const epochDay = isNew ? Number(args[1]) : existing?.epochDay ?? todayEpochDay();

  if (draftKey !== key) {
    draft = existing
      ? { ...existing, dims: { ...existing.dims }, tags: [...existing.tags], photos: [...(existing.photos || [])] }
      : { epochDay, mood: null, note: '', dims: {}, tags: [], photos: [] };
    draftKey = key;
  }

  const dims = activeDimensions();
  const preset = getPresets().find(p => p.id === state.prefs.activePreset);
  const groups = visibleTagGroups();
  const isToday = epochDay === todayEpochDay();

  root.innerHTML = `
    ${header(isNew ? t('new_entry') : 'Entry', {
      back: isNew ? '#/home' : `#/day/${epochDay}`,
      action: existing ? `<button class="icon-btn" data-delete aria-label="Delete entry">${icon('trash', 20)}</button>` : '',
    })}
    <p class="editor-date">${isToday ? `${t('today')} · ` : ''}${fmtDay(epochDay)}${existing ? ` · ${fmtTime(existing.timestamp)}` : ''}</p>

    <section class="card editor-section">
      <h2 class="editor-heading">Mood</h2>
      <div id="ed-mood"></div>
    </section>

    <section class="card editor-section">
      <div class="spread">
        <h2 class="editor-heading">Gender</h2>
        <a class="small" style="color:var(--accent);text-decoration:none" href="#/settings">preset: ${preset?.name ?? '—'}</a>
      </div>
      <p class="muted small" style="margin-bottom:var(--space-4)">However it feels right now. There are no wrong answers.</p>
      <div id="ed-dims"></div>
    </section>

    <section class="card editor-section">
      <h2 class="editor-heading">Tags</h2>
      <div id="ed-tags"></div>
    </section>

    <section class="card editor-section">
      <h2 class="editor-heading">${t('note_label')}</h2>
      <textarea class="input" id="ed-note" rows="4" placeholder="What happened? How did it feel?">${esc(draft.note)}</textarea>
    </section>

    <section class="card editor-section">
      <h2 class="editor-heading">${t('photos_label')}</h2>
      <div class="photo-row" id="ed-photos"></div>
    </section>

    <div class="editor-savebar">
      ${button(t('save_entry'), { attrs: 'data-save', iconName: 'check' })}
    </div>`;

  moodPicker(root.querySelector('#ed-mood'), {
    value: draft.mood,
    onPick: (v) => { draft.mood = v; render(root, { args }, ctx); },
  });

  const dimsHost = root.querySelector('#ed-dims');
  dims.forEach(d => dimensionSlider(dimsHost, {
    dim: d,
    value: draft.dims[d.key] ?? null,
    onInput: (v) => { draft.dims[d.key] = v; },
  }));

  tagPicker(root.querySelector('#ed-tags'), {
    groups,
    selected: draft.tags,
    onToggle: (id) => {
      draft.tags = draft.tags.includes(id) ? draft.tags.filter(x => x !== id) : [...draft.tags, id];
      render(root, { args }, ctx);
    },
  });

  const photosEl = root.querySelector('#ed-photos');
  const paintPhotos = () => {
    photosEl.innerHTML = `
      ${draft.photos.map((p, i) => `
        <div class="photo-wrap">
          ${photoThumb(p, { size: 72 })}
          <button class="photo-remove" data-remove-photo="${i}" aria-label="Remove photo">${icon('x', 14)}</button>
        </div>`).join('')}
      <button class="photo-add" data-add-photo aria-label="Add photo">
        ${icon('camera', 22)}<span>Add</span>
      </button>`;
    photosEl.querySelector('[data-add-photo]').addEventListener('click', () => {
      draft.photos.push({ id: 'ph' + Date.now(), hue: Math.floor(Math.random() * 360), label: 'Photo' });
      paintPhotos();
    });
    photosEl.querySelectorAll('[data-remove-photo]').forEach(b =>
      b.addEventListener('click', () => { draft.photos.splice(Number(b.dataset.removePhoto), 1); paintPhotos(); }));
  };
  paintPhotos();

  root.querySelector('#ed-note').addEventListener('input', (e) => { draft.note = e.target.value; });

  root.querySelector('[data-save]').addEventListener('click', () => {
    const d = { ...draft };
    draftKey = null; draft = null;
    upsertEntry(d);
    ctx.navigate('#/home');
    toast(ctx.appEl, 'Saved.');
  });

  root.querySelector('[data-delete]')?.addEventListener('click', () => {
    const { close } = sheet(ctx.appEl, `
      <h3>Delete this entry?</h3>
      <p class="muted small" style="margin-bottom:var(--space-4)">The entry and its photos will be removed. This cannot be undone.</p>
      <div class="stack-3">
        ${button('Delete entry', { kind: 'danger', attrs: 'data-confirm-delete' })}
        ${button('Keep it', { kind: 'ghost', attrs: 'data-cancel' })}
      </div>`);
    ctx.appEl.querySelector('[data-confirm-delete]').addEventListener('click', () => {
      close(); draftKey = null; draft = null;
      deleteEntry(existing.id);
      ctx.navigate('#/home');
    });
    ctx.appEl.querySelector('[data-cancel]').addEventListener('click', close);
  });
}
