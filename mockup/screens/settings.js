/* Settings (F12) — grouped exactly as specified: Appearance / Tracking /
   Care & reminders / Privacy & data. Includes the flag-palette picker (F15),
   disguise & quick exit (F24), and the About statement. */

import { getState, setPref, getPresets, mutateTags } from '../demo/state.js';
import { t } from '../demo/i18n.js';
import { icon } from '../components/icons.js';
import { header, sectionTitle, listRow, toggle, segmented, sheet, esc } from '../components/ui.js';

const PALETTES = [
  ['trans', 'Transgender'], ['nonbinary', 'Nonbinary'], ['genderfluid', 'Genderfluid'],
  ['bisexual', 'Bisexual'], ['lesbian', 'Lesbian'], ['pansexual', 'Pansexual'],
  ['rainbow', 'Rainbow'], ['agender', 'Agender'],
];

export function render(root, params, ctx) {
  const state = getState();
  const { prefs } = state;
  const preset = getPresets().find(p => p.id === prefs.activePreset);
  const metricName = prefs.colorMetric === 'mood' ? 'Mood'
    : (state.dimensions.find(d => d.key === prefs.colorMetric)?.name ?? 'Mood');
  const isWeb = ctx.isDesktop();

  root.innerHTML = `
    ${header(t('nav_settings'))}

    ${sectionTitle(t('settings_appearance'))}
    <div class="card">
      <p class="field-label" style="margin-bottom:var(--space-3)">Colour palette</p>
      <div class="palette-grid" role="radiogroup" aria-label="Colour palette">
        ${PALETTES.map(([key, name]) => `
          <button class="palette-swatch ${prefs.palette === key ? 'is-active' : ''}" role="radio"
            aria-checked="${prefs.palette === key}" data-palette-pick="${key}">
            <span class="swatch-preview" data-swatch="${key}"></span>
            <span class="swatch-name">${name}</span>
          </button>`).join('')}
      </div>
      <div class="hr"></div>
      <div class="pref-row">
        <span class="row-title">Theme</span>
        ${segmented('theme', [
          { value: 'system', label: 'System' }, { value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' },
        ], prefs.theme)}
      </div>
      <div class="pref-row">
        <span class="row-title">Language</span>
        ${segmented('language', [
          { value: 'system', label: 'System' }, { value: 'en', label: 'English' }, { value: 'pl', label: 'Polski' },
        ], prefs.language)}
      </div>
    </div>

    ${sectionTitle(t('settings_tracking'))}
    <div class="list-group">
      ${listRow({ tag: 'button', iconName: 'heart', title: 'Gender preset', subtitle: esc(preset?.name ?? '—'), trailing: icon('chevronRight', 20) })}
      ${listRow({ href: '#/custom-dimension', iconName: 'stats', title: 'Custom dimension', subtitle: 'define your own scale' })}
      <div class="list-row" style="cursor:default">
        <span class="row-icon">${icon('tag', 22)}</span>
        <span class="row-text"><span class="row-title">Tag groups</span>
          <span class="row-subtitle">choose which groups appear on entries</span></span>
      </div>
      <div class="taggroup-toggles">
        ${state.tagGroups.map(g => `
          <div class="spread taggroup-row">
            <span>${esc(g.name)}</span>
            ${toggle('group-' + g.key, g.enabled, g.name + ' group')}
          </div>`).join('')}
        <a class="manage-tags-link" href="#/manage-tags">Manage tags ${icon('chevronRight', 16)}</a>
      </div>
      ${listRow({ tag: 'button', iconName: 'palette', title: 'Home & calendar colour', subtitle: `coloured by ${esc(metricName)}`, trailing: icon('chevronRight', 20) })}
    </div>

    ${sectionTitle(t('settings_care'))}
    <div class="list-group">
      ${isWeb
        ? listRow({ href: '#/reminders', iconName: 'bell', title: 'Reminders', subtitle: 'reminders need the Android app', trailing: icon('info', 18) })
        : listRow({ href: '#/reminders', iconName: 'bell', title: 'Reminders', subtitle: `${state.reminders.filter(r => r.enabled).length} active · daily check-in ${prefs.checkIn.enabled ? 'on' : 'off'}` })}
      ${listRow({ href: '#/milestone-new', iconName: 'flag', title: 'Milestones', subtitle: `${state.milestones.length} significant days` })}
      ${listRow({ href: '#/photos', iconName: 'image', title: 'Progress photos', subtitle: 'all photos, then vs now' })}
      ${listRow({ href: '#/labs', iconName: 'flask', title: 'Lab results', subtitle: 'your numbers, your trend' })}
    </div>

    ${sectionTitle(t('settings_privacy'))}
    <div class="list-group">
      <div class="list-row" style="cursor:default">
        <span class="row-icon">${icon('lock', 22)}</span>
        <span class="row-text"><span class="row-title">App lock</span>
          <span class="row-subtitle">${prefs.appLock ? 'on · PIN' + (ctx.isAndroid() ? ' + biometrics' : '') : 'off'}
            ${prefs.appLock ? ` · <a href="#/applock" style="color:var(--accent)">try it</a>` : ''}</span></span>
        ${toggle('applock', prefs.appLock, 'App lock')}
      </div>
      ${listRow({ tag: 'button', iconName: 'shield', title: 'Disguise & quick exit', subtitle: prefs.disguise ? 'disguised as “Notes”' : 'off', trailing: `<span data-disguise-open>${icon('chevronRight', 20)}</span>` })}
      ${listRow({ href: '#/export', iconName: 'download', title: 'Export / import', subtitle: prefs.lastBackupAt ? `last backup ${Math.floor((Date.now() - prefs.lastBackupAt) / 86400000)} days ago` : 'no backup yet' })}
      ${listRow({ tag: 'button', iconName: 'info', title: 'About', subtitle: 'GPLv3 · no network requests', trailing: icon('chevronRight', 20) })}
    </div>
    <p class="muted small" style="text-align:center;margin-top:var(--space-5)">Transition Tracker · local-first · your data never leaves this device</p>`;

  /* palette picker — recolours the whole app live (F15) */
  root.querySelectorAll('[data-palette-pick]').forEach(b =>
    b.addEventListener('click', () => setPref('palette', b.dataset.palettePick)));

  /* theme + language segmented controls */
  root.querySelectorAll('[data-segment="theme"]').forEach(b =>
    b.addEventListener('click', () => setPref('theme', b.dataset.value)));
  root.querySelectorAll('[data-segment="language"]').forEach(b =>
    b.addEventListener('click', () => setPref('language', b.dataset.value)));

  /* tag group toggles */
  state.tagGroups.forEach(g => {
    root.querySelector(`[data-toggle="group-${g.key}"]`)?.addEventListener('change', (e) => {
      mutateTags(groups => { groups.find(x => x.key === g.key).enabled = e.target.checked; });
    });
  });

  /* app lock toggle */
  root.querySelector('[data-toggle="applock"]')?.addEventListener('change', (e) => {
    setPref('appLock', e.target.checked);
    if (e.target.checked) ctx.navigate('#/applock?setup=1');
  });

  /* gender preset sheet */
  root.querySelectorAll('.list-row').forEach(row => {
    const title = row.querySelector('.row-title')?.textContent;
    if (title === 'Gender preset') row.addEventListener('click', () => openPresetSheet(ctx));
    if (title === 'Home & calendar colour') row.addEventListener('click', () => openMetricSheet(ctx, state));
    if (title === 'Disguise & quick exit') row.addEventListener('click', () => openDisguiseSheet(ctx));
    if (title === 'About') row.addEventListener('click', () => openAbout(ctx));
  });
}

