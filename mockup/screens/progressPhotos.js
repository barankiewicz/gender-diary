/* Progress photos (F27) — every journal photo (entries + milestones)
   chronologically; pick two to compare with the time gap between them. */

import { getState, fmtDay } from '../demo/state.js';
import { icon } from '../components/icons.js';
import { header, photoThumb, emptyState, button, esc } from '../components/ui.js';

let selected = [];   // epochDay-sorted indexes into the photo list
let comparing = false;

function allPhotos() {
  const state = getState();
  const out = [];
  state.entries.forEach(e => (e.photos || []).forEach(p => out.push({ ...p, epochDay: e.epochDay, source: 'entry' })));
  state.milestones.forEach(m => { if (m.photo) out.push({ ...m.photo, epochDay: m.epochDay, source: m.name }); });
  return out.sort((a, b) => a.epochDay - b.epochDay);
}

export function render(root, params, ctx) {
  const photos = allPhotos();

  if (comparing && selected.length === 2) return renderCompare(root, photos, ctx);
  comparing = false;

  root.innerHTML = `
    ${header('Progress photos', { back: '#/settings' })}
    ${photos.length ? `
      <p class="muted small" style="margin-bottom:var(--space-4)">
        ${selected.length === 0 ? 'Every photo in your journal, oldest first. Select two to compare.'
        : selected.length === 1 ? 'One selected — pick a second to compare.' : ''}
      </p>
      <div class="photo-grid">
        ${photos.map((p, i) => `
          <button class="photo-cell ${selected.includes(i) ? 'is-selected' : ''}" data-photo="${i}"
            aria-pressed="${selected.includes(i)}" aria-label="Photo from ${fmtDay(p.epochDay, { day: 'numeric', month: 'long', year: 'numeric' })}">
            ${photoThumb(p, { size: 104 })}
            <span class="photo-date">${fmtDay(p.epochDay, { month: 'short', year: '2-digit' })}</span>
            ${selected.includes(i) ? `<span class="photo-check">${icon('check', 14)}</span>` : ''}
          </button>`).join('')}
      </div>
      ${selected.length === 2 ? `<div class="editor-savebar">${button('Compare', { attrs: 'data-compare', iconName: 'columns' })}</div>` : ''}`
      : emptyState({
        riveLabel: 'Empty photos: a polaroid frame waiting',
        title: 'No photos yet',
        text: 'Photos you attach to entries and milestones gather here — and one day, “then vs now” will be worth it.',
      })}`;

  root.querySelectorAll('[data-photo]').forEach(b => b.addEventListener('click', () => {
    const i = Number(b.dataset.photo);
    if (selected.includes(i)) selected = selected.filter(x => x !== i);
    else selected = [...selected, i].slice(-2);
    render(root, params, ctx);
  }));
  root.querySelector('[data-compare]')?.addEventListener('click', () => {
    comparing = true; render(root, params, ctx);
  });
}

function renderCompare(root, photos, ctx) {
  const [ia, ib] = [...selected].sort((a, b) => photos[a].epochDay - photos[b].epochDay);
  const a = photos[ia], b = photos[ib];
  const gapDays = b.epochDay - a.epochDay;
  const gap = gapDays >= 365 ? `${Math.floor(gapDays / 365)} year${Math.floor(gapDays / 365) === 1 ? '' : 's'} ${Math.round((gapDays % 365) / 30)} months`
    : gapDays >= 30 ? `${Math.round(gapDays / 30)} months` : `${gapDays} days`;

  const side = (p, which, canPrev, canNext) => `
    <div class="compare-side">
      ${photoThumb(p, { size: 150 })}
      <div class="compare-nav">
        <button class="icon-btn" data-step="${which}:-1" ${canPrev ? '' : 'disabled style="opacity:.3"'} aria-label="Earlier photo">${icon('chevronLeft', 18)}</button>
        <span class="small">${fmtDay(p.epochDay, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        <button class="icon-btn" data-step="${which}:1" ${canNext ? '' : 'disabled style="opacity:.3"'} aria-label="Later photo">${icon('chevronRight', 18)}</button>
      </div>
      <span class="muted small">${p.source === 'entry' ? 'journal entry' : esc(p.source)}</span>
    </div>`;

  root.innerHTML = `
    ${header('Compare', { back: '#/photos' })}
    <p class="compare-gap">${gap} apart</p>
    <div class="compare-wrap">
      ${side(a, 'a', ia > 0, ia < ib - 1)}
      ${side(b, 'b', ib > ia + 1, ib < photos.length - 1)}
    </div>
    <div style="margin-top:var(--space-6)">${button('Back to all photos', { kind: 'soft', attrs: 'data-back' })}</div>`;

  root.querySelector('[data-back]').addEventListener('click', () => {
    comparing = false; selected = []; render(root, {}, ctx);
  });
  root.querySelectorAll('[data-step]').forEach(btn => btn.addEventListener('click', () => {
    const [which, d] = btn.dataset.step.split(':');
    const delta = Number(d);
    if (which === 'a') selected = [ia + delta, ib];
    else selected = [ia, ib + delta];
    render(root, {}, ctx);
  }));

  // header back link also leaves compare mode
  root.querySelector('.screen-header a')?.addEventListener('click', () => { comparing = false; selected = []; });
}
