/* App lock (F13) — 4-digit PIN entry with progress dots and keypad;
   biometric unlock is Android-only (hidden in web mode). Any 4-digit PIN
   "unlocks" the demo. Lock-on-leave and quick exit are explained in copy. */

import { getState } from '../demo/state.js';
import { icon } from '../components/icons.js';
import { prideAurora } from '../components/ui.js';

let pin = '';

export function render(root, { params }, ctx) {
  const { prefs } = getState();
  const android = ctx.isAndroid();
  const setup = params.setup === '1';

  root.innerHTML = `
    ${prideAurora()}
    <div class="applock">
      <div class="applock-badge">${icon('lock', 30)}</div>
      <h1 class="ob-title" style="text-align:center">${setup ? 'Choose a PIN' : `Hi${prefs.name ? ', ' + prefs.name : ''}`}</h1>
      <p class="ob-text" style="text-align:center">${setup ? 'Four digits. You will need it every time the app opens.' : 'Enter your PIN to open your journal.'}</p>
      <div class="pin-dots" aria-label="PIN progress: ${pin.length} of 4 digits">
        ${[0, 1, 2, 3].map(i => `<span class="pin-dot ${i < pin.length ? 'is-filled' : ''}"></span>`).join('')}
      </div>
      <div class="pin-pad">
        ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button class="pin-key" data-key="${n}">${n}</button>`).join('')}
        ${android && !setup
          ? `<button class="pin-key is-ghost" data-bio aria-label="Unlock with biometrics">${icon('fingerprint', 26)}</button>`
          : '<span></span>'}
        <button class="pin-key" data-key="0">0</button>
        <button class="pin-key is-ghost" data-backspace aria-label="Delete digit">${icon('backspace', 24)}</button>
      </div>
      ${!setup ? `<p class="muted small" style="text-align:center;margin-top:var(--space-6)">
        ${prefs.lockOnLeave ? 'Locks automatically when the app goes to background. ' : ''}
        ${prefs.quickExit ? 'Two-finger swipe down locks instantly.' : ''}
      </p>` : ''}
    </div>`;

  const unlock = () => {
    pin = '';
    ctx.navigate(setup ? '#/settings' : '#/home');
  };

  root.querySelectorAll('[data-key]').forEach(b => b.addEventListener('click', () => {
    if (pin.length >= 4) return;
    pin += b.dataset.key;
    if (pin.length === 4) { setTimeout(unlock, 250); }
    render(root, { params }, ctx);
  }));
  root.querySelector('[data-backspace]').addEventListener('click', () => {
    pin = pin.slice(0, -1);
    render(root, { params }, ctx);
  });
  root.querySelector('[data-bio]')?.addEventListener('click', unlock);
}
