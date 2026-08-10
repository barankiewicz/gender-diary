/* Onboarding (F16) — first launch only: optional name, gender preset,
   optional first milestone from a template, optional app lock.
   No registration, no account — this is the entire first-run experience. */

import { getState, setPref, getPresets, upsertMilestone, todayEpochDay, milestoneTemplates } from '../demo/state.js';
import { icon } from '../components/icons.js';
import { button, rivePlaceholder, toggle, prideAurora, esc } from '../components/ui.js';

let step = 0;
let draft = { name: '', preset: 'p-btw', milestoneTemplate: null, milestoneDate: '', appLock: false };

export function render(root, { params }, ctx) {
  if (params.firstrun === '1' && !render._started) { step = 0; draft = { name: '', preset: 'p-btw', milestoneTemplate: null, milestoneDate: '', appLock: false }; }
  render._started = true;

  const steps = [stepWelcome, stepName, stepPreset, stepMilestone, stepLock, stepDone];
  root.innerHTML = `
    ${prideAurora()}
    <div class="onboarding">
      <div class="onboarding-progress" aria-label="Step ${step + 1} of ${steps.length}">
        ${steps.map((_, i) => `<span class="ob-dot ${i <= step ? 'is-done' : ''}"></span>`).join('')}
      </div>
      <div class="onboarding-body" id="ob-body"></div>
    </div>`;
  steps[step](root.querySelector('#ob-body'), root, ctx);
}

const next = (root, ctx) => { step++; render(root.closest('.screen') || root, { params: {} }, ctx); };

function stepWelcome(body, root, ctx) {
  body.innerHTML = `
    ${rivePlaceholder('Welcome: gentle flag-coloured waves', { height: 160 })}
    <h1 class="ob-title">Welcome</h1>
    <p class="ob-text">A private diary for your transition — moods, gender feelings, milestones, photos. All of it stays <strong>on this device</strong>. No account, no cloud, no tracking.</p>
    <div class="ob-actions">${button("Let’s set it up", { attrs: 'data-next' })}</div>`;
  body.querySelector('[data-next]').addEventListener('click', () => next(root, ctx));
}

function stepName(body, root, ctx) {
  body.innerHTML = `
    <h1 class="ob-title">What should we call you?</h1>
    <p class="ob-text">Only used to greet you. It never leaves this device — skip it if you like.</p>
    <div class="field"><input class="input" id="ob-name" name="ob-name" placeholder="Your name" value="${esc(draft.name)}" autocomplete="off"></div>
    <div class="ob-actions">
      ${button('Continue', { attrs: 'data-next' })}
      ${button('Skip', { kind: 'ghost', attrs: 'data-skip' })}
    </div>`;
  body.querySelector('[data-next]').addEventListener('click', () => { draft.name = body.querySelector('#ob-name').value.trim(); next(root, ctx); });
  body.querySelector('[data-skip]').addEventListener('click', () => { draft.name = ''; next(root, ctx); });
}

function stepPreset(body, root, ctx) {
  const presets = getPresets().filter(p => p.builtIn);
  body.innerHTML = `
    <h1 class="ob-title">How do you want to track gender?</h1>
    <p class="ob-text">A preset chooses which scales appear when you log. You can change or customise this any time in Settings.</p>
    <div class="list-group">
      ${presets.map(p => `
        <button class="list-row" data-preset="${p.id}">
          <span class="row-text"><span class="row-title">${p.name}</span>
          <span class="row-subtitle">${p.dims.length} scale${p.dims.length === 1 ? '' : 's'}</span></span>
          ${draft.preset === p.id ? icon('check', 20) : ''}
        </button>`).join('')}
    </div>
    <div class="ob-actions">${button('Continue', { attrs: 'data-next' })}</div>`;
  body.querySelectorAll('[data-preset]').forEach(b => b.addEventListener('click', () => {
    draft.preset = b.dataset.preset; stepPreset(body, root, ctx);
  }));
  body.querySelector('[data-next]').addEventListener('click', () => next(root, ctx));
}

