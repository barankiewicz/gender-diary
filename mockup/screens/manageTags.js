/* Manage tags (F17) — add, rename, reorder, hide/delete tags; custom groups.
   Built-ins hide (history stays); customs delete with confirmation. */

import { getState, mutateTags } from '../demo/state.js';
import { icon } from '../components/icons.js';
import { header, sheet, button, esc } from '../components/ui.js';

export function render(root, params, ctx) {
  const state = getState();

  root.innerHTML = `
    ${header('Manage tags', { back: '#/settings' })}
    <p class="muted small" style="margin-bottom:var(--space-4)">Built-in tags can be hidden — their history stays. Your own tags can be renamed or deleted.</p>
    <div id="groups"></div>
    <div style="margin-top:var(--space-5)">
      ${button('New group', { kind: 'soft', iconName: 'plus', attrs: 'data-new-group' })}
    </div>`;

  const groupsEl = root.querySelector('#groups');
  state.tagGroups.forEach(g => {
    const sec = document.createElement('section');
    sec.className = 'card';
    sec.style.marginBottom = 'var(--space-4)';
    sec.innerHTML = `
      <div class="spread" style="margin-bottom:var(--space-3)">
        <h2 class="editor-heading">${esc(g.name)} ${g.builtIn ? '' : '<span class="muted small">· custom</span>'}</h2>
        <button class="icon-btn" data-add-tag="${g.key}" aria-label="Add tag to ${esc(g.name)}">${icon('plus', 20)}</button>
      </div>
      <div class="managed-tags">
        ${g.tags.map((tg, i) => `
          <div class="managed-tag ${tg.hidden ? 'is-hidden' : ''}">
            <span class="drag-dots" aria-hidden="true">${icon('dots', 14)}</span>
            <span class="managed-label">${esc(tg.label)}</span>
            ${tg.hidden ? '<span class="muted small">hidden</span>' : ''}
            <span class="managed-actions">
              <button class="icon-btn" data-up="${g.key}:${i}" aria-label="Move ${esc(tg.label)} up" ${i === 0 ? 'disabled style="opacity:.3"' : ''}>${icon('chevronLeft', 16)}</button>
              <button class="icon-btn" data-rename="${g.key}:${i}" aria-label="Rename ${esc(tg.label)}">${icon('pencil', 16)}</button>
              ${tg.builtIn
                ? `<button class="icon-btn" data-hide="${g.key}:${i}" aria-label="${tg.hidden ? 'Show' : 'Hide'} ${esc(tg.label)}">${icon(tg.hidden ? 'eye' : 'eyeOff', 16)}</button>`
                : `<button class="icon-btn" data-del="${g.key}:${i}" aria-label="Delete ${esc(tg.label)}">${icon('trash', 16)}</button>`}
            </span>
          </div>`).join('')}
      </div>`;
    groupsEl.appendChild(sec);
  });

  const parse = (v) => { const [k, i] = v.split(':'); return [k, Number(i)]; };

  groupsEl.querySelectorAll('[data-up]').forEach(b => b.addEventListener('click', () => {
    const [k, i] = parse(b.dataset.up);
    mutateTags(gs => { const tags = gs.find(g => g.key === k).tags; [tags[i - 1], tags[i]] = [tags[i], tags[i - 1]]; });
  }));

  groupsEl.querySelectorAll('[data-hide]').forEach(b => b.addEventListener('click', () => {
    const [k, i] = parse(b.dataset.hide);
    mutateTags(gs => { const tg = gs.find(g => g.key === k).tags[i]; tg.hidden = !tg.hidden; });
  }));

  groupsEl.querySelectorAll('[data-rename]').forEach(b => b.addEventListener('click', () => {
    const [k, i] = parse(b.dataset.rename);
    const tg = getState().tagGroups.find(g => g.key === k).tags[i];
    const { close } = sheet(ctx.appEl, `
      <h3>Rename tag</h3>
      <div class="field"><input class="input" id="rename-input" name="rename-input" value="${esc(tg.label)}"></div>
      ${button('Save', { attrs: 'data-save-rename' })}`);
    ctx.appEl.querySelector('[data-save-rename]').addEventListener('click', () => {
      const v = ctx.appEl.querySelector('#rename-input').value.trim();
      close();
      if (v) mutateTags(gs => { gs.find(g => g.key === k).tags[i].label = v; });
    });
  }));

  groupsEl.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
    const [k, i] = parse(b.dataset.del);
    const tg = getState().tagGroups.find(g => g.key === k).tags[i];
    const { close } = sheet(ctx.appEl, `
      <h3>Delete “${esc(tg.label)}”?</h3>
      <p class="muted small" style="margin-bottom:var(--space-4)">This removes the tag from every entry that uses it. Entries themselves are untouched. This cannot be undone.</p>
      <div class="stack-3">
        ${button('Delete tag', { kind: 'danger', attrs: 'data-confirm' })}
        ${button('Keep it', { kind: 'ghost', attrs: 'data-cancel' })}
      </div>`);
    ctx.appEl.querySelector('[data-confirm]').addEventListener('click', () => {
      close();
      mutateTags(gs => { gs.find(g => g.key === k).tags.splice(i, 1); });
    });
    ctx.appEl.querySelector('[data-cancel]').addEventListener('click', close);
  }));

  groupsEl.querySelectorAll('[data-add-tag]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.addTag;
    const { close } = sheet(ctx.appEl, `
      <h3>New tag</h3>
      <div class="field"><input class="input" id="newtag-input" name="newtag-input" placeholder="Tag name"></div>
      ${button('Add tag', { attrs: 'data-save-new' })}`);
    ctx.appEl.querySelector('[data-save-new]').addEventListener('click', () => {
      const v = ctx.appEl.querySelector('#newtag-input').value.trim();
      close();
      if (v) mutateTags(gs => {
        gs.find(g => g.key === k).tags.push({ id: 'custom-' + Date.now(), label: v, builtIn: false, hidden: false });
      });
    });
  }));

  root.querySelector('[data-new-group]').addEventListener('click', () => {
    const { close } = sheet(ctx.appEl, `
      <h3>New group</h3>
      <div class="field"><input class="input" id="newgroup-input" name="newgroup-input" placeholder="Group name"></div>
      ${button('Add group', { attrs: 'data-save-group' })}`);
    ctx.appEl.querySelector('[data-save-group]').addEventListener('click', () => {
      const v = ctx.appEl.querySelector('#newgroup-input').value.trim();
      close();
      if (v) mutateTags(gs => {
        gs.push({ key: 'custom-' + Date.now(), name: v, enabled: true, builtIn: false, tags: [] });
      });
    });
  });
}
