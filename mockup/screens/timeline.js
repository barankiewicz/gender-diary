/* Transition timeline (F26) — milestones in chronological order on a
   vertical line; long empty gaps compressed with an inline label. */

import { getState, milestoneStatus, fmtDay, todayEpochDay } from '../demo/state.js';
import { icon } from '../components/icons.js';
import { header, photoThumb, emptyState, esc } from '../components/ui.js';

export function render(root, params, ctx) {
  const state = getState();
  const ms = [...state.milestones].sort((a, b) => a.epochDay - b.epochDay);
  const today = todayEpochDay();

  if (!ms.length) {
    root.innerHTML = `
      ${header('Timeline', { back: '#/home' })}
      ${emptyState({
        riveLabel: 'Empty timeline: a winding path',
        title: 'No milestones yet',
        text: 'Add the days that matter and watch your journey take shape.',
        action: `<a class="btn btn-primary" href="#/milestone-new"><span>Add a milestone</span></a>`,
      })}`;
    return;
  }

  let items = '';
  let prevDay = null;
  let todayInserted = false;
  for (const m of ms) {
    // "You are here" marker between past and future
    if (!todayInserted && prevDay != null && prevDay <= today && m.epochDay > today) {
      items += `
        <div class="tl-item tl-today">
          <span class="tl-dot is-today"></span>
          <div class="tl-body"><span class="tl-name muted small">today — you are here</span></div>
        </div>`;
      todayInserted = true;
    }
    // gap compression: over ~14 months between milestones
    if (prevDay != null && m.epochDay - prevDay > 420) {
      const years = (m.epochDay - prevDay) / 365.25;
      const label = years >= 1.5 ? `${Math.round(years)} years` : `${Math.round((m.epochDay - prevDay) / 30)} months`;
      items += `
        <div class="tl-gap" aria-label="${label} without milestones, compressed">
          <span class="tl-gap-line"></span><span class="tl-gap-label">${label} compressed</span><span class="tl-gap-line"></span>
        </div>`;
    }
    const s = milestoneStatus(m);
    const status = s.type === 'countdown' ? `in ${s.days} day${s.days === 1 ? '' : 's'}`
      : s.type === 'today' ? 'today'
      : `${s.years} year${s.years === 1 ? '' : 's'} ago`;
    items += `
      <div class="tl-item ${m.epochDay > today ? 'is-future' : ''}">
        <span class="tl-dot"></span>
        <div class="tl-body card">
          <div class="spread">
            <span class="tl-name">${esc(m.name)}</span>
            ${m.epochDay > today ? `<span class="tl-count">${status}</span>` : ''}
          </div>
          <span class="tl-date muted small">${fmtDay(m.epochDay, { day: 'numeric', month: 'long', year: 'numeric' })}${m.epochDay <= today ? ' · ' + status : ''}</span>
          ${m.photo ? `<div style="margin-top:var(--space-3)">${photoThumb(m.photo, { size: 88 })}</div>` : ''}
        </div>
      </div>`;
    prevDay = m.epochDay;
  }

  root.innerHTML = `
    ${header('Timeline', {
      back: '#/home',
      action: `<a class="icon-btn" href="#/milestone-new" aria-label="Add milestone">${icon('plus', 22)}</a>`,
    })}
    <p class="muted small" style="margin-bottom:var(--space-5)">Your journey so far — and what’s ahead.</p>
    <div class="timeline">${items}</div>`;
}