function stepMilestone(body, root, ctx) {
  const templates = milestoneTemplates.slice(0, 4);
  body.innerHTML = `
    <h1 class="ob-title">Mark a milestone?</h1>
    <p class="ob-text">A day that matters — past or future. Anniversaries come back to celebrate with you; future dates count down.</p>
    <div class="tag-row" style="margin-bottom:var(--space-4)">
      ${templates.map(tp => `
        <button class="tag-chip ${draft.milestoneTemplate === tp.key ? 'is-selected' : ''}" data-tpl="${tp.key}">
          ${draft.milestoneTemplate === tp.key ? icon('check', 14) : ''}${tp.name}
        </button>`).join('')}
    </div>
    ${draft.milestoneTemplate ? `
      <div class="field">
        <label class="field-label" for="ob-mdate">When?</label>
        <input class="input" type="date" id="ob-mdate" name="ob-mdate" value="${draft.milestoneDate}">
      </div>` : ''}
    <div class="ob-actions">
      ${button('Continue', { attrs: 'data-next' })}
      ${button('Not now', { kind: 'ghost', attrs: 'data-skip' })}
    </div>`;
  body.querySelectorAll('[data-tpl]').forEach(b => b.addEventListener('click', () => {
    draft.milestoneTemplate = draft.milestoneTemplate === b.dataset.tpl ? null : b.dataset.tpl;
    stepMilestone(body, root, ctx);
  }));
  body.querySelector('[data-next]').addEventListener('click', () => {
    draft.milestoneDate = body.querySelector('#ob-mdate')?.value || '';
    next(root, ctx);
  });
  body.querySelector('[data-skip]').addEventListener('click', () => { draft.milestoneTemplate = null; next(root, ctx); });
}

function stepLock(body, root, ctx) {
  body.innerHTML = `
    <h1 class="ob-title">Lock the app?</h1>
    <p class="ob-text">A PIN keeps curious eyes out if someone picks up your phone. It gates the app — your data itself stays on the device either way. You can also add biometrics later.</p>
    <div class="card spread">
      <span class="row-text"><span class="row-title">App lock</span><span class="row-subtitle">4-digit PIN${'' /* biometrics offered on Android later */}</span></span>
      ${toggle('ob-lock', draft.appLock, 'App lock')}
    </div>
    <div class="ob-actions">${button('Continue', { attrs: 'data-next' })}</div>`;
  body.querySelector('[data-toggle="ob-lock"]').addEventListener('change', (e) => { draft.appLock = e.target.checked; });
  body.querySelector('[data-next]').addEventListener('click', () => next(root, ctx));
}

function stepDone(body, root, ctx) {
  body.innerHTML = `
    ${rivePlaceholder('Journey start: a path unfolding in flag colours', { height: 140 })}
    <h1 class="ob-title">${draft.name ? `You’re all set, ${esc(draft.name)}` : "You’re all set"}</h1>
    <p class="ob-text">Everything you write stays here, with you. One small check-in a day is plenty.</p>
    <div class="ob-actions">${button('Start your journey', { attrs: 'data-finish' })}</div>`;
  body.querySelector('[data-finish]').addEventListener('click', () => {
    setPref('name', draft.name);
    setPref('activePreset', draft.preset);
    setPref('appLock', draft.appLock);
    if (draft.milestoneTemplate) {
      const tpl = milestoneTemplates.find(t => t.key === draft.milestoneTemplate);
      const epochDay = draft.milestoneDate
        ? Math.floor(Date.parse(draft.milestoneDate + 'T00:00Z') / 86400000)
        : todayEpochDay() - 1;
      upsertMilestone({ name: tpl.name, epochDay, kind: epochDay > todayEpochDay() ? 'countdown' : 'anniversary', templateKey: tpl.key, photo: null });
    }
    step = 0; render._started = false;
    setPref('onboarded', true);
    ctx.navigate('#/home');
  });
}
