/* Export & import (F14) — encrypted export, import with replace/merge and a
   wrong-password state, backup health + auto-export (F21), plain export with
   warning + confirm (F22), Daylio import with preview (F28). */

import { getState, setPref } from '../demo/state.js';
import { icon } from '../components/icons.js';
import { header, sectionTitle, button, sheet, toggle, segmented, toast } from '../components/ui.js';

export function render(root, params, ctx) {
  const { prefs } = getState();
  const android = ctx.isAndroid();
  const backupAge = prefs.lastBackupAt ? Math.floor((Date.now() - prefs.lastBackupAt) / 86400000) : null;

  root.innerHTML = `
    ${header('Export & import', { back: '#/settings' })}

    <div class="card spread" style="margin-bottom:var(--space-4)">
      <span class="row-text">
        <span class="row-title">Last backup</span>
        <span class="row-subtitle">${backupAge == null ? 'never — your journal exists only on this device'
          : backupAge === 0 ? 'today' : `${backupAge} days ago`}</span>
      </span>
      ${backupAge != null && backupAge > 30 ? `<span class="notice-warn" style="padding:4px 10px;border-radius:var(--radius-pill);font-size:var(--text-xs);font-weight:700">stale</span>` : icon('check', 20)}
    </div>

    ${sectionTitle('Encrypted export')}
    <div class="card editor-section">
      <p class="small" style="margin-bottom:var(--space-3)">Everything — entries, photos, milestones, tags, custom dimensions & presets, lab results, settings — packed into one file and encrypted <strong>before</strong> it leaves the app.</p>
      <div class="field">
        <label class="field-label" for="exp-pass">Password</label>
        <input class="input" type="password" id="exp-pass" name="exp-pass" placeholder="Choose a strong password" autocomplete="new-password">
      </div>
      ${button(android ? 'Encrypt & share' : 'Encrypt & download', { attrs: 'data-export', iconName: android ? 'share' : 'download' })}
      <p class="muted small" style="margin-top:var(--space-3)">${icon('key', 13)} AES-256-GCM, key derived with Argon2id. Without the password the file is unreadable — including by us.</p>
    </div>

    ${android ? `
    <div class="card editor-section">
      <div class="spread">
        <span class="row-text">
          <span class="row-title">Auto-export</span>
          <span class="row-subtitle">encrypted backup to a folder you pick</span>
        </span>
        ${toggle('autoexp', prefs.autoExport.enabled, 'Auto-export')}
      </div>
      ${prefs.autoExport.enabled ? `
        <div class="spread" style="margin-top:var(--space-3)">
          <span class="small muted">Schedule</span>
          ${segmented('autosched', [{ value: 'weekly', label: 'Weekly' }, { value: 'monthly', label: 'Monthly' }], prefs.autoExport.schedule)}
        </div>
        <p class="muted small" style="margin-top:var(--space-3)">Folder: <strong>Downloads/TransitionTracker</strong> · password asked once; only a device-locked key is kept, never the password.</p>` : ''}
    </div>` : ''}

    ${sectionTitle('Import')}
    <div class="card editor-section">
      <div class="field">
        <span class="field-label">Backup file</span>
        <button class="input" style="text-align:left;color:var(--text-2)" data-pick-file>
          ${icon('upload', 18)} <span id="picked-file">Choose a .ttbackup file…</span>
        </button>
      </div>
      <div class="field">
        <label class="field-label" for="imp-pass">Password</label>
        <input class="input" type="password" id="imp-pass" name="imp-pass" placeholder="The password it was exported with">
      </div>
      <div class="field">
        <span class="field-label">How to import</span>
        ${segmented('impmode', [{ value: 'merge', label: 'Merge into current' }, { value: 'replace', label: 'Replace everything' }], 'merge')}
      </div>
      <div id="imp-error"></div>
      ${button('Import backup', { kind: 'soft', attrs: 'data-import' })}
      <div class="hr"></div>
      <button class="list-row" data-daylio style="border-radius:var(--radius-md);background:var(--surface-2)">
        <span class="row-icon">${icon('book', 20)}</span>
        <span class="row-text"><span class="row-title">Import from Daylio (CSV)</span>
          <span class="row-subtitle">moods, activities and notes — always a merge</span></span>
        ${icon('chevronRight', 18)}
      </button>
    </div>

    ${sectionTitle('Plain export')}
    <div class="card editor-section">
      <p class="small" style="margin-bottom:var(--space-3)">For spreadsheets and portability: CSV (flat) or JSON (full structure).</p>
      <div class="spread">
        ${button('CSV', { kind: 'soft', attrs: 'data-plain="csv"' })}
        ${button('JSON', { kind: 'soft', attrs: 'data-plain="json"' })}
      </div>
    </div>`;

  /* encrypted export */
  root.querySelector('[data-export]').addEventListener('click', () => {
    const pass = root.querySelector('#exp-pass').value;
    if (!pass) { toast(ctx.appEl, 'Choose a password first.'); return; }
    setPref('lastBackupAt', Date.now());
    setPref('backupNoticeDismissed', false);
    toast(ctx.appEl, android ? 'Encrypted. Opening share sheet…' : 'Encrypted. Downloading…');
  });

  root.querySelector('[data-toggle="autoexp"]')?.addEventListener('change', (e) =>
    setPref('autoExport', { ...prefs.autoExport, enabled: e.target.checked }));
  root.querySelectorAll('[data-segment="autosched"]').forEach(b =>
    b.addEventListener('click', () => setPref('autoExport', { ...prefs.autoExport, schedule: b.dataset.value })));

  /* import: picking a file, wrong-password state */
  let filePicked = false;
  root.querySelector('[data-pick-file]').addEventListener('click', () => {
    filePicked = true;
    root.querySelector('#picked-file').textContent = 'alice-journal-2026-08-02.ttbackup';
    root.querySelector('#picked-file').style.color = 'var(--text)';
  });
  root.querySelector('[data-import]').addEventListener('click', () => {
    const err = root.querySelector('#imp-error');
    const pass = root.querySelector('#imp-pass').value;
    if (!filePicked) { err.innerHTML = errorNote('Pick a backup file first.'); return; }
    if (pass !== 'demo') {
      err.innerHTML = errorNote("That password doesn’t unlock this file. Passwords are case-sensitive — check and try again. Nothing was imported.");
      return;
    }
    err.innerHTML = '';
    toast(ctx.appEl, 'Backup restored.');
  });

  /* plain export warning + confirm (F22) */
  root.querySelectorAll('[data-plain]').forEach(b => b.addEventListener('click', () => {
    const fmt = b.dataset.plain.toUpperCase();
    const { close } = sheet(ctx.appEl, `
      <h3>Export unencrypted ${fmt}?</h3>
      <div class="notice notice-danger" style="margin-bottom:var(--space-4)">
        ${icon('alert', 20)}
        <div class="notice-body">
          <span class="notice-title">This file is not encrypted</span>
          Anyone who gets it can read your whole journal. Store it somewhere only you can reach, or use the encrypted export instead.
        </div>
      </div>
      <div class="stack-3">
        ${button(`Export plain ${fmt}`, { kind: 'danger', attrs: 'data-confirm-plain' })}
        ${button('Cancel', { kind: 'ghost', attrs: 'data-cancel-plain' })}
      </div>`);
    ctx.appEl.querySelector('[data-confirm-plain]').addEventListener('click', () => {
      close(); setPref('lastBackupAt', Date.now());
      toast(ctx.appEl, `${fmt} exported.`);
    });
    ctx.appEl.querySelector('[data-cancel-plain]').addEventListener('click', close);
  }));

  /* Daylio import preview (F28) */
  root.querySelector('[data-daylio]').addEventListener('click', () => {
    const { close } = sheet(ctx.appEl, `
      <h3>Import from Daylio</h3>
      <p class="muted small" style="margin-bottom:var(--space-3)">daylio_export_2026-08-01.csv</p>
      <div class="card" style="box-shadow:none;background:var(--surface-2);margin-bottom:var(--space-4)">
        <div class="value-row"><span>Entries found</span><strong>412</strong></div>
        <div class="value-row"><span>Activities → tags</span><strong>18 matched · 5 new in “Imported”</strong></div>
        <div class="value-row"><span>Notes</span><strong>preserved</strong></div>
        <div class="value-row"><span>Photos</span><strong>not in Daylio’s CSV</strong></div>
        <div class="hr"></div>
        <p class="small" style="margin-bottom:var(--space-2)"><strong>Mood mapping</strong></p>
        <div class="value-row"><span>rad → great</span><span>awful → awful</span></div>
        <div class="value-row"><span>good → good</span><span>bad → bad</span></div>
        <div class="value-row"><span>meh → meh</span><span></span></div>
      </div>
      <p class="muted small" style="margin-bottom:var(--space-4)">Imports are always a <strong>merge</strong> — nothing you already logged is touched.</p>
      <div class="stack-3">
        ${button('Import 412 entries', { attrs: 'data-confirm-daylio' })}
        ${button('Cancel', { kind: 'ghost', attrs: 'data-cancel-daylio' })}
      </div>`);
    ctx.appEl.querySelector('[data-confirm-daylio]').addEventListener('click', () => {
      close(); toast(ctx.appEl, '412 entries merged in.');
    });
    ctx.appEl.querySelector('[data-cancel-daylio]').addEventListener('click', close);
  });
}

function errorNote(text) {
  return `
    <div class="notice notice-danger" style="margin-bottom:var(--space-3)" role="alert">
      ${icon('alert', 20)}
      <div class="notice-body">${text}</div>
    </div>`;
}