function openPresetSheet(ctx) {
  const { prefs } = getState();
  const presets = getPresets();
  const { close } = sheet(ctx.appEl, `
    <h3>Gender preset</h3>
    <p class="muted small" style="margin-bottom:var(--space-3)">Chooses which scales appear when you log. Past values are never lost when you switch.</p>
    <div class="list-group" style="box-shadow:none">
      ${presets.map(p => `
        <button class="list-row" data-pick-preset="${p.id}">
          <span class="row-text"><span class="row-title">${esc(p.name)}</span>
            <span class="row-subtitle">${p.dims.length} scale${p.dims.length === 1 ? '' : 's'}${p.builtIn ? '' : ' · custom'}</span></span>
          ${prefs.activePreset === p.id ? icon('check', 20) : ''}
        </button>`).join('')}
      <a class="list-row" href="#/custom-dimension" data-close-sheet>
        <span class="row-icon">${icon('plus', 20)}</span>
        <span class="row-text"><span class="row-title">Custom…</span>
          <span class="row-subtitle">add your own dimension</span></span>
      </a>
    </div>`);
  ctx.appEl.querySelectorAll('[data-pick-preset]').forEach(b =>
    b.addEventListener('click', () => { close(); setPref('activePreset', b.dataset.pickPreset); }));
  ctx.appEl.querySelector('[data-close-sheet]')?.addEventListener('click', () => close());
}

