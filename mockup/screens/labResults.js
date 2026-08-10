/* Lab results (F30) — dated results, a per-analyte line chart (same chart
   component as Stats), and an editor. No reference ranges, no judgment:
   the app shows your own trend and nothing more. */

import { getState, upsertLabResult, labAnalytes, fmtDay, todayEpochDay } from '../demo/state.js';
import { icon } from '../components/icons.js';
import { header, button, sheet, segmented, emptyState, esc } from '../components/ui.js';
import { lineChart } from '../components/display.js';

let analyte = 'estradiol';

export function render(root, params, ctx) {
  const state = getState();
  const analytes = labAnalytes();
  if (!analytes.includes(analyte)) analyte = analytes[0];

  if (!state.labResults.length) {
    root.innerHTML = `
      ${header('Lab results', { back: '#/settings', action: addButton() })}
      ${emptyState({
        riveLabel: 'Empty labs: a friendly test tube',
        title: 'No results yet',
        text: 'Add bloodwork as it comes in and watch your own trend over time. No ranges, no grades — just your numbers.',
        action: button('Add a result', { attrs: 'data-add-empty' }),
      })}`;
    root.querySelector('[data-add-empty]')?.addEventListener('click', () => openEditor(ctx));
    root.querySelector('[data-add]')?.addEventListener('click', () => openEditor(ctx));
    return;
  }

  const results = state.labResults
    .filter(l => l.analyte === analyte)
    .sort((a, b) => a.epochDay - b.epochDay);
  const unit = results[0]?.unit ?? '';
  const values = results.map(r => r.value);
  const min = Math.min(...values), max = Math.max(...values);
  const pad = (max - min) * 0.2 || 10;

  root.innerHTML = `
    ${header('Lab results', { back: '#/settings', action: addButton() })}
    <p class="muted small" style="margin-bottom:var(--space-3)">Your numbers, your trend. The app never interprets them and gives no medical advice.</p>
    ${segmented('analyte', analytes.map(a => ({ value: a, label: a })), analyte)}

    <div class="card" style="margin-top:var(--space-4)">
      <div class="spread" style="margin-bottom:var(--space-2)">
        <span class="chart-title">${esc(analyte)}</span>
        <span class="muted small">${esc(unit)}</span>
      </div>
      ${results.length >= 2
        ? lineChart(results.map(r => ({ day: r.epochDay, value: r.value })), { min: min - pad, max: max + pad, showDots: true })
        : '<div class="chart-too-little">Two results make a trend — add another when it comes in.</div>'}
    </div>

    <div class="list-group" style="margin-top:var(--space-4)">
      ${[...results].reverse().map(r => `
        <div class="list-row">
          <span class="row-text">
            <span class="row-title">${r.value} <span class="muted small">${esc(r.unit)}</span></span>
            <span class="row-subtitle">${fmtDay(r.epochDay, { day: 'numeric', month: 'long', year: 'numeric' })}${r.note ? ' · ' + esc(r.note) : ''}</span>
          </span>
        </div>`).join('')}
    </div>`;

  root.querySelectorAll('[data-segment="analyte"]').forEach(b => b.addEventListener('click', () => {
    analyte = b.dataset.value; render(root, params, ctx);
  }));
  root.querySelector('[data-add]')?.addEventListener('click', () => openEditor(ctx));
}

const addButton = () => `<button class="icon-btn" data-add aria-label="Add result">${icon('plus', 22)}</button>`;

function openEditor(ctx) {
  const iso = new Date().toISOString().slice(0, 10);
  const { close } = sheet(ctx.appEl, `
    <h3>New result</h3>
    <div class="field">
      <label class="field-label" for="lab-date">Date</label>
      <input class="input" type="date" id="lab-date" name="lab-date" value="${iso}">
    </div>
    <div class="field">
      <label class="field-label" for="lab-analyte">Analyte</label>
      <select class="input" id="lab-analyte">
        <option value="estradiol">estradiol</option>
        <option value="testosterone">testosterone</option>
        <option value="prolactin">prolactin</option>
        <option value="custom">custom…</option>
      </select>
    </div>
    <div class="cd-endpoints">
      <div class="field">
        <label class="field-label" for="lab-value">Value</label>
        <input class="input" type="number" id="lab-value" name="lab-value" placeholder="e.g. 165" inputmode="decimal">
      </div>
      <div class="field">
        <label class="field-label" for="lab-unit">Unit</label>
        <input class="input" id="lab-unit" name="lab-unit" placeholder="e.g. pg/mL">
      </div>
    </div>
    <div class="field">
      <label class="field-label" for="lab-note">Note (optional)</label>
      <input class="input" id="lab-note" name="lab-note" placeholder="e.g. new dose">
    </div>
    ${button('Save result', { attrs: 'data-save-lab' })}`);

  ctx.appEl.querySelector('[data-save-lab]').addEventListener('click', () => {
    const val = parseFloat(ctx.appEl.querySelector('#lab-value').value);
    const dateVal = ctx.appEl.querySelector('#lab-date').value;
    const a = ctx.appEl.querySelector('#lab-analyte').value;
    close();
    if (isNaN(val)) return;
    upsertLabResult({
      epochDay: dateVal ? Math.floor(Date.parse(dateVal + 'T00:00Z') / 86400000) : todayEpochDay(),
      analyte: a === 'custom' ? 'other' : a,
      value: val,
      unit: ctx.appEl.querySelector('#lab-unit').value || '—',
      note: ctx.appEl.querySelector('#lab-note').value,
    });
  });
}
