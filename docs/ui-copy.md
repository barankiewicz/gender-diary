# How the app talks

Every word a person reads in Gender Diary lives in `messages/en.json` and
`messages/pl.json`. This is how those strings are written, so that a screen added
next month sounds like the screens added last year.

The landing site has its own voice, recorded in
`../gender-diary-landing/.agents/product-marketing.md`. That one has visitors to
convince. This one does not, and the two must not be mixed: a person who is already
inside the app has stopped being an audience.

## Who is talking

One trans person wrote this for other trans people. That is the whole frame.

It is GPLv3 and stays that way, there is no price, no plan and nothing to upsell, so
nothing in here has to sell anything. Say what a screen does and get out of the way.
The project is small and will probably stay small; copy written as though a large
company stood behind it reads as a lie the moment someone checks.

Assume the reader knows what dysphoria is, what a dose is, what a name change costs.
Do not explain their own life to them. Do explain the app: what a button will do,
what it will not undo, where a file went.

## Register

Second person, present tense, sentence case. Contractions are fine. British
spelling, so colour and not color.

Short. A label is one to three words, a hint is one sentence, an explanation is two.
If a third sentence is needed, the screen is probably doing too much.

Warm, but not chirpy and never congratulatory about tracking itself. "Saved. It
counts." is the ceiling. A person logging a bad day does not want to be told they are
doing great.

Say the thing rather than announcing it. No "please note", no "in order to", no
"we've made it easy to".

### Never

- No emoji. No em dashes or en dashes. Straight quotes in the source, typographic
  quotes only where the language calls for them.
- No "we", "us" or "our". There is no company here. When the app has to name itself
  it is "the app" or "Gender Diary", and the honest sentence is usually about what
  nobody can do: "Nobody, including this app, can read it back."
- No medical framing. The app never interprets a value, never marks a number as good
  or bad, never suggests a dose, never mentions a reference range. Labs are the
  person's own numbers and the app's job is to draw them.
- No judgment of either end of a scale. Neither binary nor nonbinary is the better
  end, and no wording may imply one is.
- No praise or shame attached to streaks and gaps. A missed week is not a failure and
  the copy does not name it as one.
- No fake reassurance in front of something irreversible, and no drama either. State
  what will be gone, once, then let the button say what it does.
- No exclamation marks outside a genuine celebration, and at most one there.

## The screens that carry risk

Lock, encryption, export and delete copy is held to a stricter rule than the rest:
the sentence must be exactly as final as the behaviour, in both languages.

**PIN and app lock.** The PIN keeps the app shut to a casual look. It is not
encryption, and no string may suggest it is (ADR-0014). Forgetting it means resetting
the app and losing what is on the device, and the copy says so before it is set, not
after. Wrong attempts throttle. Nothing auto-wipes.

**Journal passphrase.** This one is the wall in front of the data, and the copy may
say so (ADR-0018). It cannot be recovered, there is no account behind it, and the
setup screen recommends a password manager in the same breath.

**Archives.** An encrypted archive is unreadable without its password, including to
whoever wrote the app. A plain CSV or JSON export is readable by anyone who gets the
file, and the sheet in front of it says that plainly rather than gently.

**Deletion and replace.** Name what goes, in the same sentence as the fact that it
cannot be undone.

## Words the app uses

Screens use the words the person sees elsewhere in the app, not the internal ones.
`CONTEXT.md` is the source for the domain; this is only where the two diverge.

| On screen | Never on screen |
| --- | --- |
| scale | gender dimension, axis, metric |
| entry | log, record |
| milestone | event, occasion |
| journal | database, journal handle |
| backup, archive file | dump, snapshot |
| passphrase (the journal), PIN (the app lock) | password, code, passcode |
| photo | image, asset |

"Notes" is left in English in both catalogues. It is the disguise title the app
writes into the tab, and a person looking for it has to see the same word the
operating system shows.

## Polish

The Polish copy is written in Polish. It is not a translation of the English, not
even as a first draft to be smoothed later, because that stays stiff no matter how
many passes it gets. Take from the English only what it claims, then write what a
Polish author would write to say that.

Then run `humanizer-pl` over the result as a check, not as the step that makes it
Polish.

### The reader has no gender here

This is the hard rule, and it is the one an English speaker forgets. Polish verbs and
adjectives inflect for gender, so ordinary second-person copy assigns the reader one.
"Jak się czułaś?" tells a trans man the app was not written for him.

So no gendered form is ever aimed at the reader. In practice:

- Avoid second-person past tense. Ask "Jak było?" instead of "Jak się czułeś".
- Reach for nouns and infinitives where a verb would inflect: "Zapisano", "Dodaj
  wpis", "Bez odzyskiwania".
- Keep the "ty" register throughout. Neutral does not mean formal, and the app never
  switches to "Pan/Pani".
- Scale endpoints are nouns, not adjectives that agree with the reader:
  "niebinarność", not "niebinarna".

Where a sentence cannot be written without gendering the reader, the sentence is
wrong for this app. Rewrite it.

### Polish specifics

- Typography: „cudzysłowy” in that shape, a comma for decimals, a space in thousands.
  No dashes at all, in either language: a comma, a colon or a new sentence does the
  same job, and this rule is why the seven em dashes the catalogues shipped with are
  gone.
- Months, weekdays and language names lowercase.
- Verbs over verbal nouns: "przeanalizuj", not "dokonaj analizy".
- No calques: "na podstawie" and not "w oparciu o", "mieć" and not "posiadać",
  "przez" where "poprzez" adds nothing.
- Do not translate the security wording loosely. „Nie da się tego odzyskać” has to
  stay as final in Polish as it is in English.

### Two overrides, written down rather than left silent

"Kamienie milowe" appears on `humanizer-pl`'s list of AI signatures and stays anyway.
It is the app's own Polish label for milestones and the landing site already uses it,
so a person looking for that screen has to find the same words in both places.

"Notes" stays untranslated, for the reason given above.

## Before adding a string

- Does it exist already? Reuse the key rather than adding a synonym.
- Is the wording final in both languages, or does one of them promise more?
- Does it gender the Polish reader?
- Does it fit in a 390px column and at 200 percent zoom?
- Placeholders and plural forms: Polish needs one, few and many, and a noun injected
  into a sentence will need a case the English never asked for. Split the message per
  case instead of interpolating a bare noun.