function openMetricSheet(ctx, state) {
  const dims = state.dimensions.filter(d => d.builtIn || true);
  const { close } = sheet(ctx.appEl, `
    <h3>Home & calendar colour</h3>
    <p class="muted small" style="margin-bottom:var(--space-3)">Which metric drives the last-7-days strip and the calendar heat-map.</p>
    <div class="list-group" style="box-shadow:none">
      ${[{ key: 'mood', name: 'Mood' }, ...dims].map(d => `
        <button class="list-row" data-pick-metric="${d.key}">
          <span class="row-text"><span class="row-title">${esc(d.name)}</span></span>
          ${state.prefs.colorMetric === d.key ? icon('check', 20) : ''}
        </button>`).join('')}
    </div>`);
  ctx.appEl.querySelectorAll('[data-pick-metric]').forEach(b =>
    b.addEventListener('click', () => { close(); setPref('colorMetric', b.dataset.pickMetric); }));
}

function openDisguiseSheet(ctx) {
  const { prefs } = getState();
  const android = ctx.isAndroid();
  const { close } = sheet(ctx.appEl, `
    <h3>Disguise & quick exit</h3>
    <div class="stack-3">
      <div class="card spread" style="box-shadow:none;background:var(--surface-2)">
        <span class="row-text"><span class="row-title">Disguise app</span>
          <span class="row-subtitle">${android
            ? 'launcher icon and name become a neutral “Notes” — the app closes briefly to switch'
            : 'browser tab shows a neutral “Notes” title and icon'}</span></span>
        ${toggle('disguise', prefs.disguise, 'Disguise app')}
      </div>
      <div class="disguise-preview ${prefs.disguise ? 'is-on' : ''}">
        <span class="disguise-icon">${icon('book', 22)}</span>
        <span><strong>Notes</strong><br><span class="muted small">${android ? 'how the app appears in your launcher' : 'how the tab appears'}</span></span>
      </div>
      <div class="card spread" style="box-shadow:none;background:var(--surface-2)">
        <span class="row-text"><span class="row-title">Lock on leave</span>
          <span class="row-subtitle">locks the moment the app goes to background${prefs.appLock ? '' : ' · needs app lock on'}</span></span>
        ${toggle('lockleave', prefs.lockOnLeave, 'Lock on leave')}
      </div>
      <div class="card spread" style="box-shadow:none;background:var(--surface-2)">
        <span class="row-text"><span class="row-title">Quick exit</span>
          <span class="row-subtitle">two-finger swipe down locks instantly${android ? '' : ' and swaps the tab to a blank page'}</span></span>
        ${toggle('quickexit', prefs.quickExit, 'Quick exit')}
      </div>
    </div>`);
  ctx.appEl.querySelector('[data-toggle="disguise"]').addEventListener('change', (e) => { close(); setPref('disguise', e.target.checked); });
  ctx.appEl.querySelector('[data-toggle="lockleave"]').addEventListener('change', (e) => setPref('lockOnLeave', e.target.checked));
  ctx.appEl.querySelector('[data-toggle="quickexit"]').addEventListener('change', (e) => setPref('quickExit', e.target.checked));
}

function openAbout(ctx) {
  sheet(ctx.appEl, `
    <h3>About</h3>
    <div class="stack-3">
      <p class="small">Transition Tracker <span class="muted">· version 0.1.0 (mockup)</span></p>
      <p class="small">Free software under the <strong>GPLv3</strong> license. Source code is public.</p>
      <p class="small"><strong>This app makes no network requests.</strong> No account, no cloud, no telemetry, no analytics. Your journal exists only on this device and in backups you export yourself.</p>
    </div>`);
}
