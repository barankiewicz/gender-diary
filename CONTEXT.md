# Gender Diary

A local-first journal for tracking gender transition day by day. There is no
Gender Diary account or application backend. Journal data stays on the device
unless the person deliberately creates or delivers an archive.

## Language

### Journaling

**Journal**:
Everything this device holds about the user's transition: entries, photos,
milestones, vocabulary, lab results and reminders. Reached through one handle bound
to a database driver, which mints identity and owns every invariant; nothing else
touches storage. Portable preferences travel alongside it in an archive but are not
part of it.
_Avoid_: Store (the demo store was a different thing), database (the journal is what
is held, not where)

**Reference data**:
The part of the journal that is bounded at tens of rows and never paginated: gender
dimensions, presets, tag groups and tags, milestones, and preferences. Held in
memory and read synchronously, in contrast to entry data - entries, search, stats,
tag insights, recap - which is unbounded and read a query at a time. The split
decides which screens have a loading state.
_Avoid_: Metadata, lookup data, config

**Entry**:
One logged moment, carrying a mood, gender dimension values, tags, a note, and
photos. A day can hold several. Always holds at least one of those five; an entry
with none of them does not exist.
_Avoid_: Log, record, check-in (a check-in is a daily prompt, not an entry)

**Photo**:
An image belonging to exactly one entry or exactly one milestone, held in
app-private storage and never in the device gallery.

**Epoch day**:
Days since 1970-01-01 in the device's **local** timezone. The day an entry is
*for*, and the unit of calendar cells, milestones, lab results, and stats ranges.
Not a UTC day.
_Avoid_: Date, day index, day number

**Timestamp**:
Epoch milliseconds. The moment within a day, used only to order several entries on
the same epoch day. Never the source of which day an entry belongs to.

**Quick log**:
A mood-only entry saved from Home in one action, for right now.

**Milestone template**:
A built-in suggestion for a milestone, offered by key at creation time. What the
user creates from it is an ordinary milestone.

**Analyte**:
The substance a lab result measures. Carried with a free-text unit and never
interpreted or compared to a reference range. Never converted either, except
for a small built-in allowlist with a fixed physical conversion factor (e.g.
estradiol pg/mL and pmol/L), which may show a secondary converted value
alongside the native one - see ADR 0026. The native value stays primary and
the exception never applies to a free-text or unrecognized unit.

**Lab series**:
One line on a lab chart: the results of one analyte that share a unit. The unit
is the key, trimmed of surrounding whitespace and otherwise left alone, so two
spellings are two series and nothing is ever joined or converted. Results with
no unit form their own series. A key, not a judgement about what a unit means.
_Avoid_: Trend line, chart line, unit group

**Lab draw context**:
Where a lab draw fell relative to dosing, recorded on the result: hours since the
last dose for oral, sublingual, patch and gel, or **day of interval** for an
injection. Derived once, when the result is saved, from the dose log as it stood
then, and not recomputed afterwards - a dose corrected months later must not
rewrite the context on a result someone has already discussed at an appointment.
The one figure in this schema that is stored rather than derived on read, argued
where the columns are defined. Descriptive: it says where a draw fell and never
that one draw time is better than another.
_Avoid_: Trough level, peak level, optimal timing (all judgements this does not
make), draw window

**Day of interval**:
Which day of the current injection interval a draw fell on, counting the
injection day as day 1. Measured from the dose log alone, never from a **regimen
episode**'s free-text interval or from a **dose schedule** - a schedule is
optional, and a figure that needed one would go missing for anyone who logs
injections without setting it. Used instead of an hours figure for IM and SC,
where hours say nothing about a depot with a days-to-weeks half-life.

**Lab provider**:
Which lab drew a result. Free text, exactly as free as an **Analyte**'s unit: no
fixed list, no normalization, and no matching between two spellings of one lab.
_Avoid_: Laboratory name as an identifier, provider id

**Comparability flag**:
A note on a lab chart saying its **Lab series** holds points that were not drawn
under the same conditions - different positions in the dosing interval, different
routes, or different providers. It says so without splitting the series or
refusing to draw it, because the series-folding rule considers only the unit.
Points where a figure is simply absent are not a disagreement.
_Avoid_: Warning, invalid series, unreliable

**Mood**:
One of five discrete levels. Distinct from a gender dimension: it has no endpoint
labels and no configurable range.

### Gender tracking

**Gender dimension**:
One named thing an entry logs a number against, between two labelled ends, within
a range. Built-in or user-defined. Screens say **scale** to the person using the
app; everything the project says to itself says gender dimension.
_Avoid_: Axis, metric (metric means something else here), scale outside
user-facing wording

