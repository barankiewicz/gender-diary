# Transition Tracker — Phase 0 mockup

The interactive mockup from the PRD's Phase 0. Once approved it is the binding
visual reference for the app: where the PRD text and this mockup disagree, the
mockup wins. Design decisions and their rationale live in [DESIGN.md](DESIGN.md).

## Running it

Plain HTML + CSS + ES modules, no build step, no dependencies, no network
requests. ES modules do not load over `file://`, so serve the folder with any
static file server:

```
cd mockup
python -m http.server 8000
```

then open http://localhost:8000/.

Optional deep-link parameters for review: `?mode=desktop`, `?theme=dark`,
`?palette=nonbinary` (any of the eight palette keys), combinable —
`http://localhost:8000/?mode=desktop&theme=dark#/stats`.

## Demo controls

The bar above the frame (not part of the app): light/dark switch, phone/web
switch, reset demo state, and a jump-to-screen list. Every screen is also
reachable by walking the app's own navigation. The flag-palette picker is *not*
up there — it lives where the real app has it, in Settings → Appearance.

Demo state persists in `sessionStorage` while the tab is open; "Reset demo
state" restores the pristine sample data (the persona "Alice", ~5 months of
entries, milestones, reminders, lab results). "Onboarding (first run)" in the
jump list clears the persona and walks the true first-launch flow.

## Structure → app mapping

The split is deliberate: each folder lifts directly into the app.

| mockup | app (SvelteKit) |
|---|---|
| `tokens/` (fonts, base, palettes) | `src/lib/theme/` — CSS custom properties, verbatim |
| `components/` (controls, display, ui, icons) | `src/lib/components/` — one Svelte component per builder |
| `screens/` | `src/routes/` |
| `demo/state.js` | `src/lib/data/repositories/` + preference stores |
| `demo/sampleData.js` | seed data / test fixtures |
| `app.js` (router + chrome) | SvelteKit layout + navigation shell |

Placeholders: dashed **Rive** blocks mark where Rive assets go (mood faces,
celebrations, empty states, recap finale); gradient tiles stand in for photos.
