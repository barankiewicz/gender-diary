/* New milestone (F6) — "Create your own", three randomly-chosen templates
   with a shuffle action, date (past or future), optional photo.
   Also lists existing milestones for editing/deleting. */

import { getState, upsertMilestone, deleteMilestone, randomTemplates, milestoneStatus, fmtDay, todayEpochDay } from '../demo/state.js';
import { icon } from '../components/icons.js';
import { header, button, sheet, photoThumb, sectionTitle, esc } from '../components/ui.js';

let shown = null;
let draft = null;

export function render(root, params, ctx) {
  const state = getState();
  if (!shown) shown = randomTemplates(3);

  root.innerHTML = `
    ${header('Milestones', { back: '#/settings' })}
    <p class="muted small" style="margin-bottom:var(--space-4)">Days that matter — past ones come back as anniversaries, future ones count down on Home.</p>

    <div class="card editor-section">
      <div class="spread" style="margin-bottom:var(--space-3)">
        <h2 class="editor-heading">Add a milestone</h2>
        <button class="icon-btn" data-shuffle aria-label="Shuffle templates">${icon('shuffle', 20)}</button>
      </div>
      <div class="stack-3">
        <button class="list-row template-row" data-own style="border:1.5px dashed var(--accent-border);border-radius:var(--radius-md)">
          <span class="row-icon">${icon('pencil', 20)}</span>
          <span class="row-text"><span class="row-title">Create your own</span>
            <span class="row-subtitle">any day that means something</span></span>
        </button>
        ${shown.map(tp => `
          <button class="list-row template-row" data-template="${tp.key}" style="background:var(--surface-2);border-radius:var(--radius-md)">
            <span class="row-icon">${icon('flag', 20)}</span>
            <span class="row-text"><span class="row-title">${tp.name}</span></span>
            ${icon('chevronRight', 18)}
          </button>`).join('')}
      </div>
    </div>

    ${sectionTitle('Your milestones')}
    <div class="list-group">
      ${state.milestones.length ? [...state.milestones].sort((a, b) => a.epochDay - b.epochDay).map(m => {
        const s = milestoneStatus(m);
        const statusText = s.type === 'countdown' ? `in ${s.days} days`
          : s.type === 'today' ? 'today'
          : `${s.years} year${s.years === 1 ? '' : 's'} ago`;
        return `
          <div class="list-row">
            ${m.photo ? photoThumb(m.photo, { size: 40 }) : `<span class="row-icon">${icon('flag', 20)}</span>`}
            <span class="row-text">
              <span class="row-title">${esc(m.name)}</span>
              <span class="row-subtitle">${fmtDay(m.epochDay, { day: 'numeric', month: 'short', year: 'numeric' })} · ${statusText}</span>
            </span>
            <button class="icon-btn" data-edit="${m.id}" aria-label="Edit ${esc(m.name)}">${icon('pencil', 18)}</button>
            <button class="icon-btn" data-remove="${m.id}" aria-label="Delete ${esc(m.name)}">${icon('trash', 18)}</button>
          </div>`;
      }).join('') : '<p class="muted small" style="padding:var(--space-4)">No milestones yet.</p>'}
    </div>`;

  root.querySelector('[data-shuffle]').addEventListener('click', () => {
    shown = randomTemplates(3);
    render(root, params, ctx);
  });
  root.querySelector('[data-own]').addEventListener('click', () => openEditor(null, null, ctx));
  root.querySelectorAll('[data-template]').forEach(b => b.addEventListener('click', () => {
    const tp = shown.find(t => t.key === b.dataset.template);
    openEditor(null, tp, ctx);
  }));
  root.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () =>
    openEditor(state.milestones.find(m => m.id === b.dataset.edit), null, ctx)));
  root.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => {
    const m = state.milestones.find(x => x.id === b.dataset.remove);
    const { close } = sheet(ctx.appEl, `
      <h3>Delete “${esc(m.name)}”?</h3>
      <p class="muted small" style="margin-bottom:var(--space-4)">Its photo is removed too. This cannot be undone.</p>
      <div class="stack-3">
        ${button('Delete milestone', { kind: 'danger', attrs: 'data-confirm' })}
        ${button('Keep it', { kind: 'ghost', attrs: 'data-cancel' })}
      </div>`);
    ctx.appEl.querySelector('[data-confirm]').addEventListener('click', () => { close(); deleteMilestone(m.id); });
    ctx.appEl.querySelector('[data-cancel]').addEventListener('click', close);
  }));
}

function openEditor(existing, template, ctx) {
  const today = todayEpochDay();
  const iso = (d) => new Date(d * 86400000).toISOString().slice(0, 10);
  draft = existing
    ? { ...existing }
    : { name: template?.name ?? '', epochDay: today, kind: 'anniversary', templateKey: template?.key ?? null, photo: null };

  const { close } = sheet(ctx.appEl, `
    <h3>${existing ? 'Edit milestone' : template ? template.name : 'Your milestone'}</h3>
    <div class="field">
      <label class="field-label" for="ms-name">Name</label>
      <input class="input" id="ms-name" name="ms-name" value="${esc(draft.name)}" placeholder="e.g. First laser session">
    </div>
    <div class="field">
      <label class="field-label" for="ms-date">Date <span class="muted">(past or future)</span></label>
      <input class="input" id="ms-date" name="ms-date" type="date" value="${iso(draft.epochDay)}">
    </div>
    <div class="field">
      <span class="field-label">Photo (optional)</span>
      <div class="photo-row" id="ms-photo"></div>
    </div>
    ${button(existing ? 'Save changes' : 'Add milestone', { attrs: 'data-save-ms' })}`);

  const photoHost = ctx.appEl.querySelector('#ms-photo');
  const paintPhoto = () => {
    photoHost.innerHTML = draft.photo
      ? `<div class="photo-wrap">${photoThumb(draft.photo, { size: 64 })}
           <button class="photo-remove" data-clear-photo aria-label="Remove photo">${icon('x', 14)}</button></div>`
      : `<button class="photo-add" data-pick-photo aria-label="Add photo">${icon('camera', 20)}<span>Add</span></button>`;
    photoHost.querySelector('[data-pick-photo]')?.addEventListener('click', () => {
      draft.photo = { hue: Math.floor(Math.random() * 360), label: 'Photo' }; paintPhoto();
    });
    photoHost.querySelector('[data-clear-photo]')?.addEventListener('click', () => { draft.photo = null; paintPhoto(); });
  };
  paintPhoto();

  ctx.appEl.querySelector('[data-save-ms]').addEventListener('click', () => {
    const name = ctx.appEl.querySelector('#ms-name').value.trim() || draft.name || 'Milestone';
    const dateVal = ctx.appEl.querySelector('#ms-date').value;
    const epochDay = dateVal ? Math.floor(Date.parse(dateVal + 'T00:00Z') / 86400000) : today;
    close();
    upsertMilestone({ ...draft, name, epochDay, kind: epochDay > today ? 'countdown' : 'anniversary' });
  });
}