**Dimension value**:
One entry's number on one gender dimension. Belongs to the entry, not to the
preset that happened to be active when it was logged.

**Gender preset**:
A named set of gender dimensions.

**Active preset**:
The preset whose dimensions the entry editor offers by default. It governs what is
offered, never what an entry already holds.

### Dysphoria and euphoria

**Dysphoria type**:
One of eight named categories (physical, biochemical, social, societal, sexual,
presentational, existential) an entry can be tagged with, naming what kind of hard
day it was rather than just that it was hard.

**Euphoria capture**:
A one-tap tag for what felt right today, the positive counterpart to a dysphoria
type on the same entry.

### HRT and medication

**Regimen episode**:
A drug, ester, dose, route and interval combination as a dated range, in effect
until superseded by the next episode. Every entry, photo, measurement and lab
result is attributable to whichever regimen episode was in effect when it was
logged. Not a preference, portable or device-local: it is attributed data
every other record resolves against by timestamp, not a setting. Not a
Reminder either: a Reminder is a prompt to do something, while a regimen
episode is a record of what has been true since a given day.
_Avoid_: Regimen alone (ambiguous - always a specific, dated episode), prescription

**Dose event**:
One dose taken, skipped or changed, at a real time of day. Its own record type,
not an **Entry**: it carries no mood, dimension values, tags or note. What
fields it has depends on its route - an injection also records a site and a
vehicle, a patch or gel records an application site, and an oral or sublingual
dose records neither. It stores no regimen episode; the one it belongs to is
resolved from its timestamp, so backdating a dose moves it.
_Avoid_: Dose alone (that is the amount, a field on this), injection (only one
of six routes), medication log

**Dose event timestamp**:
The one timestamp in the app that is load-bearing data. An **Entry**'s
Timestamp only orders same-day entries and never decides which day an entry
belongs to; a dose event's says when the dose was actually taken, because
hours-since-last-dose is derived from it and sublingual estradiol peaks in one
to two hours.

**Dose schedule**:
How often one regimen episode expects a dose: every so many days, so many doses
per day. Structured, unlike the episode's own free-text interval, because slots
are generated from it. Counted from the episode's start day, so editing a
schedule does not shift the slots already generated. One per episode.
_Avoid_: Reminder (that is a prompt to act; this expects nothing of the user),
regimen interval

**Dose slot**:
One dose a **dose schedule** expected, on a given day and in a given position
within that day. Nothing stores a slot; they are computed from the schedule for
whatever range is being looked at. A slot is compared against what was logged,
and the comparison is presented without a target rate, a streak or a pass/fail
reading.
_Avoid_: Missed dose (a judgement; a slot with nothing logged is just that)

**Dose pause**:
A dated range on one regimen episode during which no dose is expected, marked
planned or accidental. Its end day may be empty, meaning the pause is still
running. Slots inside a pause are left out of the comparison, so a break does
not read as a run of missed doses. Neither reason is treated as better than the
other.
_Avoid_: Pause alone (ambiguous - always a pause in dosing), break, gap (a gap
is what a dose pause explains), stopping HRT

### Reflection and retrospection

**Wrapped**:
A retrospective screen for a completed week, month or year, built on the same
`recap(fromEpochDay, toEpochDay)` seam as other reporting. Like a recap, nothing
about a wrapped is stored; opening one always recomputes from that range's
entries, milestones and photos.
_Avoid_: Report, summary

**On-this-day**:
A daily retrospective offering what was logged a month, six months or a year
before today. Only ever resurfaces a **good day** (below) - never a bad one.

**Good day**:
The bar a day must clear for on-this-day to resurface it: a day average mood at
or above the mood scale's midpoint, a euphoria capture logged that day, or
either. The rule, not just a definition: on-this-day must never show a day that
doesn't clear this bar.

### Vocabulary and retention

