# Stage 2 checklist: Android internal testing

This checklist is for progressive release stage2 and maps one-to-one to the
stage2 evidence fields in docs/progressive-release-record.json.

## Goal

Pass stage2 only after Android internal testing is exercised on:
- API 26
- a current Android version
- at least one device with aggressive background restrictions

## Evidence mapping

Update these fields to true only after the matching run is complete:
- stages.stage2.evidence.androidApi26
- stages.stage2.evidence.androidCurrent
- stages.stage2.evidence.aggressiveBackgroundDevice

## Test run checklist

1. API 26 run
- Install the internal testing build on an API 26 device or emulator.
- Exercise core flows: open app, create entry, save photo, export archive,
  import archive preview, reminder scheduling screen.
- Record outcome in your run notes.
- If all checks pass, set androidApi26 to true.

2. Current Android run
- Install the same build on a current Android version device.
- Exercise the same flows plus notification permission handling and app relaunch.
- Record outcome in your run notes.
- If all checks pass, set androidCurrent to true.

3. Aggressive background restrictions run
- Use a device profile with aggressive battery or background limits.
- Exercise reminder scheduling and verify expected behavior after backgrounding.
- Record outcome in your run notes.
- If all checks pass, set aggressiveBackgroundDevice to true.

## Record updates

After all three runs pass, set:
- stages.stage2.passedAt to an ISO timestamp
- stages.stage2.releaseMatrix.ranAt to the matrix run timestamp used for stage2
- stages.stage2.releaseMatrix.checks.* to true only if that matrix run passed

For channel states, keep as-is at stage2:
- web stays live
- play, obtainium, fdroid remain label-only until later stages

## Validation command

Run:

npm run check:progressive-release -- --file docs/progressive-release-record.json --target stage2

Expected result:
- PASS progressive release record is valid through stage2.
