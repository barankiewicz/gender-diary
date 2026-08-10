# Design decisions (Phase 0)

Every item from the PRD's *Open design decisions* list, what was decided, and
why. Items 1–8 were agreed with the product owner (2026-08-11); the first
review round the same day revised typography, the hero, colour variance, and
motion — those revisions are folded in below. Items marked *proposed* are
judged at mockup review.

## 1. Typography — agreed (revised at review)

- **Baloo 2** (variable: weight 400–800) for display: the "Gender Diary"
  hero, screen titles, big numbers (dimension values, day averages). Chunky
  and rounded — warm personality, zero clinical stiffness. (Fraunces was the
  original pick; the product owner vetoed serifs at review.)
- **Nunito** (variable: weight 200–1000) for everything else: body, UI,
  labels, buttons. Rounded terminals keep it friendly at small sizes.
- Both OFL-licensed (F-Droid safe), bundled as woff2 (~135 KB total,
  latin + latin-ext so Polish renders in the same face), never fetched;
  the two latin files are preloaded.
- Scale: 12 / 14 / 16 (base) / 18 / 21 / 26 / 32 px, body line-height 1.5.
  Weights: 450 regular, 600 medium, 750 bold (variable axis values).

## 2. Palette model — agreed

Per palette × theme, only ~8 hand-picked values: `bg`, `surface`, `surface-2`,
`text`, `text-2`, `border`, `accent`, `accent-2`, plus the flag's
`--motif-stripes`. Everything else derives via `color-mix` in
`tokens/palettes.css`: containers, heat-map ramp (22 / 45 / 70 / 100 % accent),
mood intensity (15–100 %), chart colours, focus ring. Consequences:

- switching palette recolours **everything**, including charts and heat-map;
- **both flag accents work together** (added at review, "more colour
  variance"): mood levels travel across the flag from accent-2 to accent
  (e.g. trans: pink → purple → blue), the FAB and primary buttons wear an
  accent-2→accent gradient (`--grad-accent`), the hero text is
  gradient-clipped, stats charts alternate the two accents, milestone icons
  and the streak chip use the accent-2 container pair;
- the **heat-map stays single-hue intensity** — the PRD forbids judging
  colours there, and a hue ramp on the calendar would read as a scale of
  good/bad days. Mood's pink→blue blend crosses flag colours, not a
  red→green verdict;
- accents are contrast-corrected per theme (flag blue `#5BCEFA` becomes
  `#0F7DAE` on light, `#63C4EE` on dark). Audited: every palette × theme
  passes WCAG AA (body ≥ 4.5:1, accent-on-surface ≥ 3:1, chip text ≥ 4.5:1).
- backgrounds carry a faint tint of the flag hue, so even "neutral" surfaces
  belong to the chosen flag.

## 3. Shape, spacing, elevation — agreed ("soft & warm")

- Radii: 6 (heat cells) / 10 (inputs) / 14 (buttons, rows) / 18 (cards) /
  26 (sheets) / pill (tags, mood, segments). Nothing sharp.
- Spacing on a 4 px base: 4–64.
- Elevation: two soft ambient shadows, never hard borders for hierarchy;
  hairlines only inside grouped lists.
- Touch targets ≥ 44 px throughout.

## 4. Iconography — agreed

Lucide-style 24 px outline icons, 2 px stroke, rounded caps, inlined as SVG and
coloured by tokens (the app uses `lucide-svelte`, ISC license). Icons never
carry meaning alone — navigation and settings rows always pair icon + label.
No emoji anywhere in the UI.

## 5. Core controls — agreed

- **Mood**: a row of five round face buttons (SVG placeholders for the Rive
  state machine). Selection enlarges the face, fills it with that level's
  intensity colour, and bolds the label. Picking the current value clears it.
  Each face is a real button with a screen-reader label.
- **Gender dimensions**: full-width sliders, chunky ring thumb, filled track
  in accent, name + live numeric value above, endpoint labels beneath the
  ends. Untouched dimensions show "—" until moved (logging a value is a
  choice, not a default).
- **Tags**: pill chips grouped under small-caps group names; selected chips
  fill with the accent container colour and gain a check.

## 6. Navigation & layout — agreed

- Phone: bottom tab bar (Home, Calendar, Stats, Settings) with a raised
  central **+** FAB opening the today/another-day chooser as a bottom sheet.
- Desktop (~1024 px+): left rail (brand, New entry button, the four
  destinations) with content in a centred 640 px column; sheets become
  centred dialogs. This *is* the binding desktop adaptation.
- Editors and detail screens are sub-screens with a back arrow; the entry
  editor keeps a sticky save bar above the tab bar.

## 7. Trans-pride motif — agreed ("aurora glow", strengthened at review)

A clearly visible, slowly drifting band of the active flag's stripes
(`--motif-stripes`) glowing behind the Home header (also on onboarding,
recap, and the lock screen): blur 30 px, ~60 % opacity in light / ~42 % in
dark, fading out downward via a mask, animated over 16 s. Pure CSS,
recoloured instantly by the palette. The desktop rail's brand mark is a small
tile of the same stripes.

## 8. Home header — revised at review

The Home screen leads with a **"Gender Diary" hero** in gradient-clipped
display type over the aurora, with a quiet subline carrying the personal bits
("Hi Alice · Tuesday 11 August") and the streak chip. (The original
"Good evening, Alice" greeting-as-headline was dropped by the product owner;
the PRD's name-greeting requirement lives on in the subline.)

## 9. Copy tone — agreed ("warm companion")

Warm, plain, never cheerleading, never clinical. Prompts ask, never nag
("How are you feeling?"); empty states encourage ("Your story starts with one
entry"); confirmations are quiet ("Saved. It counts."); warnings are honest
and concrete ("Anyone who gets this file can read your whole journal").
Observational stats wording — numbers, never judgments. Milestone
celebrations honour the day without grading it ("That day mattered. So does
this one.").

## 10. Motion — expanded at review

The mockup is intentionally alive; every animation below is CSS-only and
collapses to ~1 ms under `prefers-reduced-motion`:

- **Rive stand-ins are animated, not dashed boxes**: mood faces blink and
  pop with a springy overshoot when picked; celebrations rain confetti in
  the two palette accents; empty states and onboarding breathe concentric
  "bloom" rings. Each stage keeps a small dashed "Rive" corner chip marking
  where the real .riv state machine lands (mood faces, milestone
  celebration, empty states, recap finale — F2/F6/F15/F29).
- Lists (entries, cards, milestone scroller) stagger in with a 50 ms cascade
  on arrival — never on in-place re-renders.
- The FAB wears the accent gradient with a soft halo and rotates its + on
  hover; cards lift 2 px; palette swatches tilt when hovered; sheets slide
  up behind a scrim; the aurora drifts.
- Timings 150 / 240 / 380 ms; spring easing reserved for touch feedback
  (mood faces, slider thumb, switches, buttons).

## 11. Sample-data choices worth knowing — proposed

- The demo persona's preset is "Binary trans woman" shown with **two** scales
  (gender feeling + femininity) so the editor demonstrates multi-dimension
  logging; the PRD's example ("euphoria only") remains as the seeded default
  in the app if preferred.
- "Gender feeling" is the display name for the euphoria↔dysphoria axis
  (endpoints still read "dysphoria … euphoria").
- The stale-backup notice is triggered on purpose (sample last backup is
  34 days old); the milestone celebration state is reachable from the
  jump list ("Home · milestone celebration").