**Tag**:
A selectable label on an entry, belonging to exactly one tag group.
_Avoid_: Activity (Daylio's word, used only when describing Daylio import), label

**Tag group**:
A named, toggleable collection of tags. Turning a group off hides its tags from the
entry editor without touching entries that already carry them.

**Built-in**:
Seeded on first run and identified by a stable key, so the same concept is the same
thing on any device. Its display name is localized.

**Custom**:
Created by the user. Never translated, never reseeded.

**Hidden**:
Removed from every place a user picks things, while every past reference to it
survives. The default meaning of removing a tag or a gender dimension.
_Avoid_: Archived, disabled, deleted, soft-deleted

### Reading the journal back

**Metric**:
The single quantity that colours the Home strip and the calendar heat-map: either
mood or one chosen gender dimension.
_Avoid_: Colour metric, measure, dimension

**Day average**:
A day's metric, averaged across that day's entries, in native units. What a
calendar cell and a stats point stand for on a multi-entry day.

**Range**:
The lowest and highest value a metric can take: mood 1 to 5, a gender dimension
whatever it was defined with. Not the stretch of days a stats chart covers, which
the screens also call a range.
_Avoid_: Scale, bounds

**Native units**:
A value as it was logged, within its metric's own range. What every number shown
to a person is in, including charts, averages and tag insights.

**Normalized value**:
A value rescaled to 0 to 1, used only to drive colour intensity so that metrics
with different ranges shade comparably. Never displayed as a number.

**Streak**:
The run of consecutive epoch days, ending today or yesterday, on which at least
one entry exists. Backdating an entry into a gap repairs it.

**Best streak**:
The longest such run inside a stated range, wherever in the range it falls. What a
recap reports, and a different question from the streak, which always ends at
today. The two were confused once already: the recap showed the current streak
capped at 28.

**Milestone**:
A dated significant day, past or future, kept separately from entries. Whether it
reads as a countdown or an anniversary follows from its date and today; it is not
a stored property of the milestone.
_Avoid_: Event, occasion

**Countdown**:
How a milestone dated in the future presents.

**Anniversary**:
How a milestone dated in the past presents, recurring yearly.

### Care and reminders

**Reminder**:
A recurring or one-off prompt for a medication, injection or appointment, stored as
a rule (wall-clock time plus recurrence) rather than as a next-fire instant.
Android only, though it travels in an archive.

**Check-in**:
The daily prompt to log an entry, skipped on days that already have one. A
preference rather than a reminder: it has no name, no type and no recurrence
choice, and cannot be deleted.

### Privacy and access

**Data key**:
The random key the journal's contents are encrypted under. Never derived from an
access secret: the journal passphrase can wrap it as a portable secret, and a
device-bound mode can wrap it with storage tied to one browser profile or device.
Changing the access mode rewraps the key rather than re-encrypting the journal.
_Avoid_: Master key, database key (it covers photos and side files too)

**Journal passphrase**:
The portable secret that unlocks the encrypted journal after the previous
session has ended, on any installation using passphrase mode. Gender Diary cannot
recover it; it is distinct from both the app-lock PIN and an archive password.
_Avoid_: Master password, account password, PIN

**Device-bound mode**:
The local-only unlock mode with no typed journal passphrase on a cold start. The
key material stays tied to one browser profile or one device, so losing that
profile, that device or the local key can make that local journal copy
unrecoverable.
_Avoid_: Passwordless account, recovery mode, sync

**App lock**:
The PIN or biometric gate that limits casual access through the app. It can provide
shorter access during an unlocked session, but it is not the journal passphrase and
does not provide data-preserving recovery.
_Avoid_: Database password, encryption password

**Conversion**:
Turning a journal written before encryption existed into an encrypted one, on the
device that holds it. A one-time move of a whole journal, not a schema migration and
not an import: it carries every setting the archive format deliberately leaves
behind. It can be interrupted and resumed, and it never destroys the plaintext
journal until the encrypted one has been reopened and verified.
_Avoid_: Migration (that is a schema change), upgrade, import

**Conversion marker**:
The small file recording how far a conversion has got, so a boot after an
interruption knows which of the two journals on the device is the real one. Its
existence is what makes an unfinished conversion tellable from a finished one.
_Avoid_: Lock file, flag, checkpoint

### Getting data out

**Archive**:
The versioned, encrypted file produced by export and consumed by import. Holds
journal data and portable preferences only.
_Avoid_: Backup (backup names the habit, not the file), dump, export file

**Backup**:
The habit and result of keeping an archive outside the current installation so the
journal can be restored after loss. A backup is an immutable snapshot, not a live
or bidirectional copy.
_Avoid_: Sync, replica

**Backup destination**:
The folder or document provider chosen to receive scheduled archives on Android.
It belongs to this installation and never travels in an archive.
_Avoid_: Cloud account, backup server

**Portable preference**:
A setting that describes the journal and travels in an archive: display name,
active preset, metric, palette, theme, language, and the check-in's time.

**Device-local preference**:
A setting that describes this installation and never leaves it: PIN hash, app-lock
and disguise flags, auto-export configuration, last-backup time. New preferences
are device-local unless deliberately added to the portable list.

**Merge**:
An import that adds what this device does not already have, leaving existing rows
alone.

**Replace**:
An import that discards this device's journal data and installs the archive's.
Built-in rows are reconciled by key rather than deleted, and device-local
preferences survive it.

**Folded text**:
Text reduced to its searchable form: lowercased and stripped of Polish letterforms,
including ł, which Unicode decomposition alone does not handle. Both the search
index and the query pass through the same folding.
