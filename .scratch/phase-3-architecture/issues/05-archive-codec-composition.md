# 05 - Archive codec composition

Status: done
Blocked by: none

Archive behavior is currently split across payload typing, packing, journal
snapshot/restore, and format migration helpers. This ticket introduces a
composed codec surface so each archive format version has one explicit encode
and decode contract, with centralized version routing.

## Scope

- Define a codec composition layer where each supported format version has
  explicit encode/decode responsibilities.
- Centralize version routing for archive read/write paths.
- Keep payload migration handling explicit in decode flow for older versions.
- Keep replace/merge import paths and snapshot export paths working through the
  new composed seam.

## Out of scope

- Changing archive encryption primitives or KDF profiles.
- Changing domain semantics of replace vs merge.
- Redesigning plain export formats.

## Acceptance

- [x] Archive encode/decode responsibilities are explicit and composable per
	format version.
- [x] Version dispatch is centralized and used by both read and write paths.
- [x] Format migration steps are invoked through the decode path in a
	verifiable order.
- [x] Round-trip tests prove symmetry for current format payloads.
- [x] Backward-compat tests prove older supported payload versions decode
	correctly through migration.
- [x] Replace and merge import paths continue to pass existing restore tests.
- [x] Existing archive pack/container/journal archive tests remain green.

## Proof before setting done

- [x] Add a verification note summarizing codec map, version routing, and test
	coverage.
- [x] Set `Status: done` only after all acceptance boxes are ticked.

## Verification note

- Codec map: `src/lib/data/archive/codec.ts` defines one explicit codec per
	format version and routes `encodeArchive` to the current codec and
	`decodeArchive` to the matching reader codec.
- Version routing: `src/lib/data/archive/pack.ts` now uses that composed seam
	for both write and read paths, while `decodeArchive` applies payload
	migrations after version-specific decode. `src/lib/data/archive/container.ts`
	now reads the current supported archive version from the codec registry
	instead of carrying an independent version constant.
- Migration-order proof: `src/lib/data/archive/codec.test.ts` verifies decode
	dispatch at the archive version over a real byte-reader payload and then
	checks the migration steps run in order.
- Targeted archive tests run:
	- `npm test -- src/lib/data/archive/codec.test.ts src/lib/data/archive/payload.test.ts src/lib/data/archive/pack.test.ts src/lib/data/journal/archive.test.ts src/lib/data/journal/restore.test.ts`
- Full verification run:
	- `npm run check`
	- `npm test`
