/* Input controls: mood picker, gender-dimension slider, tag picker.
   These map 1:1 onto future src/lib/components (MoodPicker.svelte,
   DimensionSlider.svelte, TagPicker.svelte). */

import { icon } from './icons.js';
import { esc } from './ui.js';

export const MOODS = [
  { value: 1, label: 'awful' },
  { value: 2, label: 'bad' },
  { value: 3, label: 'meh' },
  { value: 4, label: 'good' },
  { value: 5, label: 'great' },
];

/* SVG placeholder faces — stand-ins for the Rive mood state machine.
   Mouth curvature maps to the level; fill intensity comes from --mood-N. */
function face(value) {
  const mouths = {
    1: 'M8 16.5c1.2-1.6 2.6-2.4 4-2.4s2.8.8 4 2.4',
    2: 'M8.5 16c1-.9 2.2-1.4 3.5-1.4s2.5.5 3.5 1.4',
    3: 'M8.5 15.5h7',
    4: 'M8.5 14.6c1 .9 2.2 1.4 3.5 1.4s2.5-.5 3.5-1.4',
    5: 'M8 14c1.2 1.6 2.6 2.4 4 2.4s2.8-.8 4-2.4',
  };
  return `
    <svg viewBox="0 0 24 24" class="mood-face" aria-hidden="true">
      <circle cx="12" cy="12" r="10" class="mood-face-bg" style="fill:var(--mood-${value})"/>
      <circle cx="8.6" cy="9.5" r="1.25" class="mood-face-ink"/>
      <circle cx="15.4" cy="9.5" r="1.25" class="mood-face-ink"/>
      <path d="${mouths[value]}" class="mood-face-mouth"/>
    </svg>`;
}

/* Mood picker row. onPick(value|null) — picking the current value clears it. */
export function moodPicker(container, { value = null, compact = false, onPick }) {
  const wrap = document.createElement('div');
  wrap.className = `mood-picker ${compact ? 'is-compact' : ''}`;
  wrap.setAttribute('role', 'radiogroup');
  wrap.setAttribute('aria-label', 'Mood');
  wrap.innerHTML = `
    <div class="rive-note" aria-hidden="true">${icon('zap', 12)} Rive: mood faces state machine</div>
    <div class="mood-row">
      ${MOODS.map(m => `
        <button class="mood-btn ${m.value === value ? 'is-selected' : ''}" role="radio"
          aria-checked="${m.value === value}" data-mood="${m.value}" aria-label="${m.label}">
          ${face(m.value)}
          <span class="mood-label">${m.label}</span>
        </button>`).join('')}
    </div>`;
  wrap.querySelectorAll('.mood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const v = Number(btn.dataset.mood);
      onPick(v === value ? null : v);
    });
  });
  container.appendChild(wrap);
  return wrap;
}

/* Gender-dimension slider: name, live value, endpoint labels.
   In the app: Melt UI slider + spring store; here a styled <input type=range>. */
export function dimensionSlider(container, { dim, value, onInput }) {
  const v = value ?? Math.round((dim.min + dim.max) / 2);
  const wrap = document.createElement('div');
  wrap.className = 'dim-slider';
  wrap.innerHTML = `
    <div class="dim-head">
      <span class="dim-name">${esc(dim.name)}</span>
      <output class="dim-value">${value != null ? v : '—'}</output>
    </div>
    <input type="range" min="${dim.min}" max="${dim.max}" value="${v}" step="1"
      aria-label="${esc(dim.name)}: ${esc(dim.low)} to ${esc(dim.high)}">
    <div class="dim-ends"><span>${esc(dim.low)}</span><span>${esc(dim.high)}</span></div>`;
  const range = wrap.querySelector('input');
  const out = wrap.querySelector('.dim-value');
  const paint = (showValue) => {
    const pct = ((range.value - dim.min) / (dim.max - dim.min)) * 100;
    range.style.setProperty('--fill', pct + '%');
    if (showValue) out.textContent = range.value;
  };
  paint(value != null); // untouched dimensions stay "—" until the user moves them
  range.addEventListener('input', () => { paint(true); onInput(Number(range.value)); });
  container.appendChild(wrap);
  return wrap;
}

/* Tag picker: grouped pill chips, multi-select. */
export function tagPicker(container, { groups, selected, onToggle }) {
  const wrap = document.createElement('div');
  wrap.className = 'tag-picker';
  wrap.innerHTML = groups.map(g => `
    <div class="tag-group">
      <span class="tag-group-name">${esc(g.name)}</span>
      <div class="tag-row" role="group" aria-label="${esc(g.name)} tags">
        ${g.tags.map(t => `
          <button class="tag-chip ${selected.includes(t.id) ? 'is-selected' : ''}"
            aria-pressed="${selected.includes(t.id)}" data-tag="${t.id}">
            ${selected.includes(t.id) ? icon('check', 14) : ''}${esc(t.label)}
          </button>`).join('')}
      </div>
    </div>`).join('');
  wrap.querySelectorAll('.tag-chip').forEach(chip => {
    chip.addEventListener('click', () => onToggle(chip.dataset.tag));
  });
  container.appendChild(wrap);
  return wrap;
}
