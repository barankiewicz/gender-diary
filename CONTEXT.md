# Gender Diary

A local-first journal for tracking gender transition day by day. All data stays on
the device; there is no server, no account, and no networked concept anywhere in
this glossary.

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
converted, interpreted, or compared to a reference range.

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

### Getting data out

**Archive**:
The versioned, encrypted file produced by export and consumed by import. Holds
journal data and portable preferences only.
_Avoid_: Backup (backup names the habit, not the file), dump, export file

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
