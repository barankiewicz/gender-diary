/* Search (F19) — one query field, live results in the standard entry
   presentation. Matches notes (diacritics-insensitive, prefix) and tag labels. */

import { searchEntries } from '../demo/state.js';
import { t } from '../demo/i18n.js';
import { icon } from '../components/icons.js';
import { header, emptyState } from '../components/ui.js';
import { entryCard } from '../components/display.js';

let lastQuery = '';

export function render(root, params, ctx) {
  root.innerHTML = `
    ${header('Search', { back: '#/calendar' })}
    <div class="search-box">
      ${icon('search', 20)}
      <input class="search-input" id="q" name="q" type="search" placeholder="${t('search_placeholder')}"
        value="${lastQuery}" autocomplete="off" aria-label="Search notes and tags">
    </div>
    <p class="muted small" style="margin:var(--space-2) 0 var(--space-4)">Notes and tags, with or without diacritics — “lozko” finds “łóżko”.</p>
    <div id="results" aria-live="polite"></div>`;

  const q = root.querySelector('#q');
  const results = root.querySelector('#results');

  const paint = () => {
    lastQuery = q.value;
    if (!q.value.trim()) {
      results.innerHTML = `<p class="muted small" style="text-align:center;padding:var(--space-7) 0">Try “euphoria”, “coffee”, or a tag like “therapy”.</p>`;
      return;
    }
    const hits = searchEntries(q.value);
    results.innerHTML = hits.length
      ? `<p class="muted small" style="margin-bottom:var(--space-3)">${hits.length} result${hits.length === 1 ? '' : 's'}</p>`
        + hits.slice(0, 30).map(e => entryCard(e)).join('')
      : emptyState({
          riveLabel: 'No results: a magnifying glass over gentle waves',
          title: 'Nothing found',
          text: `No entries match “${q.value.replace(/</g, '&lt;')}”. Try a shorter word — prefixes match too.`,
        });
  };
  q.addEventListener('input', paint);
  paint();
  q.focus();
}
