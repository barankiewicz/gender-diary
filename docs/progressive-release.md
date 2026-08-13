# Progressive release checks

Ticket 22 splits shipping into stages and asks for evidence at each one. This is
that contract.

## Stage order

1. `stage1` - hosted web beta with the landing site live and truthful
   availability labels.
2. `stage2` - Android internal testing on API 26, a current Android version,
   and at least one device with aggressive background restrictions.
3. `stage3` - Google Play open testing plus the signed GitHub Release APK for
   Obtainium.
4. `stage4` - F-Droid submission after rebuild and dependency checks pass.
5. `stable` - stable release after update, migration, encryption conversion,
   Archive round trip, scheduled backup and rollback are exercised and recorded.

## Matrix requirement

Before every stage, run the full release matrix and record it in that stage's
`releaseMatrix` object:

- `update`
- `migration`
- `encryptionConversion`
- `archiveRoundTrip`
- `scheduledBackup`
- `rollback`

The checker fails if any stage records a matrix run after that stage's `passedAt`
timestamp, or if any matrix check is not `true`.

## Channel go-live rule

Landing-site channel buttons can switch to `live` only after these gates:

- `web` after `stage1`
- `play` after `stage3`
- `obtainium` after `stage3`
- `fdroid` after `stage4`

If a channel is live before its gate, validation fails.

Channel states are explicit:

- `label-only` means the landing site shows availability text and no live button.
- `live` means the landing-site channel button is enabled.

## How to use

Copy the template and record real timestamps and evidence booleans:

```bash
cp docs/progressive-release-record.template.json docs/progressive-release-record.json
```

Validate through a target stage:

```bash
node scripts/check-progressive-release.mjs --file docs/progressive-release-record.json --target stage1
node scripts/check-progressive-release.mjs --file docs/progressive-release-record.json --target stage2
node scripts/check-progressive-release.mjs --file docs/progressive-release-record.json --target stage3
node scripts/check-progressive-release.mjs --file docs/progressive-release-record.json --target stage4
node scripts/check-progressive-release.mjs --file docs/progressive-release-record.json --target stable
```

Each command must pass before marking the stage complete and before making the
next channel button live on the landing site.

## Stage2 execution aid

Use docs/progressive-release-stage2-checklist.md to run and record the Android
internal testing gate that drives stage2 evidence.
