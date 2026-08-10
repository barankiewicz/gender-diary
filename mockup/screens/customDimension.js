/* Custom dimension editor (F3) — name, two endpoint labels, range,
   with a live preview of the resulting control. */

import { addCustomDimension } from '../demo/state.js';
import { header, button, segmented, toast, esc } from '../components/ui.js';
import { dimensionSlider } from '../components/controls.js';

let draft = { name: '', low: '', high: '', max: 100 };

export function render(root, params, ctx) {
  root.innerHTML = `
    ${header('Custom dimension', { back: '#/settings' })}
    <p class="muted small" style="margin-bottom:var(--space-4)">Track anything the built-in scales miss. You choose the words for both ends.</p>

    <div class="card editor-section">
      <div class="field">
        <label class="field-label" for="cd-name">Name</label>
        <input class="input" id="cd-name" name="cd-name" placeholder="e.g. Voice comfort" value="${esc(draft.name)}">
      </div>
      <div class="cd-endpoints">
        <div class="field">
          <label class="field-label" for="cd-low">Left endpoint</label>
          <input class="input" id="cd-low" name="cd-low" placeholder="e.g. strained" value="${esc(draft.low)}">
        </div>
        <div class="field">
          <label class="field-label" for="cd-high">Right endpoint</label>
          <input class="input" id="cd-high" name="cd-high" placeholder="e.g. natural" value="${esc(draft.high)}">
        </div>
      </div>
      <div class="field">
        <span class="field-label">Range</span>
        ${segmented('cd-range', [{ value: '10', label: '0–10' }, { value: '100', label: '0–100' }], String(draft.max))}
      </div>
    </div>

    <div class="card editor-section">
      <h2 class="editor-heading">Preview</h2>
      <p class="muted small" style="margin-bottom:var(--space-3)">This is how it will look on the entry screen.</p>
      <div id="cd-preview"></div>
    </div>

    <div class="editor-savebar">
      ${button('Add dimension', { attrs: 'data-save', iconName: 'check' })}
    </div>`;

  const previewHost = root.querySelector('#cd-preview');
  const paintPreview = () => {
    previewHost.innerHTML = '';
    dimensionSlider(previewHost, {
      dim: {
        name: draft.name || 'Your dimension',
        low: draft.low || 'left end',
        high: draft.high || 'right end',
        min: 0, max: draft.max,
      },
      value: Math.round(draft.max * 0.6),
      onInput: () => {},
    });
  };
  paintPreview();

  root.querySelector('#cd-name').addEventListener('input', (e) => { draft.name = e.target.value; paintPreview(); });
  root.querySelector('#cd-low').addEventListener('input', (e) => { draft.low = e.target.value; paintPreview(); });
  root.querySelector('#cd-high').addEventListener('input', (e) => { draft.high = e.target.value; paintPreview(); });
  root.querySelectorAll('[data-segment="cd-range"]').forEach(b => b.addEventListener('click', () => {
    draft.max = Number(b.dataset.value);
    render(root, params, ctx);
  }));

  root.querySelector('[data-save]').addEventListener('click', () => {
    const dim = {
      key: 'custom_' + Date.now(),
      name: draft.name.trim() || 'My dimension',
      low: draft.low.trim() || 'low',
      high: draft.high.trim() || 'high',
      min: 0, max: draft.max,
    };
    draft = { name: '', low: '', high: '', max: 100 };
    addCustomDimension(dim);
    ctx.navigate('#/settings');
    toast(ctx.appEl, 'Dimension added to a new custom preset.');
  });
}
