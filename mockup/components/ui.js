/* Shared UI primitives. Each helper returns an HTML string or wires behaviour
   onto a container; screens compose these. Maps onto src/lib/components in the app. */

import { icon } from './icons.js';

/* html-escape for user-entered text */
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* Build an element from an HTML string */
export function el(html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  return tpl.content.firstElementChild;
}

/* Screen header with back button */
export function header(title, { back = null, action = '' } = {}) {
  return `
    <header class="screen-header">
      ${back ? `<a class="icon-btn" href="${back}" aria-label="Back">${icon('arrowLeft')}</a>` : ''}
      <h1 class="screen-title">${title}</h1>
      <div class="header-action">${action}</div>
    </header>`;
}

export function sectionTitle(text, aside = '') {
  return `<div class="section-title"><h2>${text}</h2>${aside ? `<span class="section-aside">${aside}</span>` : ''}</div>`;
}

/* Settings-style list row */
export function listRow({ href = '#', iconName, title, subtitle = '', trailing = '', tag = 'a' }) {
  const inner = `
    ${iconName ? `<span class="row-icon">${icon(iconName, 22)}</span>` : ''}
    <span class="row-text">
      <span class="row-title">${title}</span>
      ${subtitle ? `<span class="row-subtitle">${subtitle}</span>` : ''}
    </span>
    <span class="row-trailing">${trailing || icon('chevronRight', 20, 'muted')}</span>`;
  return tag === 'a'
    ? `<a class="list-row" href="${href}">${inner}</a>`
    : `<div class="list-row">${inner}</div>`;
}

/* Toggle switch (returns html; caller wires change via [data-toggle="id"]) */
export function toggle(id, checked, label = '') {
  return `
    <label class="switch" ${label ? '' : `aria-label="toggle"`}>
      <input type="checkbox" role="switch" data-toggle="${id}" ${checked ? 'checked' : ''} ${label ? `aria-label="${label}"` : ''}>
      <span class="switch-track"><span class="switch-thumb"></span></span>
    </label>`;
}

/* Segmented control */
export function segmented(name, options, value) {
  return `
    <div class="segmented" role="radiogroup" aria-label="${name}">
      ${options.map(o => `
        <button class="segment ${o.value === value ? 'is-active' : ''}" role="radio"
          aria-checked="${o.value === value}" data-segment="${name}" data-value="${o.value}">${o.label}</button>`).join('')}
    </div>`;
}

export function button(label, { kind = 'primary', iconName = '', attrs = '' } = {}) {
  return `<button class="btn btn-${kind}" ${attrs}>${iconName ? icon(iconName, 20) : ''}<span>${label}</span></button>`;
}

/* Animated stand-in for a Rive asset. The final app swaps each of these for a
   real .riv state machine; the small corner chip marks the slot. Two moods:
   'bloom' (breathing rings, default) and 'confetti' (celebration burst). */
export function rivePlaceholder(label, { height = 120, variant = 'bloom' } = {}) {
  const inner = variant === 'confetti'
    ? `<div class="confetti" aria-hidden="true">${Array.from({ length: 14 }, (_, i) => `<i class="cf cf-${i % 7}"></i>`).join('')}</div>
       <span class="bloom-core">${icon('sparkle', 26)}</span>`
    : `<div class="bloom" aria-hidden="true"><i></i><i></i><i></i></div>
       <span class="bloom-core">${icon('heart', 24)}</span>`;
  return `
    <div class="rive-stage" style="height:${height}px" role="img" aria-label="${label} (animated illustration)">
      ${inner}
      <span class="rive-chip" title="${label}">${icon('zap', 12)} Rive</span>
    </div>`;
}

/* Photo placeholder (demo has no real files) */
export function photoThumb(photo, { size = 72, label = '' } = {}) {
  const hue = photo?.hue ?? 200;
  return `
    <div class="photo-thumb" style="width:${size}px;height:${size}px;
      background:linear-gradient(135deg, hsl(${hue} 45% 72%), hsl(${(hue + 40) % 360} 40% 55%))"
      role="img" aria-label="Photo placeholder${label ? ': ' + label : ''}">
      ${icon('image', Math.min(28, size / 2.5))}
      ${label ? `<span class="photo-label">${label}</span>` : ''}
    </div>`;
}

/* Empty state with Rive illustration slot */
export function emptyState({ riveLabel, title, text, action = '' }) {
  return `
    <div class="empty-state">
      ${rivePlaceholder(riveLabel, { height: 140 })}
      <h3>${title}</h3>
      <p>${text}</p>
      ${action}
    </div>`;
}

/* Modal sheet. Returns a close() function. */
export function sheet(container, contentHtml, { title = '' } = {}) {
  const node = el(`
    <div class="sheet-scrim" role="presentation">
      <div class="sheet" role="dialog" aria-modal="true" ${title ? `aria-label="${title}"` : ''}>
        <div class="sheet-handle"></div>
        ${contentHtml}
      </div>
    </div>`);
  container.appendChild(node);
  requestAnimationFrame(() => node.classList.add('is-open'));
  const close = () => {
    node.classList.remove('is-open');
    setTimeout(() => node.remove(), 250);
  };
  node.addEventListener('click', (e) => { if (e.target === node) close(); });
  return { node, close };
}

/* Quiet toast confirmation */
export function toast(container, message, { actionLabel = '', onAction = null, duration = 4000 } = {}) {
  const node = el(`
    <div class="toast" role="status">
      <span>${message}</span>
      ${actionLabel ? `<button class="toast-action">${actionLabel}</button>` : ''}
    </div>`);
  container.appendChild(node);
  requestAnimationFrame(() => node.classList.add('is-open'));
  if (onAction) node.querySelector('.toast-action')?.addEventListener('click', () => { node.remove(); onAction(); });
  setTimeout(() => { node.classList.remove('is-open'); setTimeout(() => node.remove(), 300); }, duration);
}

/* The trans-pride motif: an aurora of the active flag's stripes.
   Pure CSS — colours come from --motif-stripes, so palette switches recolour it. */
export function prideAurora() {
  return `<div class="pride-aurora" aria-hidden="true"></div>`;
}

export { icon };
